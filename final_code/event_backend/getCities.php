<?php
include("headers.php");
include("config/db.php");

$sql = "
SELECT DISTINCT city 
FROM events 
WHERE status = 'approved'
ORDER BY city ASC
";

$result = $conn->query($sql);

$cities = [];
while ($row = $result->fetch_assoc()) {
    $cities[] = $row['city'];
}

echo json_encode([
    "status" => true,
    "cities" => $cities
]);
