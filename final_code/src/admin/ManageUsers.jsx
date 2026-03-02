import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import {
  FaUserAlt,
  FaUsers,
  FaShieldAlt,
  FaTrash,
  FaBan,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useNotification } from "../context/NotificationContext";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Skeleton, { TableSkeleton } from "../components/ui/Skeleton";
import "./ManageUsers.css";

const USERS_PER_PAGE = 5;

export default function ManageUsers() {
  const { showNotification } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    try {
      const res = await API.get("admin/getUsers.php");
      if (res.data.status) {
        const updatedUsers = res.data.users.map((u) => ({
          ...u,
          status: u.role === "admin" ? "active" : u.status || "active",
        }));
        setUsers(updatedUsers);
        // console.log(updatedUsers);
      } else {
        showNotification(res.data.message || "Failed to fetch users", "error");
      }
    } catch (err) {
      showNotification("Server error. Could not fetch users.", "error");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (id, role, currentStatus) => {
    if (role === "admin") return;

    const newStatus = currentStatus === "active" ? "blocked" : "active";

    try {
      const res = await API.post(
        "admin/userStatus.php",
        JSON.stringify({ id, status: newStatus }),
        { headers: { "Content-Type": "application/json" } },
      );

      if (res.data.status) {
        showNotification(
          `User ${newStatus === "active" ? "unblocked" : "blocked"} successfully`,
          "success",
        );
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u)),
        );
      } else {
        showNotification(
          res.data.message || "Failed to update status",
          "error",
        );
      }
    } catch (err) {
      showNotification("Server error. Could not update status.", "error");
    }
  };

  const deleteUser = async (id, role) => {
    if (role === "admin") return;

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await API.post(
        "admin/deleteUser.php",
        JSON.stringify({ id }),
        { headers: { "Content-Type": "application/json" } },
      );

      if (res.data.status) {
        showNotification("User deleted successfully", "success");
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        showNotification(res.data.message || "Failed to delete user", "error");
      }
    } catch (err) {
      showNotification("Server error. Could not delete user.", "error");
    }
  };

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const currentUsers = users.slice(startIndex, startIndex + USERS_PER_PAGE);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <motion.div
      className="manage-users-premium pb-5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container py-4">
        {/* Entity Header */}
        <header className="dashboard-header-premium mb-5 pt-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="d-flex align-items-center gap-3 mb-3"
              >
                <div className="users-icon-premium shadow-lg">
                  <FaUsers />
                </div>
                <div>
                  <span className="badge-premium-v2 text-uppercase">
                    ENTITY PROTOCOL
                  </span>
                  <h1 className="text-white fw-black mb-0 display-4">
                    User{" "}
                    <span className="text-primary-gradient">Management</span>
                  </h1>
                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-secondary lead mb-0 max-w-600"
              >
                Audit authenticated entities across all sectors. You have
                authority to authorize, restrict, or terminate user access
                tokens.
              </motion.p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="telemetry-pill">
                  <span className="dot-live" /> {users.length} TOTAL USERS
                </div>
              </motion.div>
            </div>
          </div>
        </header>

        {/* User Data Cluster */}
        <div className="user-grid-container mb-5">
          <div className="d-flex align-items-center gap-3 mb-4 pb-2 border-bottom border-white-5">
            <span className="section-indicator-dash" />
            <h3 className="text-white fw-black mb-0 fs-4 tracking-tight">
              USER REGISTRY
            </h3>
          </div>

          <GlassCard className="p-0 overflow-hidden border-white-5 shadow-2xl">
            <div className="table-responsive">
              {loading ? (
                <div className="p-4">
                  <TableSkeleton rows={USERS_PER_PAGE} />
                </div>
              ) : (
                <table className="table users-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="px-4 py-4">USER NODE</th>
                      <th className="px-4 py-4 text-center">USER ROLE</th>
                      <th className="px-4 py-4 text-center">USER STATUS</th>
                      <th className="px-4 py-4 text-end">OPERATIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {currentUsers.map((u, idx) => (
                        <motion.tr
                          key={u.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="users-row"
                        >
                          <td className="px-4 py-4">
                            <div className="d-flex align-items-center">
                              <div className="entity-avatar-large me-3 shadow-glow-sm">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-white fw-bold truncate-1">
                                  {u.name}
                                </div>
                                <div className="text-secondary small font-monospace opacity-50">
                                  {u.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="role-chip" data-role={u.role}>
                              {u.role === "admin" && (
                                <FaShieldAlt className="me-2" />
                              )}
                              {(u.role || "customer").toUpperCase()}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className={`status-pill-v2 ${u.status}`}>
                              {u.status === "active" ? (
                                <FaCheckCircle />
                              ) : (
                                <FaBan />
                              )}
                              {u.status.toUpperCase()}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-end">
                            {u.role !== "admin" && (
                              <div className="d-flex justify-content-end gap-2">
                                <Button
                                  variant="glass"
                                  className={`btn-operation ${u.status === "active" ? "text-warning" : "text-success"}`}
                                  onClick={() =>
                                    toggleStatus(u.id, u.role, u.status)
                                  }
                                  title={
                                    u.status === "active"
                                      ? "Block Access"
                                      : "Unblock Access"
                                  }
                                >
                                  {u.status === "active" ? (
                                    <FaBan />
                                  ) : (
                                    <FaCheckCircle />
                                  )}
                                </Button>
                                <Button
                                  variant="glass"
                                  className="btn-operation text-danger"
                                  onClick={() => deleteUser(u.id, u.role)}
                                  title="Terminate Entity"
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            )}
                            {u.role === "admin" && (
                              <span className="text-secondary small font-monospace opacity-25">
                                RESTRICTED
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Logic */}
            {!loading && users.length > USERS_PER_PAGE && (
              <div className="d-flex justify-content-between align-items-center p-4 border-top border-white-5 bg-white-2">
                <span className="text-secondary small font-monospace opacity-50">
                  Showing {startIndex + 1} -{" "}
                  {Math.min(startIndex + USERS_PER_PAGE, users.length)} of{" "}
                  {users.length} Users
                </span>
                <div className="d-flex gap-3">
                  <Button
                    variant="outline"
                    className="px-3"
                    disabled={currentPage === 1}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setCurrentPage((p) => p - 1);
                    }}
                  >
                    <FaChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    className="px-3"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setCurrentPage((p) => p + 1);
                    }}
                  >
                    <FaChevronRight />
                  </Button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
