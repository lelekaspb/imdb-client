import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * RequireAuth wrapper:
 * - while auth.loading is true -> render nothing (avoid redirect during initial validation)
 * - if not logged in -> redirect to /user/login with state.from
 * - otherwise render children
 */
export default function RequireAuth({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  // While we are checking token validity, avoid redirecting.
  // Return null (or a spinner) to prevent redirect-to-login during initial silent validation.
  if (loading) {
    return null; 
  }

  if (!isLoggedIn) {
    return <Navigate to="/user/login" state={{ from: location }} replace />;
  }

  return children;
}
