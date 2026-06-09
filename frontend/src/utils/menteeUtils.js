export const MENTEE_ROLL_START = 26505075;
export const MENTEE_ROLL_END = 26505110;

export const isMenteeRoll = (studentId) => {
  const value = Number(String(studentId || '').trim());
  return Number.isFinite(value) && value >= MENTEE_ROLL_START && value <= MENTEE_ROLL_END;
};

export const getMenteeLabel = (studentId) => (isMenteeRoll(studentId) ? 'Mentee' : 'Student');

export const filterMenteeRecords = (records, query = '') => {
  const term = String(query || '').trim().toLowerCase();

  if (!term) {
    return records;
  }

  return records.filter((record) => {
    const name = String(record?.name || '').toLowerCase();
    const studentId = String(record?.student_id || '').toLowerCase();
    return name.includes(term) || studentId.includes(term);
  });
};
