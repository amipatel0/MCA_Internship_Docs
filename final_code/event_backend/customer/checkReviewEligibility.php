<?php
session_start();
include "../headers.php";
include "../config/db.php";

$user_id = $_SESSION['user_id'] ?? 0;
$event_id = intval($_GET['event_id'] ?? 0);

if (!$user_id) {
    echo json_encode(["canReview" => false]);
    exit;
}

$sql = "
SELECT e.id
FROM events e
JOIN event_registrations r ON r.event_id = e.id
LEFT JOIN event_reviews rv ON rv.event_id = e.id AND rv.user_id = r.user_id
WHERE e.id = ?
  AND r.user_id = ?
  AND r.status = 'confirmed'
  AND e.date_time < NOW()
  AND rv.id IS NULL
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $event_id, $user_id);
$stmt->execute();

echo json_encode([
  "canReview" => $stmt->get_result()->num_rows > 0
]);
