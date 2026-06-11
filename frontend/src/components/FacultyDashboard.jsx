import React, { useState, useEffect, useMemo } from 'react';
import { VALID_STUDENTS, STUDENT_NAMES } from '../config';
import {
  addFacultyMaterial,
  loadFacultyMaterials,
  deleteFacultyMaterial,
  addAssignment,
  loadAssignments,
  deleteAssignment,
  loadAssignmentSubmissions,
  loadMenteeProfile,
  loadMenteeSubmissions,
  getApiFileUrl,
} from '../utils/storage';
import { isMenteeRoll, getMenteeLabel, filterMenteeRecords } from '../utils/menteeUtils';
import { buildAssignmentReportRows, buildMenteeReportRows, exportReportToExcel } from '../utils/reportExport';

const ACCEPTED_UPLOADS = 'image/*,.pdf,.zip';
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

const validateUploadFile = (file) => {
  if (!file) return 'Please select an image, PDF, or ZIP file.';
  if (file.size > MAX_UPLOAD_SIZE) return 'File must be less than 5 MB.';
  return null;
};

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState('materials');
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [menteeRecords, setMenteeRecords] = useState([]);
  const [menteeSearch, setMenteeSearch] = useState('');
  const [materialForm, setMaterialForm] = useState({ title: '', subject: '', file: null });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', subject: '', description: '', due_date: '', file: null });
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    refreshMaterials();
    refreshAssignments();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadSubmissions = async () => {
      if (selectedAssignmentId) {
        const submissions = await loadAssignmentSubmissions(selectedAssignmentId);
        if (isMounted) setAssignmentSubmissions(submissions);
      }
    };

    loadSubmissions().catch((err) => {
      console.error('Error loading submissions:', err);
      if (isMounted) setAssignmentSubmissions([]);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedAssignmentId]);

  useEffect(() => {
    let isMounted = true;

    const loadMentees = async () => {
      if (activeTab === 'mentees') {
        const [profiles, submissions] = await Promise.all([
          Promise.all(VALID_STUDENTS.filter((studentId) => isMenteeRoll(studentId)).map((studentId) => loadMenteeProfile(studentId))),
          loadMenteeSubmissions(),
        ]);

        if (!isMounted) return;

        const menteeIds = VALID_STUDENTS.filter((studentId) => isMenteeRoll(studentId));
        const records = menteeIds.map((studentId, index) => ({
          student_id: studentId,
          name: STUDENT_NAMES[studentId] || studentId,
          label: getMenteeLabel(studentId),
          profile: profiles[index],
          submissions: submissions.filter((item) => item.student_id === studentId),
        }));
        setMenteeRecords(records);
      }
    };

    loadMentees().catch((err) => {
      console.error('Error loading mentee records:', err);
      if (isMounted) setError('Unable to load mentee records at the moment.');
    });

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const refreshMaterials = async () => {
    try {
      setMaterials(await loadFacultyMaterials());
    } catch (err) {
      console.error('Error loading materials:', err);
      setError('Unable to load shared notes.');
    }
  };

  const refreshAssignments = async () => {
    try {
      setAssignments(await loadAssignments());
    } catch (err) {
      console.error('Error loading assignments:', err);
      setError('Unable to load assignments.');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    setError(null);
    setFeedback(null);
    try {
      await deleteFacultyMaterial(materialId);
      await refreshMaterials();
      setFeedback('Note deleted successfully.');
    } catch (err) {
      console.error('Error deleting material:', err);
      setError('Unable to delete the note right now.');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    setError(null);
    setFeedback(null);
    try {
      await deleteAssignment(assignmentId);
      await refreshAssignments();
      if (selectedAssignmentId === assignmentId) {
        setSelectedAssignmentId(null);
        setAssignmentSubmissions([]);
        setActiveTab('assignments');
      }
      setFeedback('Assignment deleted successfully.');
    } catch (err) {
      console.error('Error deleting assignment:', err);
      setError('Unable to delete the assignment right now.');
    }
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    const fileError = validateUploadFile(materialForm.file);
    if (!materialForm.title.trim() || fileError) {
      setError(!materialForm.title.trim() ? 'Please enter a title.' : fileError);
      return;
    }

    try {
      await addFacultyMaterial({
        title: materialForm.title.trim(),
        subject: materialForm.subject.trim() || 'General',
        file: materialForm.file,
      });

      setMaterialForm({ title: '', subject: '', file: null });
      e.target.reset();
      await refreshMaterials();
      setFeedback('Uploaded successfully. Your note is now visible on the Study Material page.');
    } catch (err) {
      console.error('Error saving material:', err);
      setError('Unable to share the note right now.');
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!assignmentForm.title.trim() || !assignmentForm.description.trim()) {
      setError('Please provide both assignment title and description.');
      return;
    }

    try {
      const fileError = assignmentForm.file ? validateUploadFile(assignmentForm.file) : null;
      if (fileError) {
        setError(fileError);
        return;
      }

      await addAssignment({
        title: assignmentForm.title.trim(),
        subject: assignmentForm.subject.trim() || 'General',
        description: assignmentForm.description.trim(),
        due_date: assignmentForm.due_date || null,
        file: assignmentForm.file,
      });

      setAssignmentForm({ title: '', subject: '', description: '', due_date: '', file: null });
      e.target.reset();
      await refreshAssignments();
      setActiveTab('assignments');
      setFeedback('Assignment created successfully. It is now visible on Home and Study Material.');
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError('Unable to create the assignment right now.');
    }
  };

  const handleSelectAssignment = (assignmentId) => {
    setSelectedAssignmentId(assignmentId);
    setActiveTab('submissions');
  };

  const handleExportAssignmentReport = async () => {
    if (!selectedAssignment) {
      setError('Select an assignment before exporting the submission tracker report.');
      return;
    }

    const rows = buildAssignmentReportRows(selectedAssignment.title, assignmentStatusList);
    const exported = await exportReportToExcel(`${selectedAssignment.title.replace(/\s+/g, '_')}_submission_report`, 'Assignment Tracker', rows);
    if (!exported) {
      setError('Excel export could not be generated.');
      return;
    }
    setFeedback('Assignment tracker report downloaded as an Excel file.');
  };

  const handleExportMenteeReport = async () => {
    const rows = buildMenteeReportRows(filteredMenteeRecords);
    const exported = await exportReportToExcel('mentee_report', 'Mentee Records', rows);
    if (!exported) {
      setError('Excel export could not be generated.');
      return;
    }
    setFeedback('Mentee record report downloaded as an Excel file.');
  };

  const selectedAssignment = assignments.find((assignment) => assignment.id === selectedAssignmentId);
  const filteredMenteeRecords = useMemo(() => filterMenteeRecords(menteeRecords, menteeSearch), [menteeRecords, menteeSearch]);

  const assignmentStatusList = VALID_STUDENTS.map((studentId) => {
    const submission = assignmentSubmissions.find((item) => item.student_id === studentId);
    return {
      student_id: studentId,
      name: STUDENT_NAMES[studentId] || studentId,
      submitted: Boolean(submission),
      attachment: submission?.attachment || null,
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
            {['materials', 'assignments', 'submissions', 'mentees'].map((tab) => (
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
                {tab === 'materials' ? 'Share Notes' : tab === 'assignments' ? 'Create Assignment' : tab === 'submissions' ? 'Submission Tracker' : 'My Mentees'}
              </button>
            ))}
          </div>

          {feedback && <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{feedback}</div>}
          {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          {activeTab === 'materials' && (
            <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
                <h3 className="text-2xl font-semibold text-slate-900 mb-6">Upload new note</h3>
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
                    <label className="mb-2 block text-sm font-semibold text-slate-700">File</label>
                    <input
                      type="file"
                      accept={ACCEPTED_UPLOADS}
                      onChange={(e) => setMaterialForm({ ...materialForm, file: e.target.files?.[0] || null })}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                      required
                    />
                    <p className="mt-2 text-xs text-slate-500">Images, PDFs, and ZIP files only. Maximum 5 MB.</p>
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
                  <p className="text-slate-600">No shared notes yet. Upload a file to see it here and on Study Material.</p>
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
                            {material.attachment && <a
                              href={getApiFileUrl(material.attachment.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-800"
                            >
                              Open File
                            </a>}
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
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Reference file</label>
                    <input
                      type="file"
                      accept={ACCEPTED_UPLOADS}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, file: e.target.files?.[0] || null })}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    />
                    <p className="mt-2 text-xs text-slate-500">Optional image, PDF, or ZIP reference. Maximum 5 MB.</p>
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
                        {assignment.attachment && (
                          <a href={getApiFileUrl(assignment.attachment.url)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800">
                            Open reference file
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'mentees' && (
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
              <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">My Mentees</h3>
                  <p className="mt-2 text-slate-600">Track the mentoring records for roll numbers 26505075 to 26505110, including the details submitted and the suggestions, complaints, or requirements logged by date.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Mentee count: {filteredMenteeRecords.length}</div>
                  <button
                    type="button"
                    onClick={handleExportMenteeReport}
                    className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Export mentee report
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="mentee-search">Search mentees</label>
                <input
                  id="mentee-search"
                  type="search"
                  value={menteeSearch}
                  onChange={(e) => setMenteeSearch(e.target.value)}
                  placeholder="Search by name or roll number"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-500">Showing {filteredMenteeRecords.length} of {menteeRecords.length} mentees</p>
              </div>

              {filteredMenteeRecords.length === 0 ? (
                <p className="text-slate-600">No mentee records are available yet. Once students save their details and mentoring notes, they will appear here.</p>
              ) : (
                <div className="space-y-6">
                  {filteredMenteeRecords.map((student) => (
                    <article key={student.student_id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{student.label}</p>
                          <h4 className="mt-2 text-xl font-semibold text-slate-900">{student.name}</h4>
                          <p className="text-sm text-slate-600">Roll No: {student.student_id}</p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700">Mentor: Prof. Pooja Pimpalshende</span>
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-3xl border border-slate-200 bg-white p-4">
                          <h5 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Family contact</h5>
                          <p className="mt-3 text-sm text-slate-700">Father: {student.profile?.father_contact || 'Not provided'}</p>
                          <p className="mt-2 text-sm text-slate-700">Mother: {student.profile?.mother_contact || 'Not provided'}</p>
                        </div>
                        <div className="rounded-3xl border border-slate-200 bg-white p-4">
                          <h5 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Student details</h5>
                          <p className="mt-3 text-sm text-slate-700">Aadhaar: {student.profile?.aadhaar_number || 'Not provided'}</p>
                          <p className="mt-2 text-sm text-slate-700">Address: {student.profile?.address || 'Not provided'}</p>
                          <p className="mt-2 text-sm text-slate-700">Scholarship details: {student.profile?.scholarship_details || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4">
                        <h5 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Submitted mentoring notes</h5>
                        {student.submissions.length === 0 ? (
                          <p className="mt-3 text-sm text-slate-600">No suggestions, complaints, or requirements have been submitted yet.</p>
                        ) : (
                          <div className="mt-4 space-y-3">
                            {student.submissions.map((entry) => (
                              <div key={entry.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-800">{entry.issue_type}</span>
                                  <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{entry.submitted_date}</span>
                                </div>
                                <p className="mt-3 text-sm text-slate-700">{entry.issue_detail}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
              <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">Submission Tracker</h3>
                  <p className="mt-2 text-slate-600">
                    Select an assignment to see which students have uploaded their files.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Total students: {VALID_STUDENTS.length}
                  </div>
                  <button
                    type="button"
                    onClick={handleExportAssignmentReport}
                    className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Export assignment report
                  </button>
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
                        {selectedAssignment.attachment && (
                          <a href={getApiFileUrl(selectedAssignment.attachment.url)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800">
                            Open reference file
                          </a>
                        )}
                      </div>

                      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-4">
                        <table className="min-w-full border-collapse text-left text-sm text-slate-700">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-100">
                              <th className="px-4 py-3">Student</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Submitted File</th>
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
                                  {student.submitted && student.attachment ? (
                                    <a href={getApiFileUrl(student.attachment?.url)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                      View file
                                    </a>
                                  ) : student.submitted ? (
                                    <span className="text-slate-500">File unavailable</span>
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
