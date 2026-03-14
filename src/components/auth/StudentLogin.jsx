import React from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "./AuthForm";
import { useAuth } from "../../context/AuthContext";

const StudentLogin = () => {
  const navigate = useNavigate();
  const { loginAsStudent } = useAuth();

  return (
    <AuthForm
      loginFn={loginAsStudent}
      redirectTo="/dashboard"
      title="Student Login"
      registerRedirectTo="/register"
      showAdminLink
    />
  );
};

export default StudentLogin;
