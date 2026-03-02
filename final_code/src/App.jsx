import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Background3D from "./components/Background3D";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";

import OrganizerDashboard from "./organizer/OrganizerDashboard";
import CreateEvent from "./organizer/CreateEvent";
import MyEvents from "./organizer/MyEvents";
import EditEvent from "./organizer/EditEvent";
import OrganizerAnalytics from "./organizer/OrganizerAnalytics";
import OrganizerEventReview from "./organizer/OrganizerEventReview";

import CustomerDashboard from "./customer/CustomerDashboard";
import MyTickets from "./customer/MyTickets";
import BookEvent from "./customer/BookEvent";
import Ticket from "./customer/Ticket";

import AdminDashboard from "./admin/AdminDashboard";
import ManageCategories from "./admin/ManageCategories";
import ManageUsers from "./admin/ManageUsers";
import ManageEvents from "./admin/ManageEvents";
import ManageRegistrations from "./admin/ManageRegistrations";
import ManageMessages from "./admin/ManageMessages";
import EventReviews from "./admin/EventReviews";
import ManageBookings from "./admin/ManageBookings";
import RoleRoute from "./routes/RoleRoutes";
import { useState } from "react";
import Footer from "./components/Footer";
import About  from "./pages/About";
import Contact  from "./pages/Contact";
import BellNotification from "./components/BellNotification";

import { NotificationProvider } from "./context/NotificationContext";
import { CityProvider } from "./context/CityContext"; 

const AnimatedRoutes = ({ setRole, role }) => {
  const location = useLocation();
useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login setRole={setRole} /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/events" element={<PageTransition><Events /></PageTransition>} />
        <Route path="/events/:id" element={<PageTransition><EventDetails /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/notifications" element={<PageTransition><BellNotification /></PageTransition>}/>
        {/* Organizer */}
        <Route path="/organizer/dashboard" element={<PageTransition><RoleRoute roles={["organizer"]}><OrganizerDashboard /></RoleRoute></PageTransition>} />
        <Route path="/organizer/create-event" element={<PageTransition><RoleRoute roles={["organizer"]}><CreateEvent /></RoleRoute></PageTransition>} />
        <Route path="/organizer/myevents" element={<PageTransition><RoleRoute roles={["organizer"]}><MyEvents /></RoleRoute></PageTransition>} />
        <Route path="/organizer/update-event/:id" element={<PageTransition><RoleRoute roles={["organizer"]}><EditEvent /></RoleRoute></PageTransition>} />
        <Route path="/organizer/analytics" element={<PageTransition><RoleRoute roles={["organizer"]}><OrganizerAnalytics /></RoleRoute></PageTransition>} />
        <Route path="/organizer/reviews" element={<PageTransition><RoleRoute roles={["organizer"]}><OrganizerEventReview /></RoleRoute></PageTransition>} />
        {/* Customer */}
        <Route path="/customer/dashboard" element={<PageTransition><RoleRoute roles={["customer"]}><CustomerDashboard /></RoleRoute></PageTransition>} />
        <Route path="/customer/book/:id" element={<PageTransition><RoleRoute roles={["customer"]}><BookEvent /></RoleRoute></PageTransition>} />
        <Route path="/customer/tickets" element={<PageTransition><RoleRoute roles={["customer"]}><MyTickets /></RoleRoute></PageTransition>} />
        <Route path="/customer/ticket/:reg_id" element={<PageTransition><RoleRoute roles={["customer"]}><MyTickets /></RoleRoute></PageTransition>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<PageTransition><RoleRoute roles={["admin"]}><AdminDashboard /></RoleRoute></PageTransition>} />
        <Route path="/admin/categories" element={<PageTransition><RoleRoute roles={["admin"]}><ManageCategories /></RoleRoute></PageTransition>} />
        <Route path="/admin/users" element={<PageTransition><RoleRoute roles={["admin"]}><ManageUsers /></RoleRoute></PageTransition>} />
        <Route path="/admin/events" element={<PageTransition><RoleRoute roles={["admin"]}><ManageEvents /></RoleRoute></PageTransition>} />
        <Route path="/admin/registrations" element={<PageTransition><RoleRoute roles={["admin"]}><ManageRegistrations /></RoleRoute></PageTransition>} />
        <Route path="/admin/reviews" element={<PageTransition><RoleRoute roles={["admin"]}><EventReviews /></RoleRoute></PageTransition>} />
        <Route path="/admin/bookings" element={<PageTransition><RoleRoute roles={["admin"]}><ManageBookings /></RoleRoute></PageTransition>} />
        <Route path="/admin/messages" element={<PageTransition><RoleRoute roles={["admin"]}><ManageMessages /></RoleRoute></PageTransition>} />

        {/* Redirects */}
        <Route path="/organizer" element={<PageTransition><RoleRoute roles={["organizer"]}><Navigate to="/organizer/dashboard" /></RoleRoute></PageTransition>} />
        <Route path="/customer" element={<PageTransition><RoleRoute roles={["customer"]}><Navigate to="/customer/dashboard" /></RoleRoute></PageTransition>} />
        <Route path="/admin" element={<PageTransition><RoleRoute roles={["admin"]}><Navigate to="/admin/dashboard" /></RoleRoute></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

function App() {
  const [role, setRole] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: (e.clientY / window.innerHeight) * 2 - 1,
    });
  };

  return (
    <BrowserRouter>
      <NotificationProvider>
        {/* CityProvider added here */}
        <CityProvider>
          <div onMouseMove={handleMouseMove}>
            <Background3D mousePosition={mousePosition} />
            <Navbar role={role} />

            <main style={{ minHeight: "100vh", paddingTop: "120px" }}>
              <AnimatedRoutes setRole={setRole} role={role} />
            </main>

            <Footer />
          </div>
        </CityProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
