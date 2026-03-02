<?php
session_start();
include "../headers.php";
include "../config/db.php";

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status"=>false,"message"=>"Login required"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$data = json_decode(file_get_contents("php://input"), true);
$registration_id = (int)$data['registration_id'];

$stmt = $conn->prepare("
    SELECT er.ticket_id,
           er.status,
           e.price
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    WHERE er.id = ? AND er.user_id = ?
");
$stmt->bind_param("ii",$registration_id,$user_id);
$stmt->execute();
$reg = $stmt->get_result()->fetch_assoc();

if (!$reg || $reg['status'] != 'pending_payment') {
    echo json_encode(["status"=>false,"message"=>"Payment not allowed"]);
    exit;
}

$key_id="rzp_test_SBF48Fsa4aGxKp";
$key_secret="H6k1uXNQjZWF1S25kEKGbfFK";

$amount_paise = (int)($reg['price'] * 100);

$payload = json_encode([
    "receipt" => uniqid(),
    "amount"  => $amount_paise,
    "currency"=> "INR"
]);

$ch = curl_init("https://api.razorpay.com/v1/orders");
curl_setopt_array($ch,[
    CURLOPT_RETURNTRANSFER=>true,
    CURLOPT_POST=>true,
    CURLOPT_USERPWD=>$key_id.":".$key_secret,
    CURLOPT_HTTPHEADER=>["Content-Type: application/json"],
    CURLOPT_POSTFIELDS=>$payload
]);
$response = curl_exec($ch);
curl_close($ch);

$order = json_decode($response,true);

$stmt = $conn->prepare("
    INSERT INTO bookings
    (registration_id,ticket_id,razorpay_order_id,amount,payment_status)
    VALUES(?,?,?,?, 'pending')
");
$stmt->bind_param("issi",
    $registration_id,
    $reg['ticket_id'],
    $order['id'],
    $amount_paise
);
$stmt->execute();

echo json_encode([
    "status"=>true,
    "order_id"=>$order['id'],
    "amount"=>$amount_paise   // already in paise
]);
