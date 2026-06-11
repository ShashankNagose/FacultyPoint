const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const getApiFileUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_ORIGIN}${url}`;
};

const request = async (path, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: isFormData
      ? { ...(options.headers || {}) }
      : {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || 'Unable to complete the request.');
  }

  return data;
};

export const loadFacultyMaterials = () => request('/materials');

const createFileFormData = (fields, file) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  if (file) formData.append('file', file);
  return formData;
};

export const addFacultyMaterial = (material) => request('/materials', {
  method: 'POST',
  body: createFileFormData({
    title: material.title,
    subject: material.subject || 'General',
  }, material.file),
});

export const deleteFacultyMaterial = (materialId) => request(`/materials/${materialId}`, {
  method: 'DELETE',
});

export const loadAssignments = () => request('/assignments');

export const addAssignment = (assignment) => request('/assignments', {
  method: 'POST',
  body: createFileFormData({
    title: assignment.title,
    subject: assignment.subject || 'General',
    description: assignment.description,
    due_date: assignment.due_date || null,
  }, assignment.file),
});

export const deleteAssignment = (assignmentId) => request(`/assignments/${assignmentId}`, {
  method: 'DELETE',
});

export const loadAssignmentSubmissions = (assignmentId) => {
  if (!assignmentId) return Promise.resolve([]);
  return request(`/assignments/${assignmentId}/submissions`);
};

export const addAssignmentSubmission = (assignmentId, submission) => {
  if (!assignmentId) return Promise.resolve(null);
  return request(`/assignments/${assignmentId}/submissions`, {
    method: 'POST',
    body: createFileFormData({
      student_id: submission.student_id,
    }, submission.file),
  });
};

export const loadStudentUploads = (studentId) => {
  if (!studentId) return Promise.resolve([]);
  return request(`/students/${studentId}/uploads`);
};

export const addStudentUpload = (studentId, upload) => {
  if (!studentId) return Promise.resolve(null);
  return request(`/students/${studentId}/uploads`, {
    method: 'POST',
    body: createFileFormData({
      title: upload.title,
      assignment_id: upload.assignment_id || null,
    }, upload.file),
  });
};

export const loadMenteeProfile = (studentId) => {
  if (!studentId) return Promise.resolve(null);
  return request(`/mentees/${studentId}/profile`);
};

export const upsertMenteeProfile = (studentId, profile) => {
  if (!studentId) return Promise.resolve(null);
  return request(`/mentees/${studentId}/profile`, {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
};

export const loadMenteeSubmissions = () => request('/mentees/submissions');

export const addMenteeSubmission = (submission) => request('/mentees/submissions', {
  method: 'POST',
  body: JSON.stringify(submission),
});
