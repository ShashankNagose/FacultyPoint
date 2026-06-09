const FACULTY_MATERIALS_KEY = 'faculty_materials';
const ASSIGNMENTS_KEY = 'faculty_assignments';
const ASSIGNMENT_SUBMISSIONS_PREFIX = 'assignment_submissions_';
const STUDENT_UPLOADS_PREFIX = 'student_uploads_';
const MENTEE_PROFILE_PREFIX = 'mentee_profile_';
const MENTEE_SUBMISSIONS_KEY = 'mentee_submissions';

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

export const loadFacultyMaterials = () => {
  return safeParse(localStorage.getItem(FACULTY_MATERIALS_KEY)) || [];
};

export const saveFacultyMaterials = (materials) => {
  localStorage.setItem(FACULTY_MATERIALS_KEY, JSON.stringify(materials || []));
};

export const addFacultyMaterial = (material) => {
  const materials = loadFacultyMaterials();
  const entry = {
    id: Date.now(),
    title: material.title,
    drive_link: material.drive_link,
    subject: material.subject || 'General',
    created_at: new Date().toISOString(),
  };
  saveFacultyMaterials([...materials, entry]);
  return entry;
};

export const deleteFacultyMaterial = (materialId) => {
  const materials = loadFacultyMaterials();
  saveFacultyMaterials(materials.filter((material) => material.id !== materialId));
};

export const loadAssignments = () => {
  return safeParse(localStorage.getItem(ASSIGNMENTS_KEY)) || [];
};

export const saveAssignments = (assignments) => {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments || []));
};

export const addAssignment = (assignment) => {
  const assignments = loadAssignments();
  const entry = {
    id: Date.now(),
    title: assignment.title,
    subject: assignment.subject || 'General',
    description: assignment.description,
    due_date: assignment.due_date || null,
    created_at: new Date().toISOString(),
  };
  saveAssignments([...assignments, entry]);
  return entry;
};

export const deleteAssignment = (assignmentId) => {
  const assignments = loadAssignments();
  saveAssignments(assignments.filter((assignment) => assignment.id !== assignmentId));
  localStorage.removeItem(`${ASSIGNMENT_SUBMISSIONS_PREFIX}${assignmentId}`);
};

export const loadAssignmentSubmissions = (assignmentId) => {
  if (!assignmentId) return [];
  return safeParse(localStorage.getItem(`${ASSIGNMENT_SUBMISSIONS_PREFIX}${assignmentId}`)) || [];
};

export const saveAssignmentSubmissions = (assignmentId, submissions) => {
  if (!assignmentId) return;
  localStorage.setItem(`${ASSIGNMENT_SUBMISSIONS_PREFIX}${assignmentId}`, JSON.stringify(submissions || []));
};

export const addAssignmentSubmission = (assignmentId, submission) => {
  if (!assignmentId) return null;
  const submissions = loadAssignmentSubmissions(assignmentId);
  const filtered = submissions.filter((item) => item.student_id !== submission.student_id);
  const entry = {
    ...submission,
    submitted_at: new Date().toISOString(),
  };
  saveAssignmentSubmissions(assignmentId, [...filtered, entry]);
  return entry;
};

export const loadStudentUploads = (studentId) => {
  if (!studentId) return [];
  return safeParse(localStorage.getItem(`${STUDENT_UPLOADS_PREFIX}${studentId}`)) || [];
};

export const saveStudentUploads = (studentId, uploads) => {
  if (!studentId) return;
  localStorage.setItem(`${STUDENT_UPLOADS_PREFIX}${studentId}`, JSON.stringify(uploads || []));
};

export const addStudentUpload = (studentId, upload) => {
  if (!studentId) return null;
  const uploads = loadStudentUploads(studentId);
  const entry = {
    id: Date.now(),
    title: upload.title,
    drive_link: upload.drive_link,
    created_at: new Date().toISOString(),
  };
  saveStudentUploads(studentId, [...uploads, entry]);
  return entry;
};

export const loadMenteeProfile = (studentId) => {
  if (!studentId) return null;
  return safeParse(localStorage.getItem(`${MENTEE_PROFILE_PREFIX}${studentId}`)) || null;
};

export const saveMenteeProfile = (studentId, profile) => {
  if (!studentId) return null;
  localStorage.setItem(`${MENTEE_PROFILE_PREFIX}${studentId}`, JSON.stringify(profile));
  return profile;
};

export const upsertMenteeProfile = (studentId, profile) => {
  const current = loadMenteeProfile(studentId) || {};
  const entry = {
    ...current,
    ...profile,
    student_id: studentId,
    updated_at: new Date().toISOString(),
  };
  saveMenteeProfile(studentId, entry);
  return entry;
};

export const loadMenteeSubmissions = () => {
  return safeParse(localStorage.getItem(MENTEE_SUBMISSIONS_KEY)) || [];
};

export const saveMenteeSubmissions = (submissions) => {
  localStorage.setItem(MENTEE_SUBMISSIONS_KEY, JSON.stringify(submissions || []));
};

export const addMenteeSubmission = (submission) => {
  const entries = loadMenteeSubmissions();
  const entry = {
    id: Date.now(),
    student_id: submission.student_id,
    student_name: submission.student_name || submission.student_id,
    issue_type: submission.issue_type,
    issue_detail: submission.issue_detail,
    submitted_date: submission.submitted_date || new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
  };
  saveMenteeSubmissions([...entries, entry]);
  return entry;
};
