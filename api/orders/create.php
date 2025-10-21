<?php
session_start();
include_once '../config/db.php';

// Security: Only logged-in users can place an order.
if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(["message" => "Authentication required. Please log in to place an order."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

// Validate that we received cart data
if (!empty($data->cart) && !empty($data->totalAmount)) {
    // A transaction ensures that all database operations succeed or none of them do.
    // This prevents creating an order without any items if something goes wrong.
    $conn->beginTransaction();

    try {
        // Step 1: Create a new record in the 'orders' table.
        $orderQuery = "INSERT INTO orders (customer_id, total_amount, status) VALUES (:customerId, :totalAmount, 'Pending')";
        $orderStmt = $conn->prepare($orderQuery);
        
        $customerId = $_SESSION['user_id'];
        $orderStmt->bindParam(':customerId', $customerId);
        $orderStmt->bindParam(':totalAmount', $data->totalAmount);
        $orderStmt->execute();
        
        // Get the ID of the order we just created.
        $orderId = $conn->lastInsertId();

        // Step 2: Loop through each item in the cart and save it to 'order_items'.
        $itemQuery = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (:orderId, :productId, :quantity, :price)";
        $itemStmt = $conn->prepare($itemQuery);

        foreach ($data->cart as $item) {
            $itemStmt->bindParam(':orderId', $orderId);
            $itemStmt->bindParam(':productId', $item->id);
            $itemStmt->bindParam(':quantity', $item->quantity);
            $itemStmt->bindParam(':price', $item->price); // Price at the time of order
            $itemStmt->execute();
        }

        // If all queries were successful, commit the transaction to make it permanent.
        $conn->commit();
        http_response_code(201); // 201 Created
        echo json_encode(["message" => "Order created successfully.", "orderId" => $orderId]);

    } catch (Exception $e) {
        // If any query fails, roll back the transaction to undo all changes.
        $conn->rollBack();
        http_response_code(503); // 503 Service Unavailable
        echo json_encode(["message" => "Failed to create order. Please try again. Error: " . $e->getMessage()]);
    }
} else {
    http_response_code(400); // 400 Bad Request
    echo json_encode(["message" => "Incomplete order data. Cart cannot be empty."]);
}
?>