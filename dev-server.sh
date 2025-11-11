#!/bin/bash

# Script para desarrollo local
# Inicia servidor PHP y Vite simultáneamente

echo "🚀 Iniciando servidores de desarrollo..."
echo ""

# Crear directorio data si no existe
mkdir -p data

# Inicializar archivo JSON si no existe
if [ ! -f "data/quincenas.json" ]; then
    echo "[]" > data/quincenas.json
    echo "✅ Archivo data/quincenas.json creado"
fi

echo "📡 Iniciando servidor PHP en puerto 8000..."
php -S localhost:8000 -t . &
PHP_PID=$!

echo "⚛️  Iniciando Vite dev server..."
cd client && npm run dev &
VITE_PID=$!

echo ""
echo "✅ Servidores iniciados:"
echo "   - PHP API: http://localhost:8000"
echo "   - React App: http://localhost:5173"
echo ""
echo "Presiona Ctrl+C para detener ambos servidores"

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servidores..."
    kill $PHP_PID 2>/dev/null
    kill $VITE_PID 2>/dev/null
    exit 0
}

trap cleanup INT TERM

# Esperar indefinidamente
wait
