<?php
session_start();
include "../headers.php";
include "../config/db.php";

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'organizer') {
    echo json_encode(["status" => false, "message" => "Unauthorized access"]);
    exit;
}

$organizer_id = $_SESSION['user_id'];

if (!isset($_GET['event_id'])) {
    echo json_encode(["status" => false, "message" => "Event ID required"]);
    exit;
}

$event_id = intval($_GET['event_id']);

// Only reviews for this organizer's event
$sql = "SELECT r.id, r.rating, r.review, r.created_at, u.name as user_name
        FROM event_reviews r
        JOIN users u ON r.user_id = u.id
        JOIN events e ON r.event_id = e.id
        WHERE r.event_id = ? AND e.organizer_id = ?
        ORDER BY r.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $event_id, $organizer_id);
$stmt->execute();
$result = $stmt->get_result();

$reviews = [];
while ($row = $result->fetch_assoc()) {
    $reviews[] = $row;
}

echo json_encode(["status" => true, "reviews" => $reviews]);
