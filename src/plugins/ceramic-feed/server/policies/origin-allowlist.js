'use strict'

const { PolicyError } = require('@strapi/utils').errors
const { DEFAULT_ALLOWED_ORIGINS } = require('../config/defaults')

const getHeader = (ctx, name) => {
  const headers = ctx.request?.headers
  if (!headers) {
    return undefined
  }

  const lower = name.toLowerCase()
  return headers[lower]
}

const getOriginFromHeaders = ctx => {
  const origin = getHeader(ctx, 'origin')
  if (origin) {
    return origin
  }

  const referer = getHeader(ctx, 'referer')
  if (!referer) {
    return null
  }

  try {
    const url = new URL(referer)
    return url.origin
  } catch {
    return null
  }
}

const allowlistPolicy = (policyContext, policyConfig, { strapi }) => {
  const allowed =
    policyConfig?.origins ??
    strapi.config.get(
      'plugin.ceramic-feed.allowedOrigins',
      DEFAULT_ALLOWED_ORIGINS
    )

  const requestOrigin = getOriginFromHeaders(policyContext)

  if (!requestOrigin) {
    return false
  }

  if (allowed.includes(requestOrigin)) {
    return true
  }

  throw new PolicyError(
    `Origin "${requestOrigin}" not allowed for posts endpoint`
  )
}

module.exports = allowlistPolicy
