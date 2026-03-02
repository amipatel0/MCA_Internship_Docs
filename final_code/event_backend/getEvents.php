<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json");

include(__DIR__ . "/config/db.php");

$category = isset($_GET['category']) ? trim($_GET['category']) : "All";
$search   = isset($_GET['search']) ? trim($_GET['search']) : "";
$city     = isset($_GET['city']) ? trim($_GET['city']) : "";

// Current date-time
$now = date('Y-m-d H:i:s');

// Base query
$sql = "
SELECT 
  e.*, 
  c.category_name 
FROM events e
JOIN categories c ON e.category_id = c.id
WHERE e.status = 'approved'
  AND e.date_time >= ?
";

$params = [$now];
$types  = "s";

/* City filter */
if (!empty($city)) {
  $sql .= " AND e.city = ?";
  $params[] = $city;
  $types .= "s";
}

/* Category filter */
if ($category !== 'All') {
  $sql .= " AND c.category_name = ?";
  $params[] = $category;
  $types .= "s";
}

/* Search filter */
if (!empty($search)) {
  $search = strtolower($search);
  $sql .= " AND (
    LOWER(e.title) LIKE ?
    OR LOWER(c.category_name) LIKE ?
    OR LOWER(e.location) LIKE ?
  )";
  $searchTerm = "%$search%";
  $params[] = $searchTerm;
  $params[] = $searchTerm;
  $params[] = $searchTerm;
  $types .= "sss";
}

$sql .= " ORDER BY e.date_time ASC";

/* Prepare & execute */
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
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
