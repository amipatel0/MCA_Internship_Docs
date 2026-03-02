<?php
session_start();
include "../headers.php";
include "../config/db.php";

header("Content-Type: application/json");

//  allow admin or logged-in users
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status"=>false,"message"=>"Login required"]);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // Fetch all bookings deatils
    $stmt = $conn->prepare("
        SELECT 
            b.id AS booking_id,
            b.registration_id,
            b.ticket_id,
            b.razorpay_order_id,
            b.razorpay_payment_id,
            b.razorpay_signature,
            b.amount,
            b.payment_status,
            er.user_id,
            er.event_id,
            er.status AS registration_status,
            e.title AS event_title,
            e.date_time AS event_date,
            e.location AS event_location,
            u.name AS user_name,
            u.email AS user_email
        FROM bookings b
        JOIN event_registrations er ON b.registration_id = er.id
        JOIN events e ON er.event_id = e.id
        JOIN users u ON er.user_id = u.id
        ORDER BY b.id ASC
    ");
    $stmt->execute();
    $result = $stmt->get_result();

    $bookings = [];
    while($row = $result->fetch_assoc()){
        $bookings[] = $row;
    }

    echo json_encode([
        "status" => true,
        "bookings" => $bookings
    ]);

} catch(Exception $e){
    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ]);
}
