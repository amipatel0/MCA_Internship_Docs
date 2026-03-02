<?php
session_start();
include "../headers.php";
include "../config/db.php";

//Check login
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => false, "message" => "Login required"]);
    exit;
}

$user_id = $_SESSION['user_id'];

//Check role
$roleQuery = $conn->prepare("SELECT role FROM users WHERE id=?");
$roleQuery->bind_param("i", $user_id);
$roleQuery->execute();
$user = $roleQuery->get_result()->fetch_assoc();

if (!$user || $user['role'] !== 'customer') {
    echo json_encode(["status" => false, "message" => "Only customers can view registrations"]);
    exit;
}

//Fetch registrations + event info
$stmt = $conn->prepare("
    SELECT 
        er.id,
        er.ticket_id,
        er.registered_at,
        er.status,
        e.title AS event_name,
        e.location,
        e.city,
        e.date_time,
        e.event_type,
        e.price,

        -- SIMPLE payment check
        EXISTS (
            SELECT 1 
            FROM bookings eb 
            WHERE eb.registration_id = er.id
            AND eb.payment_status = 'paid'
        ) AS is_paid
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    WHERE er.user_id=?
    ORDER BY er.registered_at DESC
");


$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$registrations = [];
while ($row = $result->fetch_assoc()) {
    $registrations[] = $row;
}

echo json_encode(["status" => true, "data" => $registrations]);
