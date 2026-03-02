<?php
include("../headers.php");
include("../config/db.php");

$result = mysqli_query($conn, "SELECT * FROM categories ORDER BY id ASC");

$categories = [];

while ($row = mysqli_fetch_assoc($result)) {
    $categories[] = $row;
}

echo json_encode([
    "status" => true,
    "data" => $categories
]);
?>
