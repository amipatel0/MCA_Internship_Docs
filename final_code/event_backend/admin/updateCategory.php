<?php
include("../headers.php");
include("../config/db.php");

$id = intval($_POST['id']);
$category_name = trim($_POST['category_name']);

if ($category_name == "") {
    echo json_encode([
        "status" => false,
        "message" => "Category name required"
    ]);
    exit;
}

// Prevent duplicate (except current id)
$check = mysqli_query(
    $conn,
    "SELECT id FROM categories 
     WHERE category_name='$category_name' AND id != $id"
);

if (mysqli_num_rows($check) > 0) {
    echo json_encode([
        "status" => false,
        "message" => "Category already exists"
    ]);
    exit;
}

$query = "UPDATE categories 
          SET category_name='$category_name' 
          WHERE id=$id";

$result = mysqli_query($conn, $query);

if ($result) {
    echo json_encode([
        "status" => true,
        "message" => "Category updated successfully"
    ]);
} else {
    echo json_encode([
        "status" => false,
        "message" => "Failed to update category"
    ]);
}
?>
