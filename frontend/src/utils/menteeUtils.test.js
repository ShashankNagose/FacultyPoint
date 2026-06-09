import test from 'node:test';
import assert from 'node:assert/strict';

import { isMenteeRoll, getMenteeLabel, filterMenteeRecords } from './menteeUtils.js';

test('detects the mentoring roll range', () => {
  assert.equal(isMenteeRoll('26505074'), false);
  assert.equal(isMenteeRoll('26505075'), true);
  assert.equal(isMenteeRoll('26505110'), true);
  assert.equal(isMenteeRoll('26505111'), false);
});

test('labels mentee accounts for the faculty view', () => {
  assert.equal(getMenteeLabel('26505080'), 'Mentee');
  assert.equal(getMenteeLabel('26505111'), 'Student');
});

test('filters mentee records by name or roll number', () => {
  const records = [
    { student_id: '26505075', name: 'Abha Pote' },
    { student_id: '26505080', name: 'Janhavi Sawarkar' },
  ];

  assert.equal(filterMenteeRecords(records, 'abha').length, 1);
  assert.equal(filterMenteeRecords(records, '26505080').length, 1);
  assert.equal(filterMenteeRecords(records, 'unknown').length, 0);
});
