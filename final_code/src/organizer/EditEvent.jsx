import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaUpload,
  FaMapMarkerAlt,
  FaFileAlt,
  FaTags,
  FaMoneyBillWave,
  FaRocket,
  FaPlus,
  FaTicketAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../context/NotificationContext";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import "./EditEvent.css";

export default function EditEvent() {
  const { showNotification } = useNotification();
  const { id } = useParams();
  const navigate = useNavigate();

  const cities = [
    "Nadiad",
    "Anand",
    "Vidhyanagar",
    "Surat",
    "Ahmedabad",
    "Vadodara",
    "Rajkot",
  ];

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    city: "",
    date_time: "",
    description: "",
    category_id: "",
    event_type: "free",
    price: "",
  });

  const [categories, setCategories] = useState([]);
  const [poster, setPoster] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Helper to format date for input
  const formatDateTimeForInput = (dt) => {
    if (!dt) return "";
    return dt.replace(" ", "T").slice(0, 16);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, catRes] = await Promise.all([
          API.get(`organizer/getEvent.php?id=${id}`),
          API.get("admin/getCategories.php"),
        ]);

        if (eventRes.data.status) {
          const e = eventRes.data.event;
          setFormData({
            title: e.title || "",
            location: e.location || "",
            city: e.city || "",
            date_time: formatDateTimeForInput(e.date_time),
            description: e.description || "",
            category_id: e.category_id || "",
            event_type: e.event_type || "free",
            price: e.price || "",
          });

          if (e.poster) {
            setPreviewUrl(
              `http://localhost/event_backend/uploads/events/${e.poster}`,
            );
          }
        } else {
          showNotification("Event node not found", "error");
          navigate("/organizer/myevents");
        }

        if (catRes.data.status) {
          setCategories(catRes.data.categories);
          // console.log(catRes.data.categories);
        }
      } catch (err) {
        showNotification("Failed to synchronize with event grid", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPoster(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const fd = new FormData();
    fd.append("event_id", id);
    fd.append("title", formData.title);
    fd.append("location", formData.location);
    fd.append("city", formData.city);
    fd.append("date_time", formData.date_time);
    fd.append("description", formData.description);
    fd.append("category_id", formData.category_id);
    fd.append("event_type", formData.event_type);
    fd.append("price", formData.event_type === "paid" ? formData.price : 0);
    if (poster) fd.append("poster", poster);

    try {
      const res = await API.post("organizer/updateEvent.php", fd);
      if (res.data.status) {
        showNotification("Event reconfiguration successful", "success");
        setTimeout(() => navigate("/organizer/myevents"), 1000);
      } else {
        showNotification(res.data.message || "Reconfiguration failed", "error");
      }
    } catch {
      showNotification("Terminal connection failure", "error");
    } finally {
      setUpdating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="edit-event-premium">
        <div className="container py-5 mt-5">
          <Skeleton height="60px" width="300px" className="mb-4" />
          <div className="row g-4">
            <div className="col-lg-4">
              <Skeleton height="500px" />
            </div>
            <div className="col-lg-8">
              <Skeleton height="500px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-event-premium">
      <div className="container py-5 mt-5">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="row align-items-center mb-5"
        >
          <div className="col-lg-8 d-flex align-items-center gap-4">
            <button className="btn-back-square" onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </button>
            <div>
              <span className="badge-premium-v2 text-uppercase">
                EVENT SYNTHESIS
              </span>
              <h1 className="text-white fw-black mb-0 display-4">
                Edit <span className="text-primary-gradient">Event</span>
              </h1>
              <p className="text-white-50 lead mb-0">
                Reconfigure your event parameters and media source.
              </p>
            </div>
          </div>
          <div className="col-lg-4 text-lg-end">
            <div className="telemetry-pill">
              <span className="dot-live" /> READY
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <GlassCard className="p-0 border-0 overflow-hidden shadow-3d">
            <div className="row g-0">
              {/* Visual Configuration */}
              <div className="col-lg-4 security-visual-panel p-4 p-md-5">
                <h4 className="text-white fw-black mb-4 d-flex align-items-center gap-2">
                  <FaRocket className="text-primary small" /> EVENT POSTER
                </h4>
                <div className="form-group-premium mb-5">
                  <label className="premium-label">CURRENT MEDIA</label>
                  <div className="upload-container-v2">
                    {previewUrl ? (
                      <div className="preview-mode">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="preview-img-active"
                        />
                        <button
                          type="button"
                          className="btn-change-media"
                          onClick={() => {
                            setPoster(null);
                            setPreviewUrl(null);
                          }}
                        >
                          RECONFIGURE POSTER
                        </button>
                      </div>
                    ) : (
                      <label className="upload-placeholder">
                        <FaUpload className="mb-2 opacity-50" />
                        <span className="small fw-bold opacity-75">
                          UPLOAD POSTER
                        </span>
                        <input
                          type="file"
                          className="d-none"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Parameters */}
              <div className="col-lg-8 data-parameters-panel p-4 p-md-5">
                <h4 className="text-white fw-black mb-4 d-flex align-items-center gap-2">
                  <FaFileAlt className="text-primary small" /> EVENT PARAMETERS
                </h4>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="row g-4"
                >
                  <div className="col-12">
                    <motion.div
                      variants={itemVariants}
                      className="form-group-premium"
                    >
                      <label className="premium-label">EVENT TITLE</label>
                      <input
                        name="title"
                        className="premium-input-v3"
                        placeholder="Identify the event node..."
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </motion.div>
                  </div>

                  <div className="col-md-6">
                    <motion.div
                      variants={itemVariants}
                      className="form-group-premium"
                    >
                      <label className="premium-label">EVENT DATE</label>
                      <div className="input-icon-wrapper">
                        <FaCalendarAlt className="input-icon-inner" />
                        <input
                          name="date_time"
                          type="datetime-local"
                          className="premium-input-v3 has-icon"
                          min={getMinDateTime()}
                          value={formData.date_time}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </motion.div>
                  </div>

                  <div className="col-md-6">
                    <motion.div
                      variants={itemVariants}
                      className="form-group-premium"
                    >
                      <label className="premium-label">EVENT CATEGORY</label>
                      <div className="input-icon-wrapper">
                        <FaTags className="input-icon-inner" />
                        <select
                          name="category_id"
                          className="premium-input-v3 has-icon"
                          value={formData.category_id}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.category_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  </div>

                  <div className="col-md-6">
                    <motion.div
                      variants={itemVariants}
                      className="form-group-premium"
                    >
                      <label className="premium-label">VENUE</label>
                      <div className="input-icon-wrapper">
                        <FaMapMarkerAlt className="input-icon-inner text-danger" />
                        <input
                          name="location"
                          className="premium-input-v3 has-icon"
                          placeholder="Venue location..."
                          value={formData.location}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </motion.div>
                  </div>

                  <div className="col-md-6">
                    <motion.div
                      variants={itemVariants}
                      className="form-group-premium"
                    >
                      <label className="premium-label">CITY</label>
                      <select
                        name="city"
                        className="premium-input-v3"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select City</option>
                        {cities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  </div>

                  <div className="col-md-6">
                    <motion.div
                      variants={itemVariants}
                      className="form-group-premium"
                    >
                      <label className="premium-label">EVENT PROTOCOL</label>
                      <div className="input-icon-wrapper">
                        <FaTicketAlt className="input-icon-inner" />
                        <select
                          name="event_type"
                          className="premium-input-v3 has-icon"
                          value={formData.event_type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="free">FREE</option>
                          <option value="paid">PAID</option>
                        </select>
                      </div>
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {formData.event_type === "paid" && (
                      <div className="col-md-6">
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="form-group-premium"
                        >
                          <label className="premium-label">
                            EVENT TOKEN (₹)
                          </label>
                          <div className="input-icon-wrapper">
                            <FaMoneyBillWave className="input-icon-inner text-success" />
                            <input
                              name="price"
                              type="number"
                              className="premium-input-v3 has-icon"
                              placeholder="Enrollment fee..."
                              value={formData.price}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>

                  <div className="col-12">
                    <motion.div
                      variants={itemVariants}
                      className="form-group-premium"
                    >
                      <label className="premium-label">EVENT SYNOPSIS</label>
                      <textarea
                        name="description"
                        className="premium-textarea-v3"
                        rows="4"
                        placeholder="Detailed protocol description..."
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      />
                    </motion.div>
                  </div>

                  <div className="col-12 d-flex gap-3 pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      className="px-5 py-3 shadow-glow"
                      isLoading={updating}
                    >
                      <FaPlus className="me-2" /> UPDATE EVENT
                    </Button>
                    <Button
                      type="button"
                      variant="glass"
                      className="px-4 border-white-5"
                      onClick={() => navigate(-1)}
                    >
                      ABORT EVENT
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </GlassCard>
        </form>
      </div>
    </div>
  );
}
