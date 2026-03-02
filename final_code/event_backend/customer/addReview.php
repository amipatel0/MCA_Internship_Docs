<?php
session_start();
include "../headers.php";
include "../config/db.php";

header("Content-Type: application/json");

/* 🔐 Login check */
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => false, "message" => "Login required"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$data = json_decode(file_get_contents("php://input"), true);
$event_id = intval($data['event_id'] ?? 0);
$rating   = intval($data['rating'] ?? 0);
$review   = trim($data['review'] ?? "");

/*  Rating validation */
if ($rating < 1 || $rating > 5) {
    echo json_encode(["status" => false, "message" => "Rating must be between 1 and 5"]);
    exit;
}

/*  Check event exists & completed */
$eventQ = $conn->prepare(
    "SELECT date_time FROM events WHERE id = ? AND date_time < NOW()"
);
$eventQ->bind_param("i", $event_id);
$eventQ->execute();
$event = $eventQ->get_result()->fetch_assoc();

if (!$event) {
    echo json_encode(["status" => false, "message" => "Event not completed"]);
    exit;
}

/* Check user registered */
$regQ = $conn->prepare(
    "SELECT id FROM event_registrations 
     WHERE event_id = ? AND user_id = ? AND status = 'confirmed'"
);
$regQ->bind_param("ii", $event_id, $user_id);
$regQ->execute();

if ($regQ->get_result()->num_rows === 0) {
    echo json_encode(["status" => false, "message" => "Only attendees can review"]);
    exit;
}

/* Check already reviewed */
$chkQ = $conn->prepare(
    "SELECT id FROM event_reviews WHERE event_id = ? AND user_id = ?"
);
$chkQ->bind_param("ii", $event_id, $user_id);
$chkQ->execute();

if ($chkQ->get_result()->num_rows > 0) {
    echo json_encode(["status" => false, "message" => "You already reviewed this event"]);
    exit;
}

/*  Insert review */
$ins = $conn->prepare(
    "INSERT INTO event_reviews (event_id, user_id, rating, review)
     VALUES (?, ?, ?, ?)"
);
$ins->bind_param("iiis", $event_id, $user_id, $rating, $review);
$ins->execute();

echo json_encode(["status" => true, "message" => "Review submitted successfully"]);
