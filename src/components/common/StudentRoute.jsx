import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StudentRoute = ({ children }) => {
  const { initializing, isAuthenticated, isStudent } = useAuth();
  if (initializing) return null;
  if (!isAuthenticated) return <Navigate to="/student/login" replace />;
  if (!isStudent) return <Navigate to="/student/login" replace />;
  return children;
};

export default StudentRoute;
