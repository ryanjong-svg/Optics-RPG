import { test } from 'node:test';
import assert from 'node:assert/strict';

import { HELP_TOPICS } from '../js/data/helpTopics.js';

test('every help topic has a non-empty title and body', () => {
  for (const topic of HELP_TOPICS) {
    assert.ok(topic.title && topic.title.length > 0, 'a help topic is missing a title');
    assert.ok(topic.body && topic.body.length > 0, `"${topic.title}" is missing body text`);
  }
});

test('help topics have no duplicate titles', () => {
  const titles = HELP_TOPICS.map(t => t.title);
  assert.equal(new Set(titles).size, titles.length);
});
