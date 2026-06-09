import React, { useContext } from 'react';
import { RoleProvider, RoleContext } from './context/RoleContext';
import TopBar from './components/TopBar';
import instituteLogo from './assets/tgpcet log.jpeg';
import LoginPage from './components/LoginPage';
import DashboardHome from './pages/dashboard';
import StudyMaterialsPage from './pages/materials';
import FacultyDashboard from './components/FacultyDashboard';
import StudentDashboard from './components/StudentDashboard';
import './index.css';

function AppContent() {
  const { activePage } = useContext(RoleContext);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="overflow-hidden border-b border-slate-200 bg-white shadow-sm">
        <img
          src={instituteLogo}
          alt="Institute banner"
          className="h-14 w-full object-contain sm:h-16"
        />
      </div>
      <TopBar />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {activePage === 'home' && <DashboardHome />}
        {activePage === 'materials' && <StudyMaterialsPage />}
        {activePage === 'login' && <LoginPage />}
        {activePage === 'faculty-dashboard' && <FacultyDashboard />}
        {activePage === 'student-dashboard' && <StudentDashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <RoleProvider>
      <AppContent />
    </RoleProvider>
  );
}
