<?php
include_once '../config/db.php';

// This query joins three tables to get all necessary product info
$query = "SELECT 
            p.id, 
            p.name, 
            p.description,
            p.price, 
            p.image_url, 
            c.name as category_name 
          FROM products AS p
          JOIN featured_products AS fp ON p.id = fp.product_id
          JOIN categories AS c ON p.category_id = c.id";

$stmt = $conn->prepare($query);
$stmt->execute();

$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

http_response_code(200);
echo json_encode($products);
?>