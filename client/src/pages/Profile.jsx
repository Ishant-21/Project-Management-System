import React from "react";
import { useUser, useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, isLoaded } = useUser();
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.clearToken();
    navigate("/signin");
  };

  if (!isLoaded) return null;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Account</h2>
      {!user ? (
        <div>
          <p>You are not signed in.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm">Name: {user.name}</p>
          <p className="text-sm">Email: {user.email}</p>
          <div>
            <button
              onClick={handleLogout}
              className="mt-4 px-3 py-1 rounded bg-red-600 text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
