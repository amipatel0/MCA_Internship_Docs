import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function OrganizerAccess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost/event_backend/auth/get_user_info.php", {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.status) {
          if (res.data.user.role !== "organizer") {
            // Redirect non-organizers
            navigate("/"); // or a customer dashboard
          }
        } else {
          navigate("/login");
        }
      })
      .catch(() => {
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  return loading;
}
