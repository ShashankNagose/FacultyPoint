import React, { useState, useEffect, useContext } from 'react';
import { RoleContext } from '../context/RoleContext';
import {
  addStudentUpload,
  loadStudentUploads,
  loadAssignments,
  addAssignmentSubmission,
  loadAssignmentSubmissions,
} from '../utils/storage';
import { STUDENT_NAMES } from '../config';

export default function StudentDashboard() {
  const { userId, displayName } = useContext(RoleContext);
  const [uploads, setUploads] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({ assignment_id: '', drive_link: '' });
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      setUploads(loadStudentUploads(userId));
      const loadedAssignments = loadAssignments();
      const enriched = loadedAssignments.map((assignment) => {
        const submission = loadAssignmentSubmissions(assignment.id).find((item) => item.student_id === userId);
        return {
          ...assignment,
          submitted: Boolean(submission),
          drive_link: submission?.drive_link || '',
        };
      });
      setAssignments(enriched);
    }
  }, [userId]);

  const refreshUploads = () => {
    if (userId) {
      setUploads(loadStudentUploads(userId));
    }
  };

  const refreshAssignments = () => {
    if (userId) {
      const loadedAssignments = loadAssignments();
      const enriched = loadedAssignments.map((assignment) => {
        const submission = loadAssignmentSubmissions(assignment.id).find((item) => item.student_id === userId);
        return {
          ...assignment,
          submitted: Boolean(submission),
          drive_link: submission?.drive_link || '',
        };
      });
      setAssignments(enriched);
    }
  };

  const handleAssignmentSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!assignmentForm.assignment_id) {
      setError('Please select an assignment to submit.');
      return;
    }

    if (!assignmentForm.drive_link.trim()) {
      setError('Please paste your Google Drive link.');
      return;
    }

    const assignment = assignments.find((item) => item.id === Number(assignmentForm.assignment_id));
    if (!assignment) {
      setError('Selected assignment is not available.');
      return;
    }

    addAssignmentSubmission(assignment.id, {
      student_id: userId,
      drive_link: assignmentForm.drive_link.trim(),
    });

    addStudentUpload(userId, {
      title: `Submission: ${assignment.title}`,
      drive_link: assignmentForm.drive_link.trim(),
    });

    setAssignmentForm({ assignment_id: '', drive_link: '' });
    refreshUploads();
    refreshAssignments();
    setFeedback('Assignment submitted successfully. Your dashboard and faculty tracker are now updated.');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-3xl font-semibold text-slate-900">Student Dashboard</h2>
          <p className="mt-3 text-slate-600">Welcome, {displayName || userId || 'Student'}. Submit assignments and keep your own drive links saved.</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
            <h3 className="text-2xl font-semibold text-slate-900 mb-6">Submit assignment link</h3>
            {error && <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            {feedback && <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{feedback}</div>}
            <form onSubmit={handleAssignmentSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Select assignment</label>
                <select
                  value={assignmentForm.assignment_id}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, assignment_id: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  required
                >
                  <option value="">-- Choose an assignment --</option>
                  {assignments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title} {assignment.due_date ? `(Due ${assignment.due_date})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Google Drive Link</label>
                <textarea
                  value={assignmentForm.drive_link}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, drive_link: e.target.value })}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  rows="4"
                  placeholder="Paste your shareable Google Drive link here..."
                  required
                />
              </div>
              <button
                type="submit"
                className="rounded-3xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
              >
                Submit Assignment
              </button>
            </form>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
            <h3 className="text-2xl font-semibold text-slate-900 mb-6">Assignment status</h3>
            {assignments.length === 0 ? (
              <p className="text-slate-600">No assignments are currently available. Check back later or use the Study Material page.</p>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-500">{assignment.subject}</p>
                        <h4 className="mt-2 text-lg font-semibold text-slate-900">{assignment.title}</h4>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${assignment.submitted ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {assignment.submitted ? 'Submitted' : 'Pending'}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-700 line-clamp-2">{assignment.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
          <h3 className="text-2xl font-semibold text-slate-900 mb-6">Your saved links</h3>
          {uploads.length === 0 ? (
            <p className="text-slate-600">You haven't uploaded any personal links yet. They appear here once saved.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {uploads.map((upload) => (
                <div key={upload.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-lg font-semibold text-slate-900">{upload.title}</h4>
                  <a
                    href={upload.drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-blue-600 hover:text-blue-800 text-sm break-all"
                  >
                    Open Drive Link
                  </a>
                  <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-400">Saved on {new Date(upload.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
