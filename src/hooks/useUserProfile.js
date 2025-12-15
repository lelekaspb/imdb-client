import { useEffect, useState } from "react";
import { userService } from "../api/userService";
import { useAuth } from "../context/AuthContext";

export default function useUserProfile() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let mounted = true;

    userService
      .getProfile()
      .then((p) => mounted && setProfile(p))
      .catch((e) => mounted && setError(e.message))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [token]);

  return { profile, loading, error };
}
