<?php
session_start();
include("../headers.php");
include("../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if ($email === '' || $password === '') {
    echo json_encode(["status" => false, "message" => "Email and password required"]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => false, "message" => "Invalid email format"]);
    exit();
}

//Include status column
$stmt = $conn->prepare("SELECT id, name, email, phone, password, role, status FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => false, "message" => "User not found"]);
    exit();
}

$user = $result->fetch_assoc();

//Check if blocked BEFORE password verification (optional but cleaner)
if ($user['status'] === 'blocked') {
    echo json_encode([
        "status" => false,
        "message" => "Your account has been blocked by admin. Please contact support."
    ]);
    exit();
}

//Verify password
if (!password_verify($password, $user['password'])) {
    echo json_encode(["status" => false, "message" => "Incorrect password"]);
    exit();
}

//Login success
$_SESSION['user_id'] = $user['id'];
$_SESSION['role'] = $user['role'];
$_SESSION['name'] = $user['name'];
$_SESSION['phone'] = $user['phone'];

echo json_encode([
    "status" => true,
    "message" => "Login successful",
    "user" => [
        "id" => $user['id'],
        "name" => $user['name'],
        "role" => $user['role'],
        "phone" => $user['phone']
    ]
]);
?>
