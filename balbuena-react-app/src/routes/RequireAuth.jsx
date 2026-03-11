import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../services/auth";

export default function RequireAuth({ children }) {
  const location = useLocation();

  // check if user is authenticated
  if (!auth.isAuthenticated()) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}