import React, { createContext, useEffect, useState } from 'react';
import { VALID_STUDENTS, STUDENT_NAMES, FACULTY_PROFILE } from '../config';

export const RoleContext = createContext();

export function RoleProvider({ children }) {
  const [role, setRole] = useState(null); // 'faculty' | 'student' | null
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [activePage, setActivePage] = useState('home');
  const [authError, setAuthError] = useState(null);

  const login = ({ loginType, username, password, studentId }) => {
    setAuthError(null);

    if (loginType === 'faculty') {
      if (username === FACULTY_PROFILE.username && password === FACULTY_PROFILE.password) {
        setRole('faculty');
        setUserId(username);
        setDisplayName(FACULTY_PROFILE.name);
        setIsAuthenticated(true);
        setActivePage('faculty-dashboard');
        return true;
      }

      setAuthError('Invalid faculty credentials.');
      return false;
    }

    if (loginType === 'student') {
      if (VALID_STUDENTS.includes(studentId)) {
        setRole('student');
        setUserId(studentId);
        setDisplayName(STUDENT_NAMES[studentId] || studentId);
        setIsAuthenticated(true);
        setActivePage('student-dashboard');
        return true;
      }

      setAuthError('Invalid student ID.');
      return false;
    }

    setAuthError('Please select a valid login type.');
    return false;
  };

  const logout = () => {
    setRole(null);
    setUserId('');
    setDisplayName('');
    setIsAuthenticated(false);
    setActivePage('home');
    setAuthError(null);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activePage !== 'faculty-dashboard' && activePage !== 'student-dashboard') {
      logout();
    }
  }, [activePage, isAuthenticated]);

  return (
    <RoleContext.Provider
      value={{
        role,
        userId,
        displayName,
        isAuthenticated,
        activePage,
        authError,
        login,
        logout,
        setActivePage
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}
