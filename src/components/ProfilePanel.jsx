import React from "react";
import useUserProfile from "../hooks/useUserProfile";

/**
 * Default panel shown on /user and /user/profile.
 * Displays basic user information.
 */
export default function ProfilePanel() {
  const { profile } = useUserProfile();

  if (!profile) return null;

  return (
    <>
      <h5 className="mb-1">Username</h5>
      <p className="mb-3">{profile.username}</p>

      <h5 className="mb-1">Email</h5>
      <p>{profile.email}</p>
    </>
  );
}
