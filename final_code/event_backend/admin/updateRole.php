<?php
include("../headers.php");
include("../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'];
$role = $data['role'];

$sql = "UPDATE users SET role='$role' WHERE id=$id";

if ($conn->query($sql)) {
    echo json_encode(["status" => true, "message" => "Role updated"]);
} else {
    echo json_encode(["status" => false, "message" => "Update failed"]);
}
