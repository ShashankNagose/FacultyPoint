import React, { useState, useEffect, useContext } from 'react';
import { RoleContext } from '../context/RoleContext';
import {
  addStudentUpload,
  loadStudentUploads,
  loadAssignments,
  addAssignmentSubmission,
  loadAssignmentSubmissions,
  upsertMenteeProfile,
  addMenteeSubmission,
  loadMenteeProfile,
  loadMenteeSubmissions,
} from '../utils/storage';
import { STUDENT_NAMES } from '../config';
import { isMenteeRoll } from '../utils/menteeUtils';

export default function StudentDashboard() {
  const { userId, displayName } = useContext(RoleContext);
  const [uploads, setUploads] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({ assignment_id: '', drive_link: '' });
  const [menteeProfile, setMenteeProfile] = useState({
    father_contact: '',
    mother_contact: '',
    aadhaar_number: '',
    address: '',
    scholarship_details: 'Yes',
  });
  const [menteeSubmission, setMenteeSubmission] = useState({
    issue_type: 'suggestion',
    issue_detail: '',
    submitted_date: new Date().toISOString().slice(0, 10),
  });
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const [menteeNotes, setMenteeNotes] = useState([]);
  const [lastSavedNoteId, setLastSavedNoteId] = useState(null);
  const isMentee = Boolean(userId && isMenteeRoll(userId));

  useEffect(() => {
    if (userId) {
      setUploads(loadStudentUploads(userId));
      setMenteeNotes(loadMenteeSubmissions().filter((entry) => entry.student_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setMenteeProfile(loadMenteeProfile(userId) || {
        father_contact: '',
        mother_contact: '',
        aadhaar_number: '',
        address: '',
        scholarship_details: 'Yes',
      });
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

  const refreshMenteeNotes = () => {
    if (userId) {
      setMenteeNotes(loadMenteeSubmissions().filter((entry) => entry.student_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
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

  const handleMenteeProfileSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!menteeProfile.father_contact.trim() || !menteeProfile.mother_contact.trim()) {
      setError('Father and mother contact details are required for mentee records.');
      return;
    }

    upsertMenteeProfile(userId, {
      ...menteeProfile,
      father_contact: menteeProfile.father_contact.trim(),
      mother_contact: menteeProfile.mother_contact.trim(),
      aadhaar_number: menteeProfile.aadhaar_number.trim(),
      address: menteeProfile.address.trim(),
      scholarship_details: menteeProfile.scholarship_details,
    });

    setFeedback('Your mentee record has been saved for the faculty mentor.');
  };

  const handleMenteeSuggestionSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!menteeSubmission.issue_detail.trim() || !menteeSubmission.submitted_date) {
      setError('Please enter the mentoring note and the date of submission.');
      return;
    }

    const savedNote = addMenteeSubmission({
      student_id: userId,
      student_name: displayName || STUDENT_NAMES[userId] || userId,
      issue_type: menteeSubmission.issue_type,
      issue_detail: menteeSubmission.issue_detail.trim(),
      submitted_date: menteeSubmission.submitted_date,
    });

    setLastSavedNoteId(savedNote?.id || null);
    refreshMenteeNotes();
    setMenteeSubmission({
      issue_type: 'suggestion',
      issue_detail: '',
      submitted_date: new Date().toISOString().slice(0, 10),
    });
    setFeedback('Your suggestion, complaint, or requirement has been saved for faculty review.');
    window.setTimeout(() => setLastSavedNoteId(null), 2200);
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
          <h2 className="text-3xl font-semibold text-slate-900">{isMentee ? 'Mentee Dashboard' : 'Student Dashboard'}</h2>
          <p className="mt-3 text-slate-600">Welcome, {displayName || userId || 'Student'}. {isMentee ? 'Use this portal to keep your mentor details current and submit suggestions, complaints, or requirements with dates.' : 'Submit assignments and keep your own drive links saved.'}</p>
        </div>

        {isMentee && (
          <div className="rounded-[32px] border border-emerald-200 bg-emerald-50 p-8 shadow-xl">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">Mentee portal</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-900">Mentor record & mentoring notes</h3>
                <p className="mt-3 text-slate-700">Faculty mentor: Prof. Pooja Pimpalshende. Fill the required family contact details and submit your suggestions, complaints, or requirements with the date.</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Roll {userId}</span>
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_1fr]">
              <form onSubmit={handleMenteeProfileSubmit} className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm space-y-5">
                <div>
                  <h4 className="text-xl font-semibold text-slate-900">Student details</h4>
                  <p className="mt-1 text-sm text-slate-600">Father and mother contacts are required. Aadhaar, address, and scholarship status are optional but help the mentor maintain the record.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-slate-700">
                    <span>Father's contact *</span>
                    <input value={menteeProfile.father_contact} onChange={(e) => setMenteeProfile({ ...menteeProfile, father_contact: e.target.value })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200" placeholder="Enter father contact" required />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    <span>Mother's contact *</span>
                    <input value={menteeProfile.mother_contact} onChange={(e) => setMenteeProfile({ ...menteeProfile, mother_contact: e.target.value })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200" placeholder="Enter mother contact" required />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    <span>Aadhaar number</span>
                    <input value={menteeProfile.aadhaar_number} onChange={(e) => setMenteeProfile({ ...menteeProfile, aadhaar_number: e.target.value })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200" placeholder="Optional" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    <span>Scholarship details</span>
                    <select value={menteeProfile.scholarship_details} onChange={(e) => setMenteeProfile({ ...menteeProfile, scholarship_details: e.target.value })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </label>
                </div>
                <label className="block space-y-2 text-sm text-slate-700">
                  <span>Address</span>
                  <textarea value={menteeProfile.address} onChange={(e) => setMenteeProfile({ ...menteeProfile, address: e.target.value })} rows="3" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200" placeholder="Optional home address" />
                </label>
                <button type="submit" className="rounded-3xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800">Save mentee details</button>
              </form>

              <form onSubmit={handleMenteeSuggestionSubmit} className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm space-y-5">
                <div>
                  <h4 className="text-xl font-semibold text-slate-900">Mentoring note</h4>
                  <p className="mt-1 text-sm text-slate-600">Submit suggestions, complaints, or requirements with the date for faculty review.</p>
                </div>
                <label className="block space-y-2 text-sm text-slate-700">
                  <span>Type</span>
                  <select value={menteeSubmission.issue_type} onChange={(e) => setMenteeSubmission({ ...menteeSubmission, issue_type: e.target.value })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200">
                    <option value="suggestion">Suggestion</option>
                    <option value="complaint">Complaint</option>
                    <option value="requirement">Requirement</option>
                  </select>
                </label>
                <label className="block space-y-2 text-sm text-slate-700">
                  <span>Submission date</span>
                  <input type="date" value={menteeSubmission.submitted_date} onChange={(e) => setMenteeSubmission({ ...menteeSubmission, submitted_date: e.target.value })} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200" required />
                </label>
                <label className="block space-y-2 text-sm text-slate-700">
                  <span>Details</span>
                  <textarea value={menteeSubmission.issue_detail} onChange={(e) => setMenteeSubmission({ ...menteeSubmission, issue_detail: e.target.value })} rows="5" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200" placeholder="Describe the suggestion, complaint, or requirement here..." required />
                </label>
                <button type="submit" className="rounded-3xl bg-emerald-700 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-800">Save mentoring note</button>
                <p className="text-sm text-slate-500">You can add as many mentoring notes as needed. Each one is saved with its date for your faculty mentor.</p>
              </form>

              <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xl font-semibold text-slate-900">Your mentoring history</h4>
                    <p className="mt-1 text-sm text-slate-600">Recent notes appear here and animate when a new entry is saved.</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-800">{menteeNotes.length} notes</span>
                </div>
                <div className="mt-6 space-y-3">
                  {menteeNotes.length === 0 ? (
                    <p className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50 p-4 text-sm text-slate-600">No mentoring notes yet. Save your first suggestion, complaint, or requirement to start the record.</p>
                  ) : (
                    menteeNotes.map((entry) => (
                      <article key={entry.id} className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 transition duration-300 ${lastSavedNoteId === entry.id ? 'animate-pulse ring-2 ring-emerald-400' : ''}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-800">{entry.issue_type}</span>
                          <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{entry.submitted_date}</span>
                        </div>
                        <p className="mt-3 text-sm text-slate-700">{entry.issue_detail}</p>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
            <h3 className="text-2xl font-semibold text-slate-900 mb-6">Submit assignment link</h3>
            {error && <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-pulse">{error}</div>}
            {feedback && <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 animate-bounce">{feedback}</div>}
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
