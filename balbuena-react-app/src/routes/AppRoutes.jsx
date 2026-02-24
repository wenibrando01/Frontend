import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import RequireAuth from './RequireAuth';
import LoginPage from '../pages/LoginPage/LoginPage';
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import StudentsPage from '../pages/StudentsPage/StudentsPage';
import CoursesPage from '../pages/CoursesPage/CoursesPage';
import EnrollmentPage from '../pages/EnrollmentPage/EnrollmentPage';
import ReportsPage from '../pages/ReportsPage/ReportsPage';
import SettingsPage from '../pages/SettingsPage/SettingsPage';
import ProgramOfferingsPage from '../pages/ProgramOfferingsPage/ProgramOfferingsPage';
import SubjectOfferingsPage from '../pages/SubjectOfferingsPage/SubjectOfferingsPage';
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="programs" element={<ProgramOfferingsPage />} />
        <Route path="subjects" element={<SubjectOfferingsPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="enrollment" element={<EnrollmentPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

