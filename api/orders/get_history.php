<?php
session_start();
include_once '../config/db.php';

// Security check: Ensure the user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["message" => "Authentication required."]);
    exit();
}

$customerId = $_SESSION['user_id'];

// This query retrieves all orders for the logged-in customer.
// It uses GROUP_CONCAT to list all product names for each order in a single string.
$query = "SELECT 
            o.id, 
            o.total_amount, 
            o.status, 
            o.order_date,
            GROUP_CONCAT(p.name SEPARATOR ', ') as products
          FROM orders AS o
          JOIN order_items AS oi ON o.id = oi.order_id
          JOIN products AS p ON oi.product_id = p.id
          WHERE o.customer_id = :customerId
          GROUP BY o.id
          ORDER BY o.order_date DESC";

$stmt = $conn->prepare($query);
$stmt->bindParam(':customerId', $customerId);
$stmt->execute();

$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

http_response_code(200);
echo json_encode($orders);
?>