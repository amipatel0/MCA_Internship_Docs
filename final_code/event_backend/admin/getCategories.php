<?php
include("../headers.php");
include("../config/db.php");

$result = mysqli_query($conn, "SELECT id, category_name FROM categories ORDER BY category_name ASC");

$categories = [];
while ($row = mysqli_fetch_assoc($result)) {
    $categories[] = $row;
}

echo json_encode([
    "status" => true,
    "categories" => $categories
]);
?>
