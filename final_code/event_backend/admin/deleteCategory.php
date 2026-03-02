<?php
include("../headers.php");
include("../config/db.php");

$id = intval($_POST['id']);

$query = "DELETE FROM categories WHERE id=$id";
$result = mysqli_query($conn, $query);

if ($result) {
    echo json_encode([
        "status" => true,
        "message" => "Category deleted successfully"
    ]);
} else {
    echo json_encode([
        "status" => false,
        "message" => "Failed to delete category"
    ]);
}
?>
