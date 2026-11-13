const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseDate, calculateAPY, parseAmount } = require('../web/calculator.js');
const start = parseDate('13-11-2026');
const end = parseDate('13-11-2027');

test('matches the desktop example and handles zero and complete loss', () => {
  assert.ok(Math.abs(calculateAPY(start, end, 660, 30).apy - 30 / 660) < 1e-12);
  assert.equal(calculateAPY(start, end, 660, 0).apy, 0);
  assert.equal(calculateAPY(start, end, 660, -660).apy, -1);
  assert.ok(Math.abs(calculateAPY(start, end, 660, -30).apy + 30 / 660) < 1e-12);
});
test('annualizes shorter periods with compounding', () => {
  assert.ok(Math.abs(calculateAPY(start, parseDate('23-11-2026'), 100, 1).apy - (1.01 ** 36.5 - 1)) < 1e-12);
});
test('parses years and rejects invalid calendar dates', () => {
  assert.equal(parseDate('27-06-17').getUTCFullYear(), 2017);
  assert.equal(parseDate('01-01-0001').getUTCFullYear(), 1);
  for (const value of ['29-02-2025', '31-04-2026', '00-01-2026', '01-13-2026', '01-01-0000', '2026-11-13']) assert.throws(() => parseDate(value));
  assert.equal(parseDate('29-02-2024').getUTCDate(), 29);
});
test('counts leap days and daylight-saving boundaries as calendar days', () => {
  assert.equal(calculateAPY(parseDate('28-02-2024'), parseDate('01-03-2024'), 100, 1).days, 2);
  assert.equal(calculateAPY(parseDate('28-03-2026'), parseDate('30-03-2026'), 100, 1).days, 2);
});
test('rejects invalid periods, amounts, losses, and overflow', () => {
  for (const [p, r] of [[0, 1], [-1, 1], [Infinity, 1], [100, NaN], [100, -101]]) assert.throws(() => calculateAPY(start, end, p, r));
  assert.throws(() => calculateAPY(start, start, 100, 1));
  assert.throws(() => calculateAPY(end, start, 100, 1));
  assert.throws(() => calculateAPY(start, parseDate('14-11-2026'), 1, 1e100));
  for (const value of ['', ' ', '1,000', '£20', '0x10', 'NaN']) assert.throws(() => parseAmount(value));
  assert.equal(parseAmount(' -30.5 '), -30.5);
});
