import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../context/NotificationContext";
import {
  MdEdit,
  MdDelete,
  MdAdd,
  MdSave,
  MdCancel,
  MdCategory,
} from "react-icons/md";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import "./ManageCategories.css";

export default function ManageCategories() {
  const { showNotification } = useNotification();

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost/event_backend/admin/viewCategories.php",
      );
      if (res.data.status) {
        setCategories(res.data.data);
      }
    } catch (err) {
      showNotification("Failed to fetch categories catalog", "error");
    } finally {
      setTimeout(() => setFetching(false), 800);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("category_name", categoryName);

    try {
      const res = await axios.post(
        "http://localhost/event_backend/admin/addCategories.php",
        formData,
      );

      if (res.data.status) {
        showNotification(res.data.message, "success");
        setCategoryName("");
        fetchCategories();
      } else {
        showNotification(res.data.message, "error");
      }
    } catch (err) {
      showNotification("Error adding category node", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category node?"))
      return;

    const formData = new FormData();
    formData.append("id", id);

    try {
      const res = await axios.post(
        "http://localhost/event_backend/admin/deleteCategory.php",
        formData,
      );

      if (res.data.status) {
        showNotification(res.data.message, "success");
        fetchCategories();
      } else {
        showNotification(res.data.message, "error");
      }
    } catch (err) {
      showNotification("Error deleting category node", "error");
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;

    const formData = new FormData();
    formData.append("id", id);
    formData.append("category_name", editName);

    try {
      const res = await axios.post(
        "http://localhost/event_backend/admin/updateCategory.php",
        formData,
      );

      if (res.data.status) {
        showNotification(res.data.message, "success");
        setEditId(null);
        fetchCategories();
      } else {
        showNotification(res.data.message, "error");
      }
    } catch (err) {
      showNotification("Error updating category node", "error");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <motion.div
      className="manage-categories-premium pb-5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container py-4">
        {/* Classification Header */}
        <header className="dashboard-header-premium mb-5 pt-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="d-flex align-items-center gap-3 mb-3"
              >
                <div className="category-icon-premium shadow-lg">
                  <MdCategory />
                </div>
                <div>
                  <span className="badge-premium-v2 text-uppercase">
                    CLASSIFICATION PROTOCOL
                  </span>
                  <h1 className="text-white fw-black mb-0 display-4">
                    Category{" "}
                    <span className="text-primary-gradient">Manager</span>
                  </h1>
                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-secondary lead mb-0 max-w-600"
              >
                Define the global taxonomy of the system. Construct new
                classification nodes or consolidate existing data structures.
              </motion.p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="telemetry-pill">
                  <span className="dot-live" /> {categories.length} CATEGORIES
                </div>
              </motion.div>
            </div>
          </div>
        </header>

        <div className="row g-5">
          {/* Construction Panel */}
          <div className="col-lg-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky-top pt-2"
              style={{ top: "100px", zIndex: 10 }}
            >
              <GlassCard className="p-4 border-white-5 shadow-2xl">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div className="construct-blob">
                    <MdAdd />
                  </div>
                  <h4 className="text-white fw-black mb-0 fs-5 tracking-tight">
                    CATEGORY CONSTRUCTION
                  </h4>
                </div>

                <form onSubmit={handleAdd}>
                  <div className="mb-4">
                    <label className="text-secondary small fw-black text-uppercase tracking-widest mb-2 d-flex align-items-center gap-2">
                      <span className="dot-mini bg-primary" /> CATEGORY LABEL
                    </label>
                    <input
                      type="text"
                      className="form-control premium-input font-monospace"
                      placeholder="ENTER CLUSTER NAME..."
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !categoryName.trim()}
                    className="w-100 py-3 shadow-glow"
                  >
                    {loading ? "PROCESSING..." : "REGISTER CLUSTER"}
                  </Button>
                </form>
              </GlassCard>
            </motion.div>
          </div>

          {/* Active Nodes Grid */}
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-3 mb-4 pb-2 border-bottom border-white-5">
              <span className="section-indicator-dash" />
              <h3 className="text-white fw-black mb-0 fs-4 tracking-tight">
                ACTIVE CATEGORIES
              </h3>
            </div>

            <div className="row g-4">
              <AnimatePresence>
                {fetching ? (
                  Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="col-md-6">
                        <GlassCard className="p-4 h-100 border-white-5">
                          <Skeleton height="80px" />
                        </GlassCard>
                      </div>
                    ))
                ) : categories.length === 0 ? (
                  <div className="col-12">
                    <div className="empty-catalog-state opacity-25 text-center py-5">
                      <MdCategory size={64} className="mb-3" />
                      <h4 className="fw-black">ZERO DATA CATEGORIES DEFINED</h4>
                    </div>
                  </div>
                ) : (
                  categories.map((cat, index) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="col-md-6"
                    >
                      <GlassCard className="p-4 h-100 border-white-5 cluster-node-card relative overflow-hidden">
                        <div className="d-flex justify-content-between align-items-start mb-4 relative z-1">
                          <span className="node-id font-monospace opacity-50">
                            CATEGORY_{cat.id}
                          </span>
                          <div className="d-flex gap-2">
                            {editId === cat.id ? (
                              <>
                                <Button
                                  variant="glass"
                                  className="btn-operation text-success"
                                  onClick={() => handleUpdate(cat.id)}
                                >
                                  <MdSave />
                                </Button>
                                <Button
                                  variant="glass"
                                  className="btn-operation text-secondary"
                                  onClick={() => setEditId(null)}
                                >
                                  <MdCancel />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="glass"
                                  className="btn-operation text-primary"
                                  onClick={() => {
                                    setEditId(cat.id);
                                    setEditName(cat.category_name);
                                  }}
                                >
                                  <MdEdit />
                                </Button>
                                <Button
                                  variant="glass"
                                  className="btn-operation text-danger"
                                  onClick={() => handleDelete(cat.id)}
                                >
                                  <MdDelete />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {editId === cat.id ? (
                          <input
                            autoFocus
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="form-control premium-input-sm font-monospace"
                          />
                        ) : (
                          <h5 className="text-white fw-black mb-0 tracking-tight text-uppercase">
                            {cat.category_name}
                          </h5>
                        )}

                        <div className="node-accent-bar" />
                      </GlassCard>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
