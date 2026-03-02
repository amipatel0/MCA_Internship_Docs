<?php
include("../headers.php");
include("../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

// Sanitize
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$password = $data['password'] ?? '';
$role = $data['role'] ?? '';

// Validation
if ($name == '' || strlen($name) < 3) {
    echo json_encode(["status" => false, "message" => "Invalid name"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => false, "message" => "Invalid email"]);
    exit;
}

if ($phone == '' || !preg_match('/^[0-9]{10,15}$/', $phone)) {
    echo json_encode(["status" => false, "message" => "Invalid phone number sequence"]);
    exit;
}

if (!preg_match('/^(?=.*[A-Za-z])(?=.*\d).{6,}$/', $password)) {
    echo json_encode(["status" => false, "message" => "Weak password"]);
    exit;
}

if (!in_array($role, ['customer', 'organizer'])) {
    echo json_encode(["status" => false, "message" => "Invalid role"]);
    exit;
}

// Check email exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["status" => false, "message" => "Email already exists"]);
    exit;
}

$hashed = password_hash($password, PASSWORD_DEFAULT);

//Always insert as active
$status = "active";

$insert = $conn->prepare(
    "INSERT INTO users (name, email, phone, password, role, status) 
     VALUES (?, ?, ?, ?, ?, ?)"
);
$insert->bind_param("ssssss", $name, $email, $phone, $hashed, $role, $status);

if ($insert->execute()) {
    echo json_encode([
        "status" => true,
        "message" => "Registration successful"
    ]);
} else {
    echo json_encode([
        "status" => false,
        "message" => "Registration failed"
    ]);
}
?>
