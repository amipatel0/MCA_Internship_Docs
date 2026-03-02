<?php
include("../headers.php");
include("../config/db.php");


$category_name = trim($_POST['category_name']);

if ($category_name == "") {
  echo json_encode([
    "status" => false,
    "message" => "Category name required"
  ]);
  exit;
}

// prevent duplicate category
$check = mysqli_query(
  $conn,
  "SELECT id FROM categories WHERE category_name='$category_name'"
);

if (mysqli_num_rows($check) > 0) {
  echo json_encode([
    "status" => false,
    "message" => "Category already exists"
  ]);
  exit;
}

$query = "INSERT INTO categories (category_name) VALUES ('$category_name')";
$result = mysqli_query($conn, $query);

if ($result) {
  echo json_encode([
    "status" => true,
    "message" => "Category added successfully"
  ]);
} else {
  echo json_encode([
    "status" => false,
    "message" => "Failed to add category"
  ]);
}
?>
