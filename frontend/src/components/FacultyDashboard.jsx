import React, { useState, useEffect } from 'react';
import { VALID_STUDENTS, STUDENT_NAMES } from '../config';
import {
  addFacultyMaterial,
  loadFacultyMaterials,
  deleteFacultyMaterial,
  addAssignment,
  loadAssignments,
  deleteAssignment,
  loadAssignmentSubmissions,
} from '../utils/storage';

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState('materials');
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [materialForm, setMaterialForm] = useState({ title: '', drive_link: '', subject: '' });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', subject: '', description: '', due_date: '' });
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMaterials(loadFacultyMaterials());
    setAssignments(loadAssignments());
  }, []);

  useEffect(() => {
    if (selectedAssignmentId) {
      setAssignmentSubmissions(loadAssignmentSubmissions(selectedAssignmentId));
    }
  }, [selectedAssignmentId]);

  const refreshMaterials = () => setMaterials(loadFacultyMaterials());
  const refreshAssignments = () => setAssignments(loadAssignments());

  const handleDeleteMaterial = (materialId) => {
    deleteFacultyMaterial(materialId);
    refreshMaterials();
    setFeedback('Note deleted successfully.');
  };

  const handleDeleteAssignment = (assignmentId) => {
    deleteAssignment(assignmentId);
    refreshAssignments();
    if (selectedAssignmentId === assignmentId) {
      setSelectedAssignmentId(null);
      setAssignmentSubmissions([]);
      setActiveTab('assignments');
    }
    setFeedback('Assignment deleted successfully.');
  };

  const handleMaterialSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!materialForm.title.trim() || !materialForm.drive_link.trim()) {
      setError('Please enter both a title and a Google Drive link.');
      return;
    }

    addFacultyMaterial({
      title: materialForm.title.trim(),
      drive_link: materialForm.drive_link.trim(),
      subject: materialForm.subject.trim() || 'General',
    });

    setMaterialForm({ title: '', drive_link: '', subject: '' });
    refreshMaterials();
    setFeedback('Shared successfully. Your note is now visible on the Study Material page.');
  };

  const handleAssignmentSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!assignmentForm.title.trim() || !assignmentForm.description.trim()) {
      setError('Please provide both assignment title and description.');
      return;
    }

    addAssignment({
      title: assignmentForm.title.trim(),
      subject: assignmentForm.subject.trim() || 'General',
      description: assignmentForm.description.trim(),
      due_date: assignmentForm.due_date || null,
    });

    setAssignmentForm({ title: '', subject: '', description: '', due_date: '' });
    refreshAssignments();
    setActiveTab('assignments');
    setFeedback('Assignment created successfully. It is now visible on Home and Study Material.');
  };

  const handleSelectAssignment = (assignmentId) => {
    setSelectedAssignmentId(assignmentId);
    setActiveTab('submissions');
  };

  const selectedAssignment = assignments.find((assignment) => assignment.id === selectedAssignmentId);

  const assignmentStatusList = VALID_STUDENTS.map((studentId) => {
    const submission = assignmentSubmissions.find((item) => item.student_id === studentId);
    return {
      student_id: studentId,
      name: STUDENT_NAMES[studentId] || studentId,
      submitted: Boolean(submission),
      drive_link: submission?.drive_link || null,
    };
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-3xl font-semibold text-slate-900">Faculty Dashboard</h2>
          <p className="mt-3 text-slate-600">
            Create assignments, share notes, and verify which students submitted each assessment.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {['materials', 'assignments', 'submissions'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab === 'materials' ? 'Share Notes' : tab === 'assignments' ? 'Create Assignment' : 'Submission Tracker'}
              </button>
            ))}
          </div>

          {feedback && <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{feedback}</div>}
          {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          {activeTab === 'materials' && (
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
                <h3 className="text-2xl font-semibold text-slate-900 mb-6">Upload new Google Drive note</h3>
                <form onSubmit={handleMaterialSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Title</label>
                    <input
                      value={materialForm.title}
                      onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      placeholder="Example: Week 1 Notes"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Subject</label>
                    <input
                      value={materialForm.subject}
                      onChange={(e) => setMaterialForm({ ...materialForm, subject: e.target.value })}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      placeholder="Example: Machine Learning"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Google Drive Link</label>
                    <input
                      value={materialForm.drive_link}
                      onChange={(e) => setMaterialForm({ ...materialForm, drive_link: e.target.value })}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      placeholder="https://drive.google.com/..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-3xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
                  >
                    Share Note
                  </button>
                </form>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
                <h3 className="text-2xl font-semibold text-slate-900 mb-6">Your shared notes</h3>
                {materials.length === 0 ? (
                  <p className="text-slate-600">No shared notes yet. Add a Google Drive link to see it here and on Study Material.</p>
                ) : (
                  <div className="space-y-4">
                    {materials.map((material) => (
                      <div key={material.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-slate-500">{material.subject}</p>
                            <h4 className="mt-2 text-lg font-semibold text-slate-900">{material.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={material.drive_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-800"
                            >
                              Open Drive Link
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
                <h3 className="text-2xl font-semibold text-slate-900 mb-6">Create new assignment</h3>
                <form onSubmit={handleAssignmentSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Assignment Title</label>
                    <input
                      value={assignmentForm.title}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      placeholder="Example: Data Science Assessment"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Subject</label>
                    <input
                      value={assignmentForm.subject}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, subject: e.target.value })}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      placeholder="Example: Machine Learning"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                    <textarea
                      value={assignmentForm.description}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      rows="5"
                      placeholder="Add instructions, expectations, or assessment details..."
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Due Date</label>
                    <input
                      type="date"
                      value={assignmentForm.due_date}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-3xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
                  >
                    Create Assignment
                  </button>
                </form>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
                <h3 className="text-2xl font-semibold text-slate-900 mb-6">Published assignments</h3>
                {assignments.length === 0 ? (
                  <p className="text-slate-600">No assignments created yet. Create one to publish it to Home and Study Material.</p>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-slate-500">{assignment.subject}</p>
                            <h4 className="mt-2 text-lg font-semibold text-slate-900">{assignment.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectAssignment(assignment.id)}
                              className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-800"
                            >
                              View Submissions
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAssignment(assignment.id)}
                              className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-2">{assignment.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
              <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">Submission Tracker</h3>
                  <p className="mt-2 text-slate-600">
                    Select an assignment to see which students have submitted their drive links.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Total students: {VALID_STUDENTS.length}
                </div>
              </div>

              {assignments.length === 0 ? (
                <p className="text-slate-600">No assignments exist yet. Create one first to track submissions.</p>
              ) : (
                <div className="space-y-8">
                  <div className="grid gap-4 md:grid-cols-2">
                    {assignments.map((assignment) => (
                      <button
                        key={assignment.id}
                        type="button"
                        onClick={() => handleSelectAssignment(assignment.id)}
                        className={`rounded-3xl border px-5 py-4 text-left transition ${
                          selectedAssignmentId === assignment.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <p className="text-sm text-slate-500">{assignment.subject}</p>
                        <h4 className="mt-2 text-lg font-semibold text-slate-900">{assignment.title}</h4>
                      </button>
                    ))}
                  </div>

                  {!selectedAssignment ? (
                    <p className="text-slate-600">Choose an assignment above to display all student submission statuses.</p>
                  ) : (
                    <div className="space-y-6">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{selectedAssignment.subject}</p>
                            <h4 className="mt-2 text-2xl font-semibold text-slate-900">{selectedAssignment.title}</h4>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="text-sm text-slate-600">Due: {selectedAssignment.due_date || 'No due date'}</p>
                            <p className="text-sm text-slate-600">Submitted: {assignmentSubmissions.length} / {VALID_STUDENTS.length}</p>
                          </div>
                        </div>
                        <p className="mt-4 text-slate-700">{selectedAssignment.description}</p>
                      </div>

                      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-4">
                        <table className="min-w-full border-collapse text-left text-sm text-slate-700">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-100">
                              <th className="px-4 py-3">Student</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Drive Link</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assignmentStatusList.map((student) => (
                              <tr key={student.student_id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-slate-900">{student.name}</div>
                                  <div className="text-xs text-slate-500">{student.student_id}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${student.submitted ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                    {student.submitted ? 'Submitted' : 'Pending'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 break-words">
                                  {student.submitted ? (
                                    <a href={student.drive_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                      View link
                                    </a>
                                  ) : (
                                    <span className="text-slate-500">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
