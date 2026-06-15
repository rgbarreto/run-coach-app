import crypto from 'crypto';
import oauthSignature from 'oauth-sign';

/**
 * Generates OAuth 1.0a Authorization Header for Garmin APIs
 * 
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} url - Target URL
 * @param {object} params - Query or body parameters to include in signature
 * @param {string} consumerKey - Garmin Consumer Key
 * @param {string} consumerSecret - Garmin Consumer Secret
 * @param {string} [token] - User OAuth token (optional for request_token step)
 * @param {string} [tokenSecret] - User OAuth token secret (optional for request_token step)
 * @returns {string} Compiled Authorization Header
 */
export function generateOAuthHeader(
  method,
  url,
  params = {},
  consumerKey,
  consumerSecret,
  token = '',
  tokenSecret = ''
) {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: '1.0',
    ...params
  };

  if (token) {
    oauthParams.oauth_token = token;
  }

  // Generate signature
  const signature = oauthSignature.sign(
    oauthParams,
    consumerSecret,
    tokenSecret,
    method,
    url
  );

  oauthParams.oauth_signature = signature;

  // Compile Header
  const headerParts = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${encodeURIComponent(key)}="${encodeURIComponent(val)}"`);

  return `OAuth ${headerParts.join(', ')}`;
}
