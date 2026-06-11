import { VALID_STUDENTS, STUDENT_NAMES } from '../../../frontend/src/config.js';
import Student from '../models/Student.js';

const isMenteeRoll = (studentId) => {
  const roll = Number(studentId);
  return roll >= 26505075 && roll <= 26505110;
};

export async function seedStudents() {
  const operations = VALID_STUDENTS.map((studentId) => ({
    updateOne: {
      filter: { student_id: studentId },
      update: {
        $set: {
          student_id: studentId,
          name: STUDENT_NAMES[studentId] || studentId,
          is_mentee: isMenteeRoll(studentId)
        }
      },
      upsert: true
    }
  }));

  if (operations.length > 0) {
    await Student.bulkWrite(operations);
  }
}
