import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BiCalendarEvent, BiMap, BiPurchaseTag, BiRupee } from "react-icons/bi";
import "./styles/BookEvent.css";
import { useNotification } from "../context/NotificationContext";

export default function BookEvent() {
  const { showNotification } = useNotification();
  const { id } = useParams();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    axios
      .get(
        `http://localhost/event_backend/customer/get_registrations_by_id.php?id=${id}`,
        {
          withCredentials: true,
        },
      )
      .then((res) => {
        if (res.data.status) {
          setRegistration(res.data.data);
          // For free events, navigate to ticket page automatically if already registered
          if (res.data.data.event_type === "free") {
            navigate(`/customer/ticket/${res.data.data.id}`);
          }
        } else {
          showNotification(
            res.data.message || "Unable to fetch registration details",
            "error",
          );
          navigate("/customer/dashboard");
        }
      })
      .catch((err) => console.log(err));
  }, [id, navigate]);

  const handlePayNow = async () => {
    try {
      const res = await axios.post(
        "http://localhost/event_backend/customer/create_order.php",
        { registration_id: id },
        { withCredentials: true },
      );

      if (!res.data.status) {
        showNotification(res.data.message || "Order creation failed", "error");
        return;
      }
      if (!res.data.status) {
        showNotification(res.data.message, "error");

        if (res.data.message === "Seats are full") {
          setTimeout(() => {
            navigate("/customer/dashboard");
          }, 1500);
        }

        return;
      }

      const options = {
        key: "rzp_test_SBF48Fsa4aGxKp",
        amount: res.data.amount,
        currency: "INR",
        name: "Event Booking",
        description: registration.event_name,
        order_id: res.data.order_id,
        handler: async function (response) {
          const verify = await axios.post(
            "http://localhost/event_backend/customer/verify_payment.php",
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            },
            { withCredentials: true },
          );

          if (verify.data.status) {
            showNotification(
              "Payment successful! Your ticket is ready.",
              "success",
            );
            setTimeout(() => {
              navigate(`/customer/ticket/${registration.id}`);
            }, 1500);
          } else {
            showNotification(verify.data.message, "error");
            console.log("Verify response:", verify.data);
          }
        },
        theme: { color: "#16a34a" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      showNotification(
        "Something went wrong with the payment process",
        "error",
      );
    }
  };

  if (!registration)
    return (
      <div className="loading-container">
        <p>Loading booking details...</p>
      </div>
    );

  return (
    <div className="book-event-container">
      <div className="book-event-card">
        <div className="book-event-header">
          <h2 className="book-event-title">{registration.event_name}</h2>
          {/* <span className="badge bg-secondary">
            Booking ID: {registration.id}
          </span> */}
        </div>

        <div className="book-event-details">
          <div className="detail-row">
            <div className="detail-icon">
              <BiMap />
            </div>
            <div className="detail-content">
              <span className="detail-label">Location</span>
              <span className="detail-value">{registration.location}</span>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-icon">
              <BiCalendarEvent />
            </div>
            <div className="detail-content">
              <span className="detail-label">Date & Time</span>
              <span className="detail-value">{registration.date_time}</span>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-icon">
              <BiPurchaseTag />
            </div>
            <div className="detail-content">
              <span className="detail-label">Ticket ID</span>
              <span className="detail-value">{registration.ticket_id}</span>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-icon text-success">
              <BiRupee />
            </div>
            <div className="detail-content">
              <span className="detail-label">Total Price</span>
              <span className="detail-value detail-value-price">
                ₹{registration.price}
              </span>
            </div>
          </div>
        </div>

        {registration.event_type === "paid" && (
          <div className="action-area">
            <button className="btn-pay-now" onClick={handlePayNow}>
              Pay Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
