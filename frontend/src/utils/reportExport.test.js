import test from 'node:test';
import assert from 'node:assert/strict';

import { buildAssignmentReportRows, buildMenteeReportRows } from './reportExport.js';

test('builds assignment report rows with the requested columns', () => {
  const rows = buildAssignmentReportRows('Data Science', [
    { student_id: '26505075', name: 'Abha Pote', submitted: true, drive_link: 'https://example.test' },
  ]);

  assert.deepEqual(rows[0], {
    srno: 1,
    'roll no': '26505075',
    name: 'Abha Pote',
    assignment: 'Data Science',
    remark: 'Submitted',
  });
});

test('builds mentee report rows with family and profile details', () => {
  const rows = buildMenteeReportRows([
    {
      student_id: '26505075',
      name: 'Abha Pote',
      profile: { father_contact: '111', mother_contact: '222', aadhaar_number: '333', address: 'Nagpur', scholarship_details: 'Yes' },
      submissions: [{ issue_type: 'requirement', issue_detail: 'Book', submitted_date: '2026-06-09' }],
    },
  ]);

  assert.deepEqual(rows[0], {
    srno: 1,
    'roll no': '26505075',
    name: 'Abha Pote',
    contact: '',
    'father\'s contact': '111',
    'mother\'s contact': '222',
    'aadhaar number': '333',
    address: 'Nagpur',
    'scholarship details': 'Yes',
    'mentoring notes': 'requirement: Book (2026-06-09)',
  });
});
