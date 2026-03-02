<?php
session_start();
include "../headers.php";
include "../config/db.php";

header('Content-Type: application/json');

//  Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Fetch tickets for this user
$stmt = $conn->prepare("
    SELECT 
        e.id AS event_id,
        e.title,
        e.date_time,
        e.location,
        r.ticket_id,
        r.registered_at,
        e.event_type,
        e.price,
        e.poster
    FROM events e
    JOIN event_registrations r ON e.id = r.event_id
    WHERE r.user_id = ?
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$tickets = [];
while ($row = $result->fetch_assoc()) {
    $tickets[] = $row;
}

echo json_encode($tickets);
