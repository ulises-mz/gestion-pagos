<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight request de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Leer el body del request
$rawData = file_get_contents('php://input');

// Validar que sea JSON válido
$data = json_decode($rawData, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido']);
    exit;
}

// Validar que sea un array
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Los datos deben ser un array']);
    exit;
}

// Ruta al archivo de datos
$dataFile = __DIR__ . '/../data/quincenas.json';

// Asegurar que la carpeta existe
$dataDir = dirname($dataFile);
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Guardar los datos
$result = file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al guardar los datos']);
    exit;
}

// Responder con éxito
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Datos guardados correctamente',
    'count' => count($data)
]);
?>
