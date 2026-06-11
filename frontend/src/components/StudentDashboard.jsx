import React, { useState, useEffect, useContext } from 'react';
import { RoleContext } from '../context/RoleContext';
import {
  loadStudentUploads,
  loadAssignments,
  addAssignmentSubmission,
  loadAssignmentSubmissions,
  upsertMenteeProfile,
  addMenteeSubmission,
  loadMenteeProfile,
  loadMenteeSubmissions,
  getApiFileUrl,
} from '../utils/storage';
import { STUDENT_NAMES } from '../config';
import { isMenteeRoll } from '../utils/menteeUtils';

const ACCEPTED_UPLOADS = 'image/*,.pdf,.doc,.docx,.ppt,.pptx,.zip';
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

const validateUploadFile = (file) => {
  if (!file) return 'Please select an image, PDF, Word, PowerPoint, or ZIP file.';
  if (file.size > MAX_UPLOAD_SIZE) return 'File must be less than 5 MB.';
  return null;
};

export default function StudentDashboard() {
  const { userId, displayName } = useContext(RoleContext);
  const [uploads, setUploads] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState({ assignment_id: '', file: null });
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
    if (!userId) return;

    refreshUploads();
    if (isMentee) {
      refreshMenteeNotes();
      refreshMenteeProfile();
    }
    refreshAssignments();
  }, [userId, isMentee]);

  const refreshUploads = async () => {
    if (userId) {
      try {
        setUploads(await loadStudentUploads(userId));
      } catch (err) {
        console.error('Error loading uploads:', err);
        setError('Unable to load your saved uploads.');
      }
    }
  };

  const refreshMenteeNotes = async () => {
    if (!isMentee || !userId) return;

    try {
      const notes = await loadMenteeSubmissions();
      setMenteeNotes(notes.filter((entry) => entry.student_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      console.error('Error loading mentee notes:', err);
      setError('Unable to load mentoring notes.');
    }
  };

  const refreshMenteeProfile = async () => {
    if (!isMentee || !userId) return;

    try {
      setMenteeProfile(
        (await loadMenteeProfile(userId)) || {
          father_contact: '',
          mother_contact: '',
          aadhaar_number: '',
          address: '',
          scholarship_details: 'Yes',
        }
      );
    } catch (err) {
      console.error('Error loading mentee profile:', err);
      setError('Unable to load your mentee profile.');
    }
  };

  const refreshAssignments = async () => {
    if (!userId) return;

    try {
      const loadedAssignments = await loadAssignments();
      const enriched = await Promise.all(
        loadedAssignments.map(async (assignment) => {
          try {
            const submissions = await loadAssignmentSubmissions(assignment.id);
            const submission = submissions.find((item) => item.student_id === userId);
            return {
              ...assignment,
              reference_attachment: assignment.attachment || null,
              submitted: Boolean(submission),
              submission_attachment: submission?.attachment || null,
            };
          } catch (subError) {
            console.error('Error loading assignment submissions:', subError);
            return {
              ...assignment,
              reference_attachment: assignment.attachment || null,
              submitted: false,
              submission_attachment: null,
            };
          }
        })
      );
      setAssignments(enriched);
    } catch (err) {
      console.error('Error loading assignments:', err);
      setError('Unable to load assignments.');
    }
  };

  const handleMenteeProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!menteeProfile.father_contact.trim() || !menteeProfile.mother_contact.trim()) {
      setError('Father and mother contact details are required for mentee records.');
      return;
    }

    try {
      await upsertMenteeProfile(userId, {
        ...menteeProfile,
        father_contact: menteeProfile.father_contact.trim(),
        mother_contact: menteeProfile.mother_contact.trim(),
        aadhaar_number: menteeProfile.aadhaar_number.trim(),
        address: menteeProfile.address.trim(),
        scholarship_details: menteeProfile.scholarship_details,
      });

      setFeedback('Your mentee record has been saved for the faculty mentor.');
    } catch (err) {
      console.error('Error saving mentee profile:', err);
      setError('Unable to save your mentee record right now.');
    }
  };

  const handleMenteeSuggestionSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!menteeSubmission.issue_detail.trim() || !menteeSubmission.submitted_date) {
      setError('Please enter the mentoring note and the date of submission.');
      return;
    }

    try {
      const savedNote = await addMenteeSubmission({
        student_id: userId,
        student_name: displayName || STUDENT_NAMES[userId] || userId,
        issue_type: menteeSubmission.issue_type,
        issue_detail: menteeSubmission.issue_detail.trim(),
        submitted_date: menteeSubmission.submitted_date,
      });

      setLastSavedNoteId(savedNote?.id || null);
      await refreshMenteeNotes();
      setMenteeSubmission({
        issue_type: 'suggestion',
        issue_detail: '',
        submitted_date: new Date().toISOString().slice(0, 10),
      });
      setFeedback('Your suggestion, complaint, or requirement has been saved for faculty review.');
      window.setTimeout(() => setLastSavedNoteId(null), 2200);
    } catch (err) {
      console.error('Error saving mentee note:', err);
      setError('Unable to save the mentoring note right now.');
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!assignmentForm.assignment_id) {
      setError('Please select an assignment to submit.');
      return;
    }

    const fileError = validateUploadFile(assignmentForm.file);
    if (fileError) {
      setError(fileError);
      return;
    }

    const assignment = assignments.find((item) => item.id === Number(assignmentForm.assignment_id));
    if (!assignment) {
      setError('Selected assignment is not available.');
      return;
    }

    try {
      await addAssignmentSubmission(assignment.id, {
        student_id: userId,
        file: assignmentForm.file,
      });

      setAssignmentForm({ assignment_id: '', file: null });
      e.target.reset();
      await refreshUploads();
      await refreshAssignments();
      setFeedback('Assignment submitted successfully. Your dashboard and faculty tracker are now updated.');
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError('Unable to submit the assignment right now.');
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-3xl font-semibold text-slate-900">{isMentee ? 'Mentee Dashboard' : 'Student Dashboard'}</h2>
          <p className="mt-3 text-slate-600">Welcome, {displayName || userId || 'Student'}. {isMentee ? 'Use this portal to keep your mentor details current and submit suggestions, complaints, or requirements with dates.' : 'Submit assignments and keep your uploaded assignment files saved.'}</p>
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
            <h3 className="text-2xl font-semibold text-slate-900 mb-6">Submit assignment file</h3>
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
                <label className="mb-2 block text-sm font-semibold text-slate-700">Upload file</label>
                <input
                  type="file"
                  accept={ACCEPTED_UPLOADS}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, file: e.target.files?.[0] || null })}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  required
                />
                <p className="mt-2 text-xs text-slate-500">Images, PDFs, Word, PowerPoint, and ZIP files are supported. Maximum 5 MB.</p>
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
                    {assignment.reference_attachment && (
                      <a href={getApiFileUrl(assignment.reference_attachment.url)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800">
                        Open reference file
                      </a>
                    )}
                    {assignment.submitted && assignment.submission_attachment && (
                      <a href={getApiFileUrl(assignment.submission_attachment.url)} target="_blank" rel="noopener noreferrer" className="mt-2 block text-sm font-semibold text-emerald-700 hover:text-emerald-900">
                        View your submitted file
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
          <h3 className="text-2xl font-semibold text-slate-900 mb-6">Your saved uploads</h3>
          {uploads.length === 0 ? (
            <p className="text-slate-600">You haven't uploaded any assignment files yet. They appear here once submitted.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {uploads.map((upload) => (
                <div key={upload.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-lg font-semibold text-slate-900">{upload.title}</h4>
                  {upload.attachment && <a
                    href={getApiFileUrl(upload.attachment.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-blue-600 hover:text-blue-800 text-sm break-all"
                  >
                    Open file
                  </a>}
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
