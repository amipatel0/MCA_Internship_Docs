
<?php
session_start();
include("../headers.php");
include("../config/db.php");
require "../includes/notifications.php";

header("Content-Type: application/json");

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["status" => false, "message" => "Unauthorized"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$event_id = $data['event_id'] ?? null;
$status   = $data['status'] ?? null;

$allowedStatus = ['approved', 'rejected', 'cancelled'];

if (!$event_id || !in_array($status, $allowedStatus)) {
    echo json_encode(["status" => false, "message" => "Invalid input"]);
    exit();
}

$conn->begin_transaction();

try {

    /* UPDATE EVENT STATUS*/
    $stmt = $conn->prepare("UPDATE events SET status=? WHERE id=?");
    $stmt->bind_param("si", $status, $event_id);
    $stmt->execute();

    /* GET EVENT + ORGANIZER*/
    $orgStmt = $conn->prepare("SELECT organizer_id, title FROM events WHERE id=?");
    $orgStmt->bind_param("i", $event_id);
    $orgStmt->execute();
    $eventData = $orgStmt->get_result()->fetch_assoc();

    if (!$eventData) {
        throw new Exception("Event not found");
    }

    $organizer_id = $eventData['organizer_id'];
    $event_title  = $eventData['title'];

    /* NOTIFY ORGANIZER*/
    createNotification(
        $conn,
        $organizer_id,
        'organizer',
        'event_status_update',
        "Event {$status}",
        "Your event '{$event_title}' has been {$status} by admin."
    );

    /* IF EVENT APPROVED → NOTIFY ALL CUSTOMERS*/
    if ($status === "approved") {

        $customerQuery = $conn->query("SELECT id FROM users WHERE role='customer'");

        while ($customer = $customerQuery->fetch_assoc()) {

            createNotification(
                $conn,
                $customer['id'],
                'customer',
                'new_event_available',
                'New Event Available',
                "New event '{$event_title}' is now live. Book your seat now!"
            );
        }
    }

    /* IF EVENT IS CANCELLED*/
    if ($status === "cancelled") {

        // Get all PAID bookings
        $bookingStmt = $conn->prepare("
            SELECT b.id, b.razorpay_payment_id, b.amount
            FROM bookings b
            JOIN event_registrations er ON b.registration_id = er.id
            WHERE er.event_id = ?
            AND b.payment_status = 'paid'
        ");
        $bookingStmt->bind_param("i", $event_id);
        $bookingStmt->execute();
        $bookings = $bookingStmt->get_result();

        $key_id = "rzp_test_SBF48Fsa4aGxKp";
        $key_secret = "H6k1uXNQjZWF1S25kEKGbfFK";

        while ($booking = $bookings->fetch_assoc()) {

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
                throw new Exception("Refund failed for payment ID: " . $booking['razorpay_payment_id']);
            }

            $update = $conn->prepare("
                UPDATE bookings
                SET payment_status='refunded',
                    razorpay_refund_id=?,
                    refund_amount=?,
                    refunded_at=NOW()
                WHERE id=?
            ");

            $update->bind_param(
                "sii",
                $result['id'],
                $result['amount'],
                $booking['id']
            );

            if (!$update->execute()) {
                throw new Exception("Booking update failed");
            }
        }

        /* RESTORE SEATS*/
        $countStmt = $conn->prepare("
            SELECT COUNT(*) AS total
            FROM event_registrations
            WHERE event_id = ?
            AND status IN ('confirmed','pending_payment')
        ");
        $countStmt->bind_param("i", $event_id);
        $countStmt->execute();
        $countResult = $countStmt->get_result()->fetch_assoc();
        $restoreCount = (int)$countResult['total'];

        $restoreSeats = $conn->prepare("
            UPDATE events
            SET available_seats = available_seats + ?
            WHERE id = ?
        ");
        $restoreSeats->bind_param("ii", $restoreCount, $event_id);
        $restoreSeats->execute();

        // Mark registrations cancelled
        $regStmt = $conn->prepare("
            UPDATE event_registrations
            SET status='cancelled_by_admin'
            WHERE event_id=?
        ");
        $regStmt->bind_param("i", $event_id);
        $regStmt->execute();

        /* NOTIFY ALL REGISTERED USERS*/
        $userStmt = $conn->prepare("
            SELECT user_id
            FROM event_registrations
            WHERE event_id=?
        ");
        $userStmt->bind_param("i", $event_id);
        $userStmt->execute();
        $users = $userStmt->get_result();

        while ($u = $users->fetch_assoc()) {
            createNotification(
                $conn,
                $u['user_id'],
                'customer',
                'event_cancelled',
                'Event Cancelled',
                "Event '{$event_title}' has been cancelled by admin. Refund processed if applicable."
            );
        }
    }

    $conn->commit();

    echo json_encode([
        "status" => true,
        "message" => "Event status updated successfully"
    ]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "status" => false,
        "message" => $e->getMessage()
    ]);
}
?>