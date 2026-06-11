import React, { useEffect, useState } from 'react';
import { getApiFileUrl, loadFacultyMaterials, loadAssignments } from '../utils/storage';

export default function StudyMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const [loadedMaterials, loadedAssignments] = await Promise.all([
          loadFacultyMaterials(),
          loadAssignments(),
        ]);
        if (!isMounted) return;
        setMaterials(loadedMaterials);
        setAssignments(loadedAssignments);
      } catch (err) {
        console.error('Error loading content:', err);
        if (isMounted) setError('Unable to load study materials or assignments at the moment.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Study Material</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">Shared notes and course resources</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            This page is common for everyone. Faculty uploads and assignments are shared here for students to access.
          </p>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Available Materials</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">Latest notes and resources</h2>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-slate-600">Loading materials…</div>
        ) : error ? (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : materials.length === 0 ? (
          <div className="mt-6 text-slate-600">No study materials shared yet.</div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {materials.map((material) => (
              <div key={material.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{material.subject || 'General'}</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{material.title}</h3>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                    File
                  </span>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                  {material.attachment && <a
                    href={getApiFileUrl(material.attachment.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-slate-900 hover:text-slate-700 break-words"
                  >
                    Open file
                  </a>}
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Posted on {new Date(material.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Current Assignments</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">Full assignment details</h2>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-slate-600">Loading assignments…</div>
        ) : assignments.length === 0 ? (
          <div className="mt-6 text-slate-600">No assignments published yet.</div>
        ) : (
          <div className="mt-8 space-y-6">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">{assignment.subject}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-slate-900">{assignment.title}</h3>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                    {assignment.due_date ? `Due ${assignment.due_date}` : 'Open assignment'}
                  </span>
                </div>
                <p className="mt-4 text-slate-700 leading-7">{assignment.description}</p>
                {assignment.attachment && (
                  <a href={getApiFileUrl(assignment.attachment.url)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800">
                    Open reference file
                  </a>
                )}
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">Published on {new Date(assignment.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
