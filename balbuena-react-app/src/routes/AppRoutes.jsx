import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";
import RequireAuth from "./RequireAuth";

import LoginPage from "../pages/LoginPage/LoginPage";
import DashboardPage from "../pages/DashboardPage/DashboardPage";
import StudentsPage from "../pages/StudentsPage/StudentsPage";
import CoursesPage from "../pages/CoursesPage/CoursesPage";
import EnrollmentPage from "../pages/EnrollmentPage/EnrollmentPage";
import ReportsPage from "../pages/ReportsPage/ReportsPage";
import SettingsPage from "../pages/SettingsPage/SettingsPage";
import ProgramOfferingsPage from "../pages/ProgramOfferingsPage/ProgramOfferingsPage";
import SubjectOfferingsPage from "../pages/SubjectOfferingsPage/SubjectOfferingsPage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<Navigate to="/" replace />} />

      {/* Protected App routes */}
      <Route
        path="/app"
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

      {/* Redirect short URLs to /app/... */}
      <Route path="/dashboard" element={<Navigate to="/app" replace />} />
      <Route path="/students" element={<Navigate to="/app/students" replace />} />
      <Route path="/courses" element={<Navigate to="/app/courses" replace />} />
      <Route path="/programs" element={<Navigate to="/app/programs" replace />} />
      <Route path="/subjects" element={<Navigate to="/app/subjects" replace />} />
      <Route path="/enrollment" element={<Navigate to="/app/enrollment" replace />} />
      <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
      <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}