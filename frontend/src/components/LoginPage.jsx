import React, { useState, useContext } from 'react';
import { RoleContext } from '../context/RoleContext';
import { VALID_STUDENTS } from '../config';

export default function LoginPage() {
  const { login, authError } = useContext(RoleContext);
  const [loginType, setLoginType] = useState('faculty');
  const [credentials, setCredentials] = useState({ username: '', password: '', studentId: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    login({
      loginType,
      username: credentials.username.trim(),
      password: credentials.password.trim(),
      studentId: credentials.studentId
    });
  };

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
      <div className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Login required</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Please sign in to continue
        </h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => setLoginType('faculty')}
          className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
            loginType === 'faculty'
              ? 'bg-slate-900 text-white shadow'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Faculty Login
        </button>
        <button
          type="button"
          onClick={() => setLoginType('student')}
          className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
            loginType === 'student'
              ? 'bg-slate-900 text-white shadow'
              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          Student Login
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        {loginType === 'faculty' ? (
          <>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Faculty Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="Enter your username"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                required
              />
            </div>
          </>
        ) : (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Student ID</label>
            <select
              value={credentials.studentId}
              onChange={(e) => setCredentials({ ...credentials, studentId: e.target.value })}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              required
            >
              <option value="">Select your student ID</option>
              {VALID_STUDENTS.map((studentId) => (
                <option key={studentId} value={studentId}>
                  {studentId}
                </option>
              ))}
            </select>
          </div>
        )}

        {authError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {authError}
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-3xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800"
        >
          Continue to portal
        </button>
      </form>
    </div>
  );
}
