import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  ZONE_WEATHER, maybeTriggerZoneWeather, zoneWeatherActive, zoneWeatherBonus, decrementZoneWeather
} from '../../js/engine/battle/battleFormulas.js';

function makeState() {
  return { flags: { zoneWeather: null } };
}

test('ZONE_WEATHER: glare covers both spectrum-themed zones and boosts polarize_filter', () => {
  assert.deepEqual(ZONE_WEATHER.glare.zones, ['prism', 'prism_deep']);
  assert.equal(ZONE_WEATHER.glare.ability, 'polarize_filter');
});

test('ZONE_WEATHER: fog covers both fiber zones and boosts tir_shield', () => {
  assert.deepEqual(ZONE_WEATHER.fog.zones, ['fiber', 'fiber_deep']);
  assert.equal(ZONE_WEATHER.fog.ability, 'tir_shield');
});

test('maybeTriggerZoneWeather: never triggers outside any designated weather zone', () => {
  const state = makeState();
  const triggered = maybeTriggerZoneWeather(state, 'village', 0);
  assert.equal(triggered, null);
  assert.equal(state.flags.zoneWeather, null);
});

test('maybeTriggerZoneWeather: triggers the right type for a glare zone when the roll beats the odds', () => {
  const state = makeState();
  const triggered = maybeTriggerZoneWeather(state, 'prism', 0);
  assert.equal(triggered, 'glare');
  assert.equal(state.flags.zoneWeather.type, 'glare');
  assert.equal(state.flags.zoneWeather.zone, 'prism');
  assert.ok(state.flags.zoneWeather.battlesLeft > 0);
});

test('maybeTriggerZoneWeather: triggers the right type for a fog zone when the roll beats the odds', () => {
  const state = makeState();
  const triggered = maybeTriggerZoneWeather(state, 'fiber_deep', 0);
  assert.equal(triggered, 'fog');
  assert.equal(state.flags.zoneWeather.type, 'fog');
  assert.equal(state.flags.zoneWeather.zone, 'fiber_deep');
});

test('maybeTriggerZoneWeather: does not trigger when the roll misses the odds', () => {
  const state = makeState();
  const triggered = maybeTriggerZoneWeather(state, 'prism', 0.999);
  assert.equal(triggered, null);
  assert.equal(state.flags.zoneWeather, null);
});

test('maybeTriggerZoneWeather: does not stack or restart a currently-active event, even of a different type', () => {
  const state = makeState();
  maybeTriggerZoneWeather(state, 'prism', 0);
  const before = { ...state.flags.zoneWeather };
  const triggeredAgain = maybeTriggerZoneWeather(state, 'fiber', 0);
  assert.equal(triggeredAgain, null);
  assert.deepEqual(state.flags.zoneWeather, before);
});

test('zoneWeatherActive: false with no event, true only for the matching zone', () => {
  const state = makeState();
  assert.equal(zoneWeatherActive(state, 'prism'), false);
  maybeTriggerZoneWeather(state, 'prism', 0);
  assert.equal(zoneWeatherActive(state, 'prism'), true);
  assert.equal(zoneWeatherActive(state, 'prism_deep'), false);
  assert.equal(zoneWeatherActive(state, 'fiber'), false);
});

test('zoneWeatherBonus: only applies to the ability the active weather type is tied to', () => {
  const state = makeState();
  maybeTriggerZoneWeather(state, 'prism', 0); // glare -> polarize_filter
  assert.equal(zoneWeatherBonus(state, 'prism', 'polarize_filter'), ZONE_WEATHER.glare.bonus);
  assert.equal(zoneWeatherBonus(state, 'prism', 'tir_shield'), 0);
});

test('zoneWeatherBonus: zero once outside the weather\'s own zone', () => {
  const state = makeState();
  maybeTriggerZoneWeather(state, 'fiber', 0); // fog -> tir_shield
  assert.equal(zoneWeatherBonus(state, 'fiber', 'tir_shield'), ZONE_WEATHER.fog.bonus);
  assert.equal(zoneWeatherBonus(state, 'fiber_deep', 'tir_shield'), 0, 'fog rolled in fiber, not fiber_deep, so it should not apply there');
});

test('decrementZoneWeather: counts down and clears itself once spent', () => {
  const state = makeState();
  maybeTriggerZoneWeather(state, 'prism', 0);
  const total = state.flags.zoneWeather.battlesLeft;
  for (let i = 0; i < total - 1; i++) {
    decrementZoneWeather(state);
    assert.ok(state.flags.zoneWeather, `should still be active after ${i + 1} decrement(s)`);
  }
  decrementZoneWeather(state);
  assert.equal(state.flags.zoneWeather, null);
});

test('decrementZoneWeather: is a safe no-op when there is no active event', () => {
  const state = makeState();
  decrementZoneWeather(state);
  assert.equal(state.flags.zoneWeather, null);
});
