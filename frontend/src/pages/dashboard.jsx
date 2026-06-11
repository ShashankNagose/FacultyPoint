import React, { useContext, useEffect, useState } from 'react';
import { RoleContext } from '../context/RoleContext';
import { loadAssignments } from '../utils/storage';

export default function DashboardHome() {
  const { setActivePage } = useContext(RoleContext);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    let isMounted = true;

    loadAssignments()
      .then((items) => {
        if (isMounted) setAssignments(items);
      })
      .catch(() => {
        if (isMounted) setAssignments([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const latestAssignment = assignments[assignments.length - 1];

  return (
    <section className="space-y-10">
      <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-xl">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">FacultyPoint</p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Welcome to CSE (Data Science) Department
          </h2>
          <p className="max-w-xl text-lg leading-8 text-slate-600">
            Use the login page to access your dashboard,
            explore study materials directly from the public resource section and be updated.
          </p>
        </div>
      </div>
      {latestAssignment && (
        <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-10 text-white shadow-2xl">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.4em] text-slate-400">New assessment available</p>
            <h3 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {latestAssignment.title}
            </h3>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              {latestAssignment.subject} · {latestAssignment.due_date ? `Due ${latestAssignment.due_date}` : 'Open assessment'}
            </p>
            <button
              type="button"
              onClick={() => setActivePage('materials')}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              View full details on Study Material
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-900">Shared access</h4>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Get your latest study materials and resources here.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-900">Public resources</h4>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The Study Material page remains publicly accessible and submit your assessments with live tracking.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-900">Login for dashboard</h4>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Remeber your login credentials for accessing the dashboard.
          </p>
        </div>
      </div>

      <footer className="rounded-[32px] border border-slate-200 bg-slate-950 p-8 text-white shadow-xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Department info</p>
            <h3 className="mt-4 text-2xl font-semibold text-white">CSE (Data Science) Department</h3>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              FacultyPoint supports department communication, study material sharing, assignment tracking, and mentoring records for students and faculty in one place.
            </p>
            <p className="mt-4 text-sm text-slate-300">Mentor: Prof. Pooja Pimpalshende</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white">Quick links</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><button type="button" onClick={() => setActivePage('materials')} className="hover:text-white">Study Materials</button></li>
              <li><button type="button" onClick={() => setActivePage('faculty-dashboard')} className="hover:text-white">Faculty Dashboard</button></li>
              <li><button type="button" onClick={() => setActivePage('student-dashboard')} className="hover:text-white">Student Portal</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white">Connect with us</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><a href="https://www.youtube.com/" target="_blank" rel="noreferrer" className="hover:text-white">YouTube</a></li>
              <li><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a></li>
              <li><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" className="hover:text-white">LinkedIn</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </section>
  );
}
