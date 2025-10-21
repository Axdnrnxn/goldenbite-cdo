<?php
include_once '../config/db.php';

// This query retrieves all products and joins with their category.
$query = "SELECT 
            p.id, 
            p.name, 
            p.description,
            p.price, 
            p.image_url, 
            c.name as category_name 
          FROM products AS p
          JOIN categories AS c ON p.category_id = c.id
          ORDER BY p.name ASC";

$stmt = $conn->prepare($query);
$stmt->execute();

$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

http_response_code(200);
echo json_encode($products);
?>