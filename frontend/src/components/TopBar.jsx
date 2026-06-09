import React, { useContext } from 'react';
import { RoleContext } from '../context/RoleContext';

export default function TopBar() {
  const { role, displayName, activePage, setActivePage, logout, isAuthenticated } = useContext(RoleContext);

  return (
    <div className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{isAuthenticated ? displayName : 'Prof. Pooja Pimpalshende'}</h1>
            <p className="text-sm text-slate-500">{isAuthenticated ? `${role === 'faculty' ? 'Faculty Dashboard' : 'Student Portal'}` : 'Minimal portal for Data Science materials'}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActivePage('home')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activePage === 'home'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActivePage('materials')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activePage === 'materials'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Study Material
          </button>
          {isAuthenticated && (
            <button
              onClick={() => setActivePage(role === 'faculty' ? 'faculty-dashboard' : 'student-dashboard')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activePage === 'faculty-dashboard' || activePage === 'student-dashboard'
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Dashboard
            </button>
          )}
          {!isAuthenticated ? (
            <button
              onClick={() => setActivePage('login')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activePage === 'login'
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Login
            </button>
          ) : (
            <button
              onClick={logout}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
