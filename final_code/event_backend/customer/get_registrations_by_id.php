<?php
session_start();
include "../headers.php";
include "../config/db.php";

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => false, "message" => "Login required"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$registration_id = (int)($_GET['id'] ?? 0);

if ($registration_id <= 0) {
    echo json_encode(["status" => false, "message" => "Invalid ID"]);
    exit;
}

$stmt = $conn->prepare("
    SELECT 
        er.id,
        er.ticket_id,
        er.status,
        e.title AS event_name,
        e.location,
        e.date_time,
        e.event_type,
        e.price
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    WHERE er.id = ?
      AND er.user_id = ?
      AND er.status IN ('pending_payment','confirmed')
");

$stmt->bind_param("ii", $registration_id, $user_id);
$stmt->execute();

$data = $stmt->get_result()->fetch_assoc();

if (!$data) {
    echo json_encode(["status" => false, "message" => "Registration not found"]);
    exit;
}

echo json_encode(["status" => true, "data" => $data]);
