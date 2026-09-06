import { getPriority } from './rulePriorities.js';

/**
 * Builds a Declarative Net Request (DNR) rule object.
 * @param {Object} options
 * @param {number} options.id - Numeric rule ID
 * @param {string} options.value - Domain, path, or keyword
 * @param {'domain'|'path'|'keyword'} [options.matchMode='domain']
 * @param {'block'|'allow'} [options.type='block']
 * @param {'ALLOW'|'STRICT_FOCUS'|'FOCUS'|'PERMANENT'|'SCHEDULE'} [options.category='PERMANENT']
 * @param {string} [options.reason='block_list'] - e.g. 'focus', 'schedule', 'block_list'
 * @returns {chrome.declarativeNetRequest.Rule}
 */
export function buildDnrRule({
  id,
  value,
  matchMode = 'domain',
  type = 'block',
  category = 'PERMANENT',
  reason = 'block_list'
}) {
  const priority = getPriority(category);
  const resourceTypes = ['main_frame', 'sub_frame'];

  let urlFilter;
  if (matchMode === 'keyword') {
    urlFilter = `*${value.trim().toLowerCase()}*`;
  } else if (matchMode === 'path') {
    const cleanPath = value.trim().replace(/^[a-z]+:\/\//i, '').replace(/^www\./i, '');
    urlFilter = `||${cleanPath}*`;
  } else {
    // domain
    const cleanDomain = value.trim().replace(/^[a-z]+:\/\//i, '').replace(/^www\./i, '');
    urlFilter = `||${cleanDomain}^`;
  }

  const condition = {
    urlFilter,
    resourceTypes,
  };

  if (type === 'allow') {
    return {
      id,
      priority: getPriority('ALLOW'),
      action: {
        type: 'allow',
      },
      condition,
    };
  }

  // Redirect to extension's blocked.html
  const encodedUrl = encodeURIComponent(value);
  const encodedReason = encodeURIComponent(reason);
  const extensionPath = `/blocked.html?url=${encodedUrl}&reason=${encodedReason}`;

  return {
    id,
    priority,
    action: {
      type: 'redirect',
      redirect: {
        extensionPath,
      },
    },
    condition,
  };
}
