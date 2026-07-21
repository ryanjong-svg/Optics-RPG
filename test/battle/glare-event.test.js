import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  GLARE_EVENT_ZONES, maybeTriggerGlareEvent, glareEventActive, decrementGlareEvent
} from '../../js/engine/battle/battleFormulas.js';

function makeState() {
  return { flags: { glareEvent: null } };
}

test('maybeTriggerGlareEvent: never triggers outside the designated glare zones', () => {
  const state = makeState();
  const triggered = maybeTriggerGlareEvent(state, 'village', 0);
  assert.equal(triggered, false);
  assert.equal(state.flags.glareEvent, null);
});

test('maybeTriggerGlareEvent: triggers in a glare zone when the roll beats the odds', () => {
  const state = makeState();
  const triggered = maybeTriggerGlareEvent(state, 'prism', 0);
  assert.equal(triggered, true);
  assert.ok(state.flags.glareEvent);
  assert.equal(state.flags.glareEvent.zone, 'prism');
  assert.ok(state.flags.glareEvent.battlesLeft > 0);
});

test('maybeTriggerGlareEvent: does not trigger when the roll misses the odds', () => {
  const state = makeState();
  const triggered = maybeTriggerGlareEvent(state, 'prism', 0.999);
  assert.equal(triggered, false);
  assert.equal(state.flags.glareEvent, null);
});

test('maybeTriggerGlareEvent: does not stack or restart a currently-active event', () => {
  const state = makeState();
  maybeTriggerGlareEvent(state, 'prism', 0);
  const before = { ...state.flags.glareEvent };
  const triggeredAgain = maybeTriggerGlareEvent(state, 'prism', 0);
  assert.equal(triggeredAgain, false);
  assert.deepEqual(state.flags.glareEvent, before);
});

test('GLARE_EVENT_ZONES: covers both spectrum-themed zones', () => {
  assert.ok(GLARE_EVENT_ZONES.includes('prism'));
  assert.ok(GLARE_EVENT_ZONES.includes('prism_deep'));
});

test('glareEventActive: false with no event, true only for the matching zone', () => {
  const state = makeState();
  assert.equal(glareEventActive(state, 'prism'), false);
  maybeTriggerGlareEvent(state, 'prism', 0);
  assert.equal(glareEventActive(state, 'prism'), true);
  assert.equal(glareEventActive(state, 'prism_deep'), false);
});

test('decrementGlareEvent: counts down and clears itself once spent', () => {
  const state = makeState();
  maybeTriggerGlareEvent(state, 'prism', 0);
  const total = state.flags.glareEvent.battlesLeft;
  for (let i = 0; i < total - 1; i++) {
    decrementGlareEvent(state);
    assert.ok(state.flags.glareEvent, `should still be active after ${i + 1} decrement(s)`);
  }
  decrementGlareEvent(state);
  assert.equal(state.flags.glareEvent, null);
});

test('decrementGlareEvent: is a safe no-op when there is no active event', () => {
  const state = makeState();
  decrementGlareEvent(state);
  assert.equal(state.flags.glareEvent, null);
});
