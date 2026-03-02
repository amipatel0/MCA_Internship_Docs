<?php
session_start();
include "../headers.php";
include "../config/db.php";

header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => false, "message" => "Login required"]);
    exit;
}

// $data = json_decode(file_get_contents("php://input"), true);
// $booking_id = (int)($data['booking_id'] ?? 0);

$booking_id = (int)($_POST['booking_id'] ?? 0);


if ($booking_id <= 0) {
    echo json_encode(["status" => false, "message" => "Invalid booking"]);
    exit;
}

// Fetch booking + event + registration status
$stmt = $conn->prepare("
    SELECT 
        b.razorpay_payment_id,
        b.amount,
        b.registration_id,
        b.payment_status,
        e.status AS event_status,
        er.status AS registration_status
    FROM bookings b
    JOIN event_registrations er ON b.registration_id = er.id
    JOIN events e ON er.event_id = e.id
    WHERE b.id = ?
");
$stmt->bind_param("i", $booking_id);
$stmt->execute();
$booking = $stmt->get_result()->fetch_assoc();

if (!$booking || $booking['payment_status'] !== 'paid') {
    echo json_encode(["status" => false, "message" => "Refund not allowed"]);
    exit;
}

// Allow refund only if admin cancelled
if (
    $booking['event_status'] !== 'cancelled' &&
    $booking['registration_status'] !== 'cancelled_by_admin'
) {
    echo json_encode([
        "status" => false,
        "message" => "Refund allowed only if event or booking cancelled by admin"
    ]);
    exit;
}

$key_id = "rzp_test_SBF48Fsa4aGxKp";
$key_secret = "H6k1uXNQjZWF1S25kEKGbfFK";

//  FIX: Force exact integer paise (avoid float precision error)
$refundAmount = (int) $booking['amount'];

$payload = json_encode([
    "amount" => $refundAmount
]);

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => "https://api.razorpay.com/v1/payments/" . $booking['razorpay_payment_id'] . "/refund",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_USERPWD => $key_id . ":" . $key_secret,
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
    CURLOPT_POSTFIELDS => $payload
]);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode([
        "status" => false,
        "message" => "Curl error",
        "error" => curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

curl_close($ch);

$result = json_decode($response, true);
$refund_id = $result['id'];
$refund_amount = $result['amount'];
if (isset($result['id'])) {

    $conn->begin_transaction();

    try {

    $update = $conn->prepare("
        UPDATE bookings
        SET 
            payment_status = 'refunded',
            razorpay_refund_id = ?,
            refund_amount = ?,
            refunded_at = NOW()
        WHERE id = ?
    ");

    $update->bind_param("sii", $refund_id, $refund_amount, $booking_id);
    $update->execute();

        // Restore seat
        $restoreSeat = $conn->prepare("
            UPDATE events e
            JOIN event_registrations er ON er.event_id = e.id
            SET e.available_seats = e.available_seats + 1
            WHERE er.id = ?
        ");
        $restoreSeat->bind_param("i", $booking['registration_id']);
        $restoreSeat->execute();

        $conn->commit();

        echo json_encode([
            "status" => true,
            "message" => "Refund successful"
        ]);

    } catch (Exception $e) {

        $conn->rollback();

        echo json_encode([
            "status" => false,
            "message" => "Refund failed",
            "error" => $e->getMessage()
        ]);
    }

} else {

    echo json_encode([
        "status" => false,
        "message" => "Razorpay refund failed",
        "razorpay_response" => $result
    ]);
}
