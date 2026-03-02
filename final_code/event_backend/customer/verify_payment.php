<?php
session_start();
include "../headers.php";
include "../config/db.php";
require "../includes/notifications.php";
header("Content-Type: application/json");

$conn->begin_transaction();

try {

    //Read JSON input
    $input = json_decode(file_get_contents("php://input"), true);

    $razorpay_payment_id = $input['razorpay_payment_id'] ?? '';
    $razorpay_order_id   = $input['razorpay_order_id'] ?? '';
    $razorpay_signature  = $input['razorpay_signature'] ?? '';

    if (!$razorpay_payment_id || !$razorpay_order_id || !$razorpay_signature) {
        throw new Exception("Invalid payment response");
    }

    //Razorpay Secret Key
    $key_secret = "H6k1uXNQjZWF1S25kEKGbfFK";

    // Generate signature
    $generated_signature = hash_hmac(
        "sha256",
        $razorpay_order_id . "|" . $razorpay_payment_id,
        $key_secret
    );

    if ($generated_signature !== $razorpay_signature) {
        throw new Exception("Signature verification failed");
    }

    //lock booking row
    $stmt = $conn->prepare("
        SELECT b.registration_id,
               er.event_id,
               er.status,
               e.available_seats
        FROM bookings b
        JOIN event_registrations er ON b.registration_id = er.id
        JOIN events e ON er.event_id = e.id
        WHERE b.razorpay_order_id = ?
        FOR UPDATE
    ");
    $stmt->bind_param("s", $razorpay_order_id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if (!$row) throw new Exception("Booking not found");

    if ($row['status'] != 'pending_payment')
        throw new Exception("Invalid payment state");

    if ($row['available_seats'] <= 0)
        throw new Exception("Seats full");

    // Confirm registration
    $updateReg = $conn->prepare("
        UPDATE event_registrations
        SET status='confirmed'
        WHERE id=?
    ");
    $updateReg->bind_param("i", $row['registration_id']);
    $updateReg->execute();

    // Update booking (FIXED HERE)
    $updateBooking = $conn->prepare("
        UPDATE bookings
        SET payment_status='paid',
            razorpay_payment_id=?,
            razorpay_signature=?
        WHERE razorpay_order_id=?
    ");
    $updateBooking->bind_param(
        "sss",
        $razorpay_payment_id,
        $razorpay_signature,
        $razorpay_order_id
    );
    $updateBooking->execute();

    // Reduce seat
    $updateSeat = $conn->prepare("
        UPDATE events
        SET available_seats = available_seats - 1
        WHERE id=?
    ");
    $updateSeat->bind_param("i", $row['event_id']);
    $updateSeat->execute();

    $conn->commit();
/* NOTIFY USER PAYMENT SUCCESS*/
$userStmt = $conn->prepare("
    SELECT er.user_id, e.title
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    WHERE er.id = ?
");
$userStmt->bind_param("i", $row['registration_id']);
$userStmt->execute();
$userData = $userStmt->get_result()->fetch_assoc();

createNotification(
    $conn,
    $userData['user_id'],
    'customer',
    'payment_success',
    'Payment Successful',
    "Payment successful. Your registration for '{$userData['title']}' is confirmed."
);
    echo json_encode([
        "status" => true,
        "message" => "Payment verified successfully"
    ]);

} catch(Exception $e){

    $conn->rollback();

    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ]);
}
