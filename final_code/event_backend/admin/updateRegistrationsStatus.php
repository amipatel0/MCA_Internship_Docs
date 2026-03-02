<?php
session_start();
include "../headers.php";
include "../config/db.php";
require "../includes/notifications.php";
header("Content-Type: application/json");

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["status"=>false,"message"=>"Unauthorized"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$registration_id = $data['registration_id'] ?? null;
$status = $data['status'] ?? null; // confirmed | rejected

if (!$registration_id || !in_array($status, ['confirmed','rejected'])) {
    echo json_encode(["status"=>false,"message"=>"Invalid input"]);
    exit;
}

$conn->begin_transaction();

try {

    $stmt = $conn->prepare("
        SELECT er.status AS current_status,
               er.event_id,
               e.available_seats,
               e.price
        FROM event_registrations er
        JOIN events e ON er.event_id = e.id
        WHERE er.id = ?
        FOR UPDATE
    ");
    $stmt->bind_param("i", $registration_id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if (!$row) throw new Exception("Registration not found");
    if ($row['current_status'] !== 'pending')
        throw new Exception("Already processed");

    /* IF ADMIN CONFIRMS*/
    if ($status === "confirmed") {

        /* FREE EVENT */
        if ($row['price'] == 0) {

            if ($row['available_seats'] <= 0)
                throw new Exception("No seats available");

            // Reduce seat immediately
            $seatStmt = $conn->prepare("
                UPDATE events
                SET available_seats = available_seats - 1
                WHERE id = ?
            ");
            $seatStmt->bind_param("i", $row['event_id']);
            $seatStmt->execute();

            $new_status = "confirmed";
        }
        else {
            // PAID EVENT → wait for payment
            $new_status = "pending_payment";
        }

    } else {

    // FREE EVENT → restore seat
    if ($row['price'] == 0) {

        $seatStmt = $conn->prepare("
            UPDATE events
            SET available_seats = available_seats + 1
            WHERE id = ?
        ");
        $seatStmt->bind_param("i", $row['event_id']);
        $seatStmt->execute();
    }
    else {

        // PAID EVENT → refund if paid
        $bookingStmt = $conn->prepare("
            SELECT id, razorpay_payment_id, amount
            FROM bookings
            WHERE registration_id = ?
            AND payment_status = 'paid'
        ");
        $bookingStmt->bind_param("i", $registration_id);
        $bookingStmt->execute();
        $booking = $bookingStmt->get_result()->fetch_assoc();

        if ($booking) {

            $key_id = "rzp_test_SBF48Fsa4aGxKp";
            $key_secret = "H6k1uXNQjZWF1S25kEKGbfFK";

            $payload = json_encode([
                "amount" => (int)$booking['amount']
            ]);

            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => "https://api.razorpay.com/v1/payments/" .
                                $booking['razorpay_payment_id'] . "/refund",
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_USERPWD => $key_id . ":" . $key_secret,
                CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
                CURLOPT_POSTFIELDS => $payload
            ]);

            $response = curl_exec($ch);

            if (curl_errno($ch)) {
                throw new Exception("Curl error: " . curl_error($ch));
            }

            curl_close($ch);

            $result = json_decode($response, true);

            if (!isset($result['id'])) {
                throw new Exception("Refund failed");
            }

            $updateBooking = $conn->prepare("
                UPDATE bookings
                SET payment_status='refunded',
                    razorpay_refund_id=?,
                    refund_amount=?,
                    refunded_at=NOW()
                WHERE id=?
            ");

            $updateBooking->bind_param(
                "sii",
                $result['id'],
                $result['amount'],
                $booking['id']
            );

            if (!$updateBooking->execute()) {
                throw new Exception("Booking update failed");
            }
        }
    }

    $new_status = "cancelled_by_admin";
}

    $updateStmt = $conn->prepare("
        UPDATE event_registrations
        SET status = ?
        WHERE id = ?
    ");
    $updateStmt->bind_param("si", $new_status, $registration_id);
    $updateStmt->execute();
    /* GET USER + EVENT*/
$userStmt = $conn->prepare("
    SELECT er.user_id, e.title
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    WHERE er.id = ?
");
$userStmt->bind_param("i", $registration_id);
$userStmt->execute();
$userData = $userStmt->get_result()->fetch_assoc();

$user_id = $userData['user_id'];
$event_title = $userData['title'];

if ($status === "confirmed") {

    if ($row['price'] == 0) {

        createNotification(
            $conn,
            $user_id,
            'customer',
            'registration_confirmed',
            'Registration Confirmed',
            "Your registration for '{$event_title}' is confirmed."
        );

    } else {

        createNotification(
            $conn,
            $user_id,
            'customer',
            'payment_required',
            'Registration Approved',
            "Your registration for '{$event_title}' is approved. Please complete payment."
        );
    }

} else {

    createNotification(
        $conn,
        $user_id,
        'customer',
        'registration_rejected',
        'Registration Rejected',
        "Your registration for '{$event_title}' has been rejected by admin."
    );
}

    $conn->commit();

    echo json_encode(["status"=>true,"message"=>"Status updated successfully"]);

} catch(Exception $e) {
    $conn->rollback();
    echo json_encode(["status"=>false,"message"=>$e->getMessage()]);
}
