<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Ruta al archivo de datos
$dataFile = __DIR__ . '/../data/quincenas.json';

// Verificar que el archivo existe
if (!file_exists($dataFile)) {
    // Crear archivo vacío si no existe
    file_put_contents($dataFile, '[]');
    echo '[]';
    exit;
}

// Leer y devolver el contenido
$content = file_get_contents($dataFile);

// Validar que sea JSON válido
$data = json_decode($content, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    // Si el JSON está corrupto, devolver array vacío
    echo '[]';
    exit;
}

// Devolver los datos
echo $content;
?>
