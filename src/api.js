import Parser from 'rss-parser';
import { BASE_RSS_URL, TOPICS, DEFAULT_OPTIONS } from './constants.js';

const parser = new Parser({
  customFields: {
    item: ['source']
  }
});

/**
 * Normalizes an RSS item into a clean article object.
 */
function normalizeItem(item) {
  let title = item.title || '';
  let source = '';

  // Google News titles usually end with " - Publisher Name"
  const lastDashIndex = title.lastIndexOf(' - ');
  if (lastDashIndex !== -1) {
    source = title.substring(lastDashIndex + 3).trim();
    title = title.substring(0, lastDashIndex).trim();
  }

  // If source custom tag exists
  if (item.source && typeof item.source === 'string') {
    source = item.source;
  } else if (item.source && item.source._) {
    source = item.source._;
  }

  return {
    title,
    source: source || 'Google News',
    link: item.link || '',
    pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
    isoDate: item.isoDate || (item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString()),
    snippet: item.contentSnippet || ''
  };
}

/**
 * Builds standard Google News query parameters.
 */
function buildQueryParams(options = {}) {
  const hl = options.hl || DEFAULT_OPTIONS.hl;
  const gl = options.gl || DEFAULT_OPTIONS.gl;
  const ceid = options.ceid || DEFAULT_OPTIONS.ceid;
  return `hl=${encodeURIComponent(hl)}&gl=${encodeURIComponent(gl)}&ceid=${encodeURIComponent(ceid)}`;
}

/**
 * Fetches and parses an RSS feed from a URL.
 */
export async function fetchFeed(url, limit = DEFAULT_OPTIONS.limit) {
  try {
    const feed = await parser.parseURL(url);
    const items = (feed.items || []).map(normalizeItem);
    return limit && limit > 0 ? items.slice(0, limit) : items;
  } catch (error) {
    throw new Error(`Failed to fetch Google News feed: ${error.message}`);
  }
}

/**
 * Fetches top global/regional headlines.
 */
export async function fetchTopHeadlines(options = {}) {
  const query = buildQueryParams(options);
  const url = `${BASE_RSS_URL}?${query}`;
  return fetchFeed(url, options.limit);
}

/**
 * Fetches headlines by topic (e.g., TECHNOLOGY, BUSINESS, SCIENCE).
 */
export async function fetchTopicHeadlines(topicInput, options = {}) {
  const normalizedKey = (topicInput || '').toLowerCase().trim();
  const topicCode = TOPICS[normalizedKey] || topicInput.toUpperCase();
  const query = buildQueryParams(options);
  const url = `${BASE_RSS_URL}/headlines/section/topic/${encodeURIComponent(topicCode)}?${query}`;
  return fetchFeed(url, options.limit);
}

/**
 * Fetches headlines matching a search query.
 */
export async function fetchSearchHeadlines(searchQuery, options = {}) {
  if (!searchQuery || !searchQuery.trim()) {
    throw new Error('Search query cannot be empty.');
  }
  const queryParams = buildQueryParams(options);
  const url = `${BASE_RSS_URL}/search?q=${encodeURIComponent(searchQuery)}&${queryParams}`;
  return fetchFeed(url, options.limit);
}
