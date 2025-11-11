#!/bin/bash

echo "🏗️  Preparando build para Hostinger..."
echo ""

# Verificar que existe el directorio client
if [ ! -d "client" ]; then
    echo "❌ Error: No se encuentra el directorio client/"
    exit 1
fi

# Instalar dependencias si es necesario
if [ ! -d "client/node_modules" ]; then
    echo "📦 Instalando dependencias..."
    cd client && npm install && cd ..
fi

# Hacer build
echo "⚛️  Generando build de producción..."
cd client
npm run build
cd ..

# Verificar que el build se creó
if [ ! -d "dist" ]; then
    echo "❌ Error: El build no se generó correctamente"
    exit 1
fi

echo ""
echo "✅ Build completado exitosamente!"
echo ""
echo "📁 Archivos listos para deployment en: ./dist/"
echo ""
echo "📋 PASOS PARA DEPLOYMENT EN HOSTINGER:"
echo ""
echo "1. Conectar a Hostinger via FTP/SFTP"
echo "2. Subir estos archivos a public_html/:"
echo "   - Todo el contenido de dist/ (index.html, assets/, etc.)"
echo "   - Carpeta api/"
echo "   - Carpeta data/"
echo "   - Archivo .htaccess"
echo ""
echo "3. Configurar permisos (via SSH o File Manager):"
echo "   chmod 755 data"
echo "   chmod 644 data/quincenas.json"
echo ""
echo "4. Visitar tu sitio web y verificar que funciona"
echo ""
echo "💡 Tip: Lee el archivo README.md para más detalles"
