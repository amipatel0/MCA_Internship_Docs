<?php
include("../headers.php");
include("../config/db.php");

$sql = "
  SELECT e.*, c.category_name
  FROM events e
  JOIN categories c ON e.category_id = c.id
  WHERE e.status = 'approved'
  AND e.date_time >= NOW()
  ORDER BY e.date_time ASC
";

$result = $conn->query($sql);

$today = date("Y-m-d");

$todayEvents = [];
$upcomingEvents = [];

while ($row = $result->fetch_assoc()) {
    $eventDate = date("Y-m-d", strtotime($row['date_time']));
    if ($eventDate == $today) {
        $todayEvents[] = $row;
    } else {
        $upcomingEvents[] = $row;
    }
}

echo json_encode([
    "status" => true,
    "today_events" => $todayEvents,
    "upcoming_events" => $upcomingEvents
]);
