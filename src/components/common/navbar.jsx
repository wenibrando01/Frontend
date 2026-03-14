import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "./ConfirmDialog";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false);

  const handleLogout = async () => {
    setLogoutConfirmOpen(true);
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">
          <div className="topbar-heading">School Dashboard</div>
          <div className="topbar-breadcrumb">Analytics • Weather • Reports</div>
        </div>
        <div className="topbar-spacer" />
        <button className="button" onClick={() => navigate("/dashboard")}>
          Dashboard
        </button>
        <button className="button primary" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Log Out"
        message="Are you sure you want to log out?"
        meta="You can sign back in anytime."
        confirmText="Log out"
        onConfirm={async () => {
          await logout();
          navigate("/login", { replace: true });
          setLogoutConfirmOpen(false);
        }}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </>
  );
};

export default Navbar;