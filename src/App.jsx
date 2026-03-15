import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

const AdminLogin = lazy(() => import("./components/auth/AdminLogin"));
const StudentLogin = lazy(() => import("./components/auth/StudentLogin"));
const AuthForm = lazy(() => import("./components/auth/AuthForm"));
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const Dashboard = lazy(() => import("./components/dashboard/Dashboard"));
const Settings = lazy(() => import("./components/dashboard/Settings"));
const AnnouncementsPage = lazy(() => import("./components/dashboard/AnnouncementsPage"));
const ProfilePage = lazy(() => import("./components/dashboard/ProfilePage"));
const EnrollmentPage = lazy(() => import("./components/dashboard/EnrollmentPage"));
const MyCoursesPage = lazy(() => import("./components/dashboard/MyCoursesPage"));
const GradesPage = lazy(() => import("./components/dashboard/GradesPage"));
const SchedulePage = lazy(() => import("./components/dashboard/SchedulePage"));
const EventsPage = lazy(() => import("./components/dashboard/EventsPage"));
const StudentMessagesPage = lazy(() => import("./components/dashboard/StudentMessagesPage"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboardHome = lazy(() => import("./components/admin/AdminDashboardHome"));
const AdminStudents = lazy(() => import("./components/admin/AdminStudents"));
const AdminCourses = lazy(() => import("./components/admin/AdminCourses"));
const AdminSchoolDays = lazy(() => import("./components/admin/AdminSchoolDays"));
const AdminEnrollment = lazy(() => import("./components/admin/AdminEnrollment"));
const AdminGrades = lazy(() => import("./components/admin/AdminGrades"));
const AdminEvents = lazy(() => import("./components/admin/AdminEvents"));
const AdminMessages = lazy(() => import("./components/admin/AdminMessages"));
const AdminAnnouncements = lazy(() => import("./components/admin/AdminAnnouncements"));
const AdminReports = lazy(() => import("./components/admin/AdminReports"));
const AdminEnrolledCourses = lazy(() => import("./components/admin/AdminEnrolledCourses"));
const AdminSettings = lazy(() => import("./components/admin/AdminSettings"));
const AdminRoute = lazy(() => import("./components/common/AdminRoute"));
const StudentRoute = lazy(() => import("./components/common/StudentRoute"));

function DefaultRedirect() {
  const { isAuthenticated, initializing, isAdmin, isStudent } = useAuth();
  if (initializing) return null;
  if (!isAuthenticated) return <Navigate to="/student/login" replace />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (isStudent) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/student/login" replace />;
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <Suspense fallback={<div className="skeleton skeleton-block" style={{ margin: 16, height: 180 }} />}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/student/login" element={<StudentLogin />} />
            <Route
              path="/register"
              element={
                <AuthForm
                  registerOnly
                  redirectTo="/dashboard"
                  title="Student Registration"
                />
              }
            />
            {/* Default: unauthenticated -> student login; admin -> admin dashboard; student -> student dashboard */}
            <Route path="/" element={<DefaultRedirect />} />

            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboardHome />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="enrollment" element={<AdminEnrollment />} />
              <Route path="grades" element={<AdminGrades />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="enrolled-courses" element={<AdminEnrolledCourses />} />
              <Route path="school-days" element={<AdminSchoolDays />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route
              path="/dashboard"
              element={
                <StudentRoute>
                  <DashboardLayout />
                </StudentRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="enrollment" element={<EnrollmentPage />} />
              <Route path="enrollment/subjects/:courseId" element={<EnrollmentPage />} />
              <Route path="my-courses" element={<MyCoursesPage />} />
              <Route path="grades" element={<GradesPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="messages" element={<StudentMessagesPage />} />
              <Route path="announcements" element={<AnnouncementsPage />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Unknown paths -> redirect to / which sends to /student/login or role dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </Router>
  );
}

export default App;
