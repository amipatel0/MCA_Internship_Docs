<?php
session_start();
include("../headers.php");
include("../config/db.php");

// User must be logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "status" => false,
        "message" => "Unauthorized"
    ]);
    exit;
}

// Only organizers allowed
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'organizer') {
    echo json_encode([
        "status" => false,
        "message" => "Access denied: Only organizers can access this resource"
    ]);
    exit;
}

$organizer_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);
$event_id = $data['event_id'] ?? null;


if (!$event_id) {
  echo json_encode([
    "status" => false,
    "message" => "Event ID missing"
  ]);
  exit;
}

/* Fetch event status */
$stmt = $conn->prepare(
  "SELECT status FROM events WHERE id = ? AND organizer_id = ?"
);
$stmt->bind_param("ii", $event_id, $organizer_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
  echo json_encode([
    "status" => false,
    "message" => "Event not found"
  ]);
  exit;
}

$event = $result->fetch_assoc();

/* Business rules */
if (in_array($event['status'], ['approved', 'cancelled'])) {
  echo json_encode([
    "status" => false,
    "message" => "Approved or cancelled events cannot be deleted"
  ]);
  exit;
}

/* Check registrations */
$regStmt = $conn->prepare(
  "SELECT COUNT(*) AS total FROM event_registrations WHERE event_id = ?"
);
$regStmt->bind_param("i", $event_id);
$regStmt->execute();
$regResult = $regStmt->get_result();
$regCount = $regResult->fetch_assoc()['total'];

if ($regCount > 0) {
  echo json_encode([
    "status" => false,
    "message" => "Event has registrations and cannot be deleted"
  ]);
  exit;
}

/* Delete event */
$delStmt = $conn->prepare(
  "DELETE FROM events WHERE id = ? AND organizer_id = ?"
);
$delStmt->bind_param("ii", $event_id, $organizer_id);

if ($delStmt->execute()) {
  echo json_encode([
    "status" => true,
    "message" => "Event deleted successfully"
  ]);
} else {
  echo json_encode([
    "status" => false,
    "message" => "Failed to delete event"
  ]);
}
