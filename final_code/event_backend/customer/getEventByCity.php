<?php
include("../headers.php");
include("../config/db.php");

$city = trim($_GET['city'] ?? '');

if ($city === '') {
  echo json_encode([
    "status" => false,
    "message" => "City required"
  ]);
  exit;
}

$stmt = $conn->prepare("
  SELECT id, title, date_time, location, city, poster, event_type, price
  FROM events
  WHERE city = ?
    AND status = 'approved'
  ORDER BY date_time ASC
");

$stmt->bind_param("s", $city);
$stmt->execute();
$result = $stmt->get_result();

$events = [];
while ($row = $result->fetch_assoc()) {
  $events[] = $row;
}

echo json_encode([
  "status" => true,
  "events" => $events
]);
