'use strict'

const { sanitize } = require('@strapi/utils')
const { contentAPI } = sanitize

const MODEL_UID = 'plugin::ceramic-feed.ceramic-post'
const TAG_FIELD_MAP = {
  publishwallet: 'publishWallet',
  publishwalletv2: 'publishWalletV2',
  publishdapp: 'publishDapp'
}

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10)
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed
  }
  return fallback
}

const buildFilters = ({ tagField, context }) => {
  const clauses = [{ publishedAt: { $notNull: true } }]

  if (tagField) {
    clauses.push({ [tagField]: true })
  }

  if (context) {
    clauses.push({
      $or: [{ context }, { context: { $null: true } }, { context: '' }]
    })
  }

  if (clauses.length === 1) {
    return clauses[0]
  }

  return { $and: clauses }
}

module.exports = {
  async find(ctx) {
    const { query = {} } = ctx.request
    const rawTag = Array.isArray(query.tag) ? query.tag[0] : query.tag
    const rawContext = Array.isArray(query.context)
      ? query.context[0]
      : query.context

    const normalizedTag =
      typeof rawTag === 'string' ? rawTag.trim().toLowerCase() : null
    const tagField = normalizedTag ? TAG_FIELD_MAP[normalizedTag] : null

    if (normalizedTag && !tagField) {
      ctx.throw(400, `Unsupported tag filter '${rawTag}'`)
    }

    const contextFilter =
      typeof rawContext === 'string' && rawContext.trim().length
        ? rawContext.trim()
        : null

    const page = toPositiveInt(query.page, 1)
    const pageSize = Math.min(toPositiveInt(query.pageSize, 10), 50)
    const filters = buildFilters({ tagField, context: contextFilter })

    const offset = (page - 1) * pageSize

    const [entries, total] = await Promise.all([
      strapi.entityService.findMany(MODEL_UID, {
        filters,
        sort: { publishedAt: 'desc' },
        populate: {
          picture: true,
          sponsored: true
        },
        start: offset,
        limit: pageSize
      }),
      strapi.db.query(MODEL_UID).count({ where: filters })
    ])

    const schema = strapi.getModel(MODEL_UID)
    const sanitized = await contentAPI.output(entries, schema, {
      auth: ctx.state.auth
    })

    const pluginConfig = strapi.config.get('plugin.ceramic-feed', {})
    const defaultContext = pluginConfig.orbisContext || null

    const data = sanitized.map(post => ({
      ...post,
      context: post.context ?? defaultContext
    }))

    const pageCount = Math.ceil(total / pageSize)
    const nextPage = page < pageCount ? page + 1 : null
    const prevPage = page > 1 ? page - 1 : null

    ctx.set(
      'Cache-Control',
      'public, max-age=3600, s-maxage=3600, stale-while-revalidate=3600'
    )
    ctx.set('Vary', 'Origin')
    ctx.body = {
      data,
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount,
          total,
          nextPage,
          prevPage
        },
        filters: {
          context: contextFilter,
          tag: rawTag ?? null
        }
      }
    }
  }
}
