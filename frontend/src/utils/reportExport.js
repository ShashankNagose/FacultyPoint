export const buildAssignmentReportRows = (assignmentTitle, students = []) => {
  return students.map((student, index) => ({
    srno: index + 1,
    'roll no': student.student_id || '',
    name: student.name || '',
    assignment: assignmentTitle || 'Assessment',
    remark: student.submitted ? 'Submitted' : 'Pending',
  }));
};

export const buildMenteeReportRows = (records = []) => {
  return records.map((record, index) => {
    const profile = record.profile || {};
    const notes = (record.submissions || []).map((entry) => `${entry.issue_type || 'note'}: ${entry.issue_detail || ''} (${entry.submitted_date || ''})`.trim());

    return {
      srno: index + 1,
      'roll no': record.student_id || '',
      name: record.name || '',
      contact: profile.contact || '',
      'father\'s contact': profile.father_contact || '',
      'mother\'s contact': profile.mother_contact || '',
      'aadhaar number': profile.aadhaar_number || '',
      address: profile.address || '',
      'scholarship details': profile.scholarship_details || '',
      'mentoring notes': notes.join(' | '),
    };
  });
};

export const exportReportToExcel = async (fileName, sheetName, rows) => {
  try {
    const XLSX = (await import('xlsx')).default || (await import('xlsx'));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Report');
    XLSX.writeFile(workbook, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
    return true;
  } catch (error) {
    console.error('Excel export failed:', error);
    return false;
  }
};
