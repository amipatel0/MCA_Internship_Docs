<?php
session_start();
include "../headers.php";
include "../config/db.php";

header("Content-Type: application/json");

// Login check
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => false, "message" => "Login required"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$type   = $_GET['type'] ?? 'all';
$reg_id = isset($_GET['reg_id']) ? intval($_GET['reg_id']) : null;

// Updated query (JOIN bookings + statuses added)
$query = "
    SELECT 
        r.id AS reg_id,
        r.ticket_id,
        r.status AS registration_status,
        r.registered_at,

        b.id AS booking_id,
        b.payment_status,

        e.title,
        e.date_time,
        e.location,
        e.city,
        e.event_type,
        e.price,
        e.poster,
        e.status AS event_status

    FROM event_registrations r
    JOIN events e ON e.id = r.event_id
    LEFT JOIN bookings b ON b.registration_id = r.id
    WHERE r.user_id = ?
";

// Single ticket
if ($reg_id) {
    $query .= " AND r.id = ?";
}

// Date filters (list view only)
$now = date('Y-m-d H:i:s');

if (!$reg_id) {
    if ($type === 'past') {
        $query .= " AND e.date_time < ?";
    } elseif ($type === 'present') {
        $query .= " AND e.date_time >= ? AND e.date_time <= DATE_ADD(?, INTERVAL 1 DAY)";
    } elseif ($type === 'future') {
        $query .= " AND e.date_time > ?";
    }
}

$stmt = $conn->prepare($query);

// 🔥 Correct binding
if ($reg_id) {
    $stmt->bind_param("ii", $user_id, $reg_id);

} elseif ($type === 'past' || $type === 'future') {
    $stmt->bind_param("is", $user_id, $now);

} elseif ($type === 'present') {
    $stmt->bind_param("iss", $user_id, $now, $now);

} else {
    $stmt->bind_param("i", $user_id);
}

$stmt->execute();
$result = $stmt->get_result();

$tickets = [];
while ($row = $result->fetch_assoc()) {
    $tickets[] = $row;
}

if ($reg_id) {
    echo json_encode([
        "status" => true,
        "ticket" => $tickets[0] ?? null
    ]);
} else {
    echo json_encode([
        "status" => true,
        "tickets" => $tickets
    ]);
}
