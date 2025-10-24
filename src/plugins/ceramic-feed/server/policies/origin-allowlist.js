'use strict';

const { PolicyError } = require('@strapi/utils').errors;

const DEFAULT_ALLOWLIST = [
  'http://localhost:3000',
  'http://localhost:1337',
  'http://127.0.0.1:1337',
  'http://0.0.0.0:1337',
  'https://localhost:3000',
  'https://localhost:1337',
  'https://127.0.0.1:1337',
];

const getHeader = (ctx, name) => {
  const headers = ctx.request?.headers;
  if (!headers) {
    return undefined;
  }

  const lower = name.toLowerCase();
  return headers[lower];
};

const getOriginFromHeaders = ctx => {
  const origin = getHeader(ctx, 'origin');
  if (origin) {
    return origin;
  }

  const referer = getHeader(ctx, 'referer');
  if (!referer) {
    return null;
  }

  try {
    const url = new URL(referer);
    return url.origin;
  } catch {
    return null;
  }
};

module.exports = (policyContext, policyConfig, { strapi }) => {
  const allowed =
    policyConfig?.origins ??
    strapi.config.get(
      'plugin.ceramic-feed.allowedOrigins',
      DEFAULT_ALLOWLIST
    );

  const requestOrigin = getOriginFromHeaders(policyContext);

  if (!requestOrigin) {
    return true;
  }

  if (allowed.includes(requestOrigin)) {
    return true;
  }

  throw new PolicyError('Origin not allowed for posts endpoint');
};
