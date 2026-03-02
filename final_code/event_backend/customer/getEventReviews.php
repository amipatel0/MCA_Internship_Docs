<?php
session_start();
include "../headers.php";
include "../config/db.php";
header("Content-Type: application/json");

//Check login
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "status" => false,
        "message" => "Login required"
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];

//Get event ID
$event_id = intval($_GET['event_id'] ?? 0);
if ($event_id === 0) {
    echo json_encode([
        "status" => false,
        "message" => "Invalid event ID"
    ]);
    exit;
}

//Check if user is admin
$query = "SELECT role FROM users WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result()->fetch_assoc();
$role = $result['role'] ?? '';

if ($role !== 'admin') {
    // If not admin, check if user is organizer of this event
    $query2 = "SELECT organizer_id FROM events WHERE id = ?";
    $stmt2 = $conn->prepare($query2);
    $stmt2->bind_param("i", $event_id);
    $stmt2->execute();
    $event = $stmt2->get_result()->fetch_assoc();

    if (!$event || $event['organizer_id'] != $user_id) {
        echo json_encode([
            "status" => false,
            "message" => "Not authorized to view reviews"
        ]);
        exit;
    }
}

//Fetch reviews for the event
$query3 = "
    SELECT r.id, r.rating, r.review_text, r.created_at, u.name AS user_name
    FROM event_reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.event_id = ?
    ORDER BY r.created_at DESC
";

$stmt3 = $conn->prepare($query3);
$stmt3->bind_param("i", $event_id);
$stmt3->execute();
$reviews = $stmt3->get_result()->fetch_all(MYSQLI_ASSOC);

//Return JSON response
echo json_encode([
    "status" => true,
    "reviews" => $reviews
]);
