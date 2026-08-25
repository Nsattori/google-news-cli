import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchTopHeadlines, fetchTopicHeadlines, fetchSearchHeadlines } from '../src/api.js';
import { TOPICS } from '../src/constants.js';

test('fetchTopHeadlines returns articles with expected schema', async () => {
  const articles = await fetchTopHeadlines({ limit: 3 });
  assert.ok(Array.isArray(articles));
  assert.ok(articles.length > 0 && articles.length <= 3);

  const first = articles[0];
  assert.ok(typeof first.title === 'string' && first.title.length > 0);
  assert.ok(typeof first.source === 'string');
  assert.ok(typeof first.link === 'string' && first.link.startsWith('http'));
  assert.ok(first.pubDate instanceof Date);
});

test('fetchTopicHeadlines returns articles for technology', async () => {
  const articles = await fetchTopicHeadlines('tech', { limit: 2 });
  assert.ok(Array.isArray(articles));
  assert.ok(articles.length > 0 && articles.length <= 2);
  assert.ok(articles[0].title);
});

test('fetchSearchHeadlines returns articles for a search term', async () => {
  const articles = await fetchSearchHeadlines('technology', { limit: 2 });
  assert.ok(Array.isArray(articles));
  assert.ok(articles.length > 0 && articles.length <= 2);
});

test('fetchSearchHeadlines rejects empty query', async () => {
  await assert.rejects(
    async () => {
      await fetchSearchHeadlines('');
    },
    /Search query cannot be empty/
  );
});
