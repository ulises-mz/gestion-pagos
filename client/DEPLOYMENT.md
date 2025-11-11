# 🚀 Guía de Despliegue en Hostinger

Esta guía te ayudará a desplegar la aplicación de Gestión de Pagos en tu hosting de Hostinger paso a paso.

## 📋 Antes de Comenzar

Asegúrate de tener:
- ✅ Una cuenta de Hostinger con un plan de hosting activo
- ✅ Un dominio configurado (o usar el subdominio temporal de Hostinger)
- ✅ Acceso al panel de control (hPanel)
- ✅ Los archivos de build generados en la carpeta `dist/`

## 🔨 Paso 1: Generar los Archivos de Producción

En tu computadora local, dentro de la carpeta del proyecto:

```bash
# Asegúrate de estar en la carpeta client
cd client

# Instala las dependencias (si no lo has hecho)
npm install

# Genera el build de producción
npm run build
```

Esto creará una carpeta `dist/` con todos los archivos optimizados listos para subir.

## 📁 Paso 2: Preparar los Archivos

La carpeta `dist/` debe contener:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].css
│   └── index-[hash].js
└── .htaccess
```

El archivo `.htaccess` ya está incluido y es necesario para que la aplicación funcione correctamente.

## 🌐 Paso 3: Acceder a Hostinger

### Opción A: Usando el Administrador de Archivos (Recomendado)

1. **Inicia sesión** en tu cuenta de Hostinger
2. **Ve al hPanel** (Panel de Control)
3. **Busca y haz clic** en "Administrador de archivos"
4. **Navega** a la carpeta `public_html`

### Opción B: Usando FTP (Alternativo)

1. **Descarga** un cliente FTP como FileZilla
2. **Obtén** las credenciales FTP desde hPanel
3. **Conéctate** al servidor FTP
4. **Navega** a la carpeta `public_html`

## ⬆️ Paso 4: Subir los Archivos

### Si usas el Administrador de Archivos:

1. **Limpia la carpeta `public_html`**:
   - Elimina cualquier archivo `index.html` existente
   - Elimina carpetas de instalaciones anteriores (si las hay)
   - **IMPORTANTE**: NO elimines `.htaccess` de hosting si existe

2. **Sube los archivos**:
   - Haz clic en "Cargar" o "Upload"
   - Selecciona TODOS los archivos de la carpeta `dist/`:
     - `index.html`
     - La carpeta `assets/` completa
     - El archivo `.htaccess`
   - Espera a que termine la carga

### Si usas FTP:

1. **Arrastra y suelta** todo el contenido de `dist/` a `public_html`
2. **Asegúrate** de que se copien todos los archivos y carpetas

## ⚙️ Paso 5: Configurar el .htaccess

Si por alguna razón el archivo `.htaccess` no se subió correctamente:

1. **Crea un nuevo archivo** llamado `.htaccess` en `public_html`
2. **Copia y pega** este contenido:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

3. **Guarda** el archivo

## ✅ Paso 6: Verificar el Despliegue

1. **Abre tu navegador**
2. **Visita tu dominio**: `https://tudominio.com`
3. **Verifica que**:
   - La página carga correctamente
   - Puedes agregar registros de pago
   - Los estilos se ven correctamente
   - No hay errores en la consola del navegador (F12)

## 🐛 Solución de Problemas

### Problema: Página en blanco

**Solución**:
- Verifica que todos los archivos se hayan subido correctamente
- Abre la consola del navegador (F12) y busca errores
- Asegúrate de que el archivo `.htaccess` esté presente

### Problema: Estilos no se cargan

**Solución**:
- Verifica que la carpeta `assets/` se haya subido completamente
- Revisa los permisos de la carpeta (deben ser 755)
- Limpia el caché del navegador (Ctrl + F5)

### Problema: Errores 404

**Solución**:
- Verifica que el archivo `.htaccess` esté configurado correctamente
- Asegúrate de que el módulo `mod_rewrite` esté habilitado en tu hosting
- Contacta al soporte de Hostinger si persiste el problema

### Problema: Los datos no se guardan

**Solución**:
- Verifica que el navegador tenga localStorage habilitado
- Los datos se guardan localmente, no en el servidor
- Limpia los datos del navegador y prueba de nuevo

## 🔄 Actualizaciones Futuras

Cuando necesites actualizar la aplicación:

1. **Genera un nuevo build**: `npm run build`
2. **Haz respaldo** de tus datos actuales (exporta si es necesario)
3. **Elimina** los archivos antiguos de `public_html`
4. **Sube** los nuevos archivos de `dist/`
5. **Limpia** el caché del navegador

## 📱 Optimizaciones Adicionales

### Habilitar HTTPS
1. Ve a hPanel
2. Busca "SSL/TLS"
3. Activa el certificado SSL gratuito
4. Fuerza HTTPS en el .htaccess (añade estas líneas al inicio):

```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Optimizar Rendimiento
- Los archivos ya están minificados y optimizados
- Considera usar un CDN para archivos estáticos
- Habilita compresión GZIP en hPanel

## 📞 Soporte

Si necesitas ayuda adicional:
- **Hostinger Support**: https://www.hostinger.com/contact
- **Chat en vivo**: Disponible 24/7 en hPanel
- **Base de conocimientos**: https://support.hostinger.com

## ✨ Listo

¡Tu aplicación de Gestión de Pagos ahora está en línea! Puedes acceder a ella desde cualquier dispositivo con tu dominio.

**Recuerda**: Los datos se guardan localmente en cada navegador, así que si accedes desde diferentes dispositivos, tendrás registros independientes en cada uno.
