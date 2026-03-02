<?php
session_start();
include "../headers.php";
include "../config/db.php";

//  Login check
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => false, "message" => "Login required"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);
$registration_id = (int)($data['registration_id'] ?? 0);

if ($registration_id <= 0) {
    echo json_encode(["status" => false, "message" => "Invalid registration ID"]);
    exit;
}

//  Fetch registration + event price
$stmt = $conn->prepare("
    SELECT 
        er.ticket_id,
        e.price
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    WHERE er.id = ? 
      AND er.user_id = ?
      AND er.status = 'confirmed'
");
$stmt->bind_param("ii", $registration_id, $user_id);
$stmt->execute();
$reg = $stmt->get_result()->fetch_assoc();

if (!$reg) {
    echo json_encode(["status" => false, "message" => "Registration not found or not approved"]);
    exit;
}

//  Prevent double booking
$check = $conn->prepare("SELECT id FROM booking WHERE registration_id=?");
$check->bind_param("i", $registration_id);
$check->execute();
if ($check->get_result()->num_rows > 0) {
    echo json_encode(["status" => false, "message" => "Already paid for this event"]);
    exit;
}

// //  Insert booking
// $stmt = $conn->prepare("
//     INSERT INTO booking (registration_id, ticket_id, amount, payment_status)
//     VALUES (?, ?, ?, 'paid')
// ");
// $stmt->bind_param("isd", $registration_id, $reg['ticket_id'], $reg['price']);
// $stmt->execute();

// if ($stmt->affected_rows > 0) {
//     echo json_encode(["status" => true, "message" => "Payment successful"]);
// } else {
//     echo json_encode(["status" => false, "message" => "Payment failed"]);
// }
