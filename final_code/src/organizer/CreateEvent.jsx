import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaUpload,
  FaMapMarkerAlt,
  FaTags,
  FaFileAlt,
  FaTicketAlt,
  FaMoneyBillWave,
  FaArrowLeft,
  FaPlus,
  FaRocket,
  FaUserAlt,
} from "react-icons/fa";
import { MdOutlineConfirmationNumber } from "react-icons/md";
import API from "../services/api";
import { useNotification } from "../context/NotificationContext";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import "./CreateEvent.css";

export default function CreateEvent() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    title: "",
    date_time: "",
    location: "",
    city: "",
    category_id: "",
    description: "",
    event_type: "free",
    price: "",
    total_seats: "",
  });

  const [categories, setCategories] = useState([]);
  const [poster, setPoster] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const cities = [
    "Nadiad",
    "Anand",
    "Vidhyanagar",
    "Surat",
    "Ahmedabad",
    "Vadodara",
    "Rajkot",
  ];

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("admin/getCategories.php");
        if (res.data?.status) {
          setCategories(res.data.categories);
          if (res.data.categories.length > 0) {
            setFormData((prev) => ({
              ...prev,
              category_id: res.data.categories[0].id,
            }));
          }
        }
      } catch (error) {
        showNotification("Failed to fetch classification parameters", "error");
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPoster(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!poster) {
      showNotification("Please upload event poster", "error");
      setLoading(false);
      return;
    }
     setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "price" && formData.event_type === "free")
        data.append(key, 0);
      else data.append(key, formData[key]);
    });
    data.append("poster", poster);

    try {
      const res = await API.post("organizer/createEvent.php", data);
      if (res.data?.status) {
        showNotification("Event sequence synthesized successfully", "success");
        setTimeout(() => navigate("/organizer/myevents"), 1500);
      } else {
        showNotification(
          res.data?.message || "Synthesis protocol failed",
          "error",
        );
      }
    } catch (error) {
      showNotification("Terminal failure during synthesis", "error");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="create-event-premium pb-5"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container py-4">
        {/* Synthesis Header */}
        <header className="dashboard-header-premium mb-5 pt-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <motion.div
                variants={itemVariants}
                className="d-flex align-items-center gap-3 mb-3"
              >
                <button
                  className="btn-back-square shadow-lg"
                  onClick={() => navigate(-1)}
                >
                  <FaArrowLeft />
                </button>
                <div>
                  <span className="badge-premium-v2 text-uppercase">
                    EVENT SYNTHESIS
                  </span>
                  <h1 className="text-white fw-black mb-0 display-4">
                    Event{" "}
                    <span className="text-primary-gradient">Synthesis</span>
                  </h1>
                </div>
              </motion.div>
              <motion.p
                variants={itemVariants}
                className="text-secondary lead mb-0 max-w-600"
              >
                Deploy new extraordinary event sequences. Configure spatial
                coordinates, temporal frames, and financial parameters for your
                next deployment.
              </motion.p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className="telemetry-pill">
                <span className="dot-live" /> READY
              </div>
            </div>
          </div>
        </header>

        <div className="row justify-content-center">
          <div className="col-xl-10">
            <GlassCard className="p-0 overflow-hidden border-white-5 shadow-3d">
              <form onSubmit={handleSubmit}>
                <div className="row g-0">
                  {/* Visual Configuration */}
                  <div className="col-lg-4 security-visual-panel p-4 p-md-5">
                    <h4 className="text-white fw-black mb-4 d-flex align-items-center gap-2">
                      <FaRocket className="text-primary small" /> EVENT POSTER
                    </h4>
                    <div className="form-group-premium mb-5">
                      <label className="premium-label">EVENT POSTER</label>
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
                      <FaFileAlt className="text-primary small" /> EVENT
                      PARAMETERS
                    </h4>

                    <div className="row g-4">
                      <div className="col-12">
                        <div className="form-group-premium">
                          <label className="premium-label">EVENT TITLE</label>
                          <input
                            name="title"
                            className="premium-input-v3"
                            placeholder="Identify the event node..."
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group-premium">
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
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group-premium">
                          <label className="premium-label">
                            EVENT CATEGORY
                          </label>
                          <div className="input-icon-wrapper">
                            <FaTags className="input-icon-inner" />
                            <select
                              name="category_id"
                              className="premium-input-v3 has-icon"
                              value={formData.category_id}
                              onChange={handleInputChange}
                              required
                            >
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.category_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group-premium">
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
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group-premium">
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
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group-premium">
                          <label className="premium-label">
                            EVENT PROTOCOL
                          </label>
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
                        </div>
                      </div>

                      {formData.event_type === "paid" && (
                        <div className="col-md-6">
                          <div className="form-group-premium">
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
                          </div>
                        </div>
                      )}

                      <div className="col-md-6">
                        <div className="form-group-premium">
                          <label className="premium-label">
                            EVENT CAPACITY
                          </label>
                          <input
                            name="total_seats"
                            type="number"
                            className="premium-input-v3"
                            placeholder="Maximum slots..."
                            value={formData.total_seats}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="form-group-premium">
                          <label className="premium-label">
                            EVENT SYNOPSIS
                          </label>
                          <textarea
                            name="description"
                            className="premium-textarea-v3"
                            rows="4"
                            placeholder="Detailed protocol description..."
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 d-flex gap-3">
                      <Button
                        type="submit"
                        variant="primary"
                        className="px-5 py-3 shadow-glow"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaPlus className="me-2" /> EXECUTE EVENT
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        className="px-4"
                        onClick={() => navigate(-1)}
                      >
                        ABORT EVENT
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
