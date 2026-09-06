import { PROTECTED_PROTOCOLS } from '../shared/constants.js';

/**
 * Checks if a given URL or protocol is a protected browser system URL that cannot be blocked.
 * @param {string} urlString
 * @returns {boolean}
 */
export function isProtectedUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim().toLowerCase();
  for (const protocol of PROTECTED_PROTOCOLS) {
    if (trimmed.startsWith(protocol)) return true;
  }
  return false;
}

/**
 * Checks if a URL is valid and blockable by the extension.
 * @param {string} urlString
 * @returns {boolean}
 */
export function isBlockableUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;
  if (isProtectedUrl(urlString)) return false;

  let url;
  try {
    url = new URL(urlString.includes('://') ? urlString : `http://${urlString}`);
  } catch {
    return false;
  }

  // Must be http:, https:, or ws:, wss:
  if (!['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol)) {
    return false;
  }

  // Check valid hostname
  const hostname = url.hostname.trim();
  if (!hostname || hostname === '.') return false;

  return true;
}

/**
 * Extracts and cleans hostname from a raw URL.
 * @param {string} urlString
 * @returns {string|null}
 */
export function extractHostname(urlString) {
  if (!urlString || typeof urlString !== 'string') return null;
  if (isProtectedUrl(urlString)) return null;

  try {
    const url = new URL(urlString.includes('://') ? urlString : `http://${urlString}`);
    let host = url.hostname.toLowerCase();
    if (host.startsWith('www.')) {
      host = host.slice(4);
    }
    return host || null;
  } catch {
    return null;
  }
}

/**
 * Normalizes domain string: removes protocol, www, trailing slashes, spaces.
 * @param {string} input
 * @returns {string}
 */
export function normalizeDomain(input) {
  if (!input || typeof input !== 'string') return '';
  let str = input.trim().toLowerCase();
  
  // Strip protocol
  str = str.replace(/^[a-z]+:\/\//i, '');
  
  // Strip port and path for pure domain
  str = str.split('/')[0].split('?')[0].split('#')[0];
  str = str.split(':')[0]; // remove port

  // Strip leading www.
  if (str.startsWith('www.')) {
    str = str.slice(4);
  }

  return str;
}

/**
 * Validates and normalizes user input for blocking rule.
 * Supported matchModes: 'domain' | 'path' | 'keyword'
 * @param {string} input
 * @param {'domain'|'path'|'keyword'} [mode='domain']
 * @returns {{ valid: boolean, error?: string, normalized: string, matchMode: string }}
 */
export function parseRuleInput(input, mode = 'domain') {
  if (!input || typeof input !== 'string' || !input.trim()) {
    return { valid: false, error: 'Empty input', normalized: '', matchMode: mode };
  }

  const trimmed = input.trim();

  if (isProtectedUrl(trimmed)) {
    return { valid: false, error: 'Cannot block browser system pages', normalized: '', matchMode: mode };
  }

  if (mode === 'keyword') {
    // Keyword mode: simple string, min 2 chars, max 50 chars, no slashes or spaces
    const cleanKw = trimmed.toLowerCase();
    if (cleanKw.length < 2) {
      return { valid: false, error: 'Keyword must be at least 2 characters', normalized: '', matchMode: 'keyword' };
    }
    if (cleanKw.length > 50) {
      return { valid: false, error: 'Keyword too long (max 50 characters)', normalized: '', matchMode: 'keyword' };
    }
    return { valid: true, normalized: cleanKw, matchMode: 'keyword' };
  }

  if (mode === 'path') {
    // Domain with specific path, e.g. youtube.com/shorts or https://reddit.com/r/all
    let urlStr = trimmed;
    if (!urlStr.includes('://')) {
      urlStr = `http://${urlStr}`;
    }

    try {
      const parsed = new URL(urlStr);
      let host = parsed.hostname.toLowerCase();
      if (host.startsWith('www.')) host = host.slice(4);

      let pathname = parsed.pathname;
      if (pathname.endsWith('/') && pathname.length > 1) {
        pathname = pathname.slice(0, -1);
      }

      if (!host) {
        return { valid: false, error: 'Invalid domain in path', normalized: '', matchMode: 'path' };
      }

      const normalized = `${host}${pathname}${parsed.search}`;
      return { valid: true, normalized, matchMode: 'path' };
    } catch {
      return { valid: false, error: 'Invalid URL/path format', normalized: '', matchMode: 'path' };
    }
  }

  // Default mode: 'domain'
  const domain = normalizeDomain(trimmed);
  if (!domain) {
    return { valid: false, error: 'Invalid domain name', normalized: '', matchMode: 'domain' };
  }

  // Validate domain format (allow localhost, valid IP, valid domain with TLD or single word localhost)
  const isLocalhost = domain === 'localhost';
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);
  const isValidHost = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(domain);

  if (!isLocalhost && !isIp && !isValidHost) {
    return { valid: false, error: 'Invalid domain format', normalized: '', matchMode: 'domain' };
  }

  return { valid: true, normalized: domain, matchMode: 'domain' };
}
