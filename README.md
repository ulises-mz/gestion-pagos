# 💰 Gestión de Pagos - Sistema de Registro Quincenal

Aplicación web React para gestionar y registrar pagos quincenales con almacenamiento persistente en servidor PHP.

## 📋 Características

- ✅ Registro de pagos por quincena
- ✅ Gestión de múltiples días con selección visual
- ✅ Cálculo automático de tarifas (₡5,000/hr fines de semana, ₡2,400/hr entre semana)
- ✅ Asignación automática de sucursales (UNIBE para días entre semana, H. niños para sábados)
- ✅ Historial completo de quincenas
- ✅ Exportación a CSV
- ✅ Almacenamiento persistente (sobrevive limpieza de navegador)
- ✅ Tema rosa pastel personalizado

## 🚀 Desarrollo Local

### Prerrequisitos

- Node.js (v18 o superior)
- PHP (v7.4 o superior)

### Instalación

1. **Clonar el repositorio e instalar dependencias:**

```bash
cd gestion-pagos/client
npm install
```

2. **Iniciar servidores de desarrollo:**

```bash
# Desde la raíz del proyecto
./dev-server.sh
```

Esto iniciará:
- Servidor PHP en `http://localhost:8000` (API)
- Servidor Vite en `http://localhost:5173` (React App)

3. **Abrir en el navegador:**

```
http://localhost:5173
```

### Desarrollo Manual (Alternativo)

Si prefieres iniciar los servidores manualmente:

```bash
# Terminal 1 - Servidor PHP
php -S localhost:8000

# Terminal 2 - Servidor React
cd client
npm run dev
```

## 📦 Build para Producción

### 1. Generar Build

```bash
cd client
npm run build
```

Esto creará el directorio `dist/` en la raíz del proyecto con todos los archivos listos para producción.

### 2. Estructura de Archivos para Hostinger

Después del build, la estructura será:

```
gestion-pagos/
├── dist/               # Archivos estáticos de React (HTML, CSS, JS)
├── api/               # Endpoints PHP
│   ├── load.php
│   └── save.php
├── data/              # Almacenamiento JSON
│   └── quincenas.json
└── .htaccess          # Configuración Apache
```

## 🌐 Deployment en Hostinger

### Opción 1: Subir por FTP/SFTP

1. **Conectar a Hostinger via FTP** (usar FileZilla, Cyberduck, etc.)

2. **Subir los siguientes directorios/archivos al public_html:**
   ```
   public_html/
   ├── index.html          (de dist/)
   ├── assets/             (de dist/)
   ├── api/
   ├── data/
   └── .htaccess
   ```

3. **Asegurar permisos correctos:**
   - Carpeta `data/`: 755
   - Archivo `data/quincenas.json`: 644

4. **Verificar que .htaccess esté activo:**
   El archivo `.htaccess` debe estar en la raíz de `public_html`

### Opción 2: Subir por Git (Recomendado)

1. **Conectar a Hostinger via SSH**

2. **Clonar el repositorio:**
   ```bash
   cd public_html
   git clone [URL-DEL-REPO] .
   ```

3. **Hacer build:**
   ```bash
   cd client
   npm install
   npm run build
   cd ..
   ```

4. **Mover archivos de dist a raíz:**
   ```bash
   cp -r dist/* .
   ```

5. **Configurar permisos:**
   ```bash
   chmod 755 data
   chmod 644 data/quincenas.json
   ```

### Verificación Post-Deployment

1. Visitar tu sitio: `https://tu-dominio.com`
2. La aplicación debe cargar y mostrar el modal de "Crear Nueva Quincena"
3. Crear una quincena de prueba y verificar que se guarda
4. Recargar la página - los datos deben persistir

## 🔧 Configuración

### Variables de Entorno

No se requieren variables de entorno. La aplicación usa rutas relativas que funcionan automáticamente en producción.

### Modificar Tarifas

Las tarifas están definidas en `client/src/components/PaymentForm.jsx`:

```javascript
const getHourlyRate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00');
  const dayOfWeek = date.getDay();
  return (dayOfWeek === 0 || dayOfWeek === 6) ? 5000 : 2400;
};
```

### Modificar Sucursales por Defecto

En el mismo archivo:

```javascript
const getDefaultBranch = (dateString) => {
  const date = new Date(dateString + 'T00:00:00');
  const dayOfWeek = date.getDay();
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    return 'UNIBE'; // Lunes a viernes
  } else if (dayOfWeek === 6) {
    return 'H. niños'; // Sábados
  }
  return ''; // Domingos
};
```

## 📁 Estructura del Proyecto

```
gestion-pagos/
├── client/                    # Aplicación React
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── App.jsx          # Componente principal
│   │   └── App.css          # Estilos globales
│   ├── vite.config.js       # Configuración Vite
│   └── package.json
├── api/                      # Backend PHP
│   ├── load.php             # Endpoint para cargar datos
│   └── save.php             # Endpoint para guardar datos
├── data/                     # Almacenamiento
│   └── quincenas.json       # Archivo JSON de datos
├── .htaccess                # Configuración Apache
├── dev-server.sh            # Script de desarrollo
└── README.md                # Este archivo
```

## 🐛 Solución de Problemas

### Error: "No se pudieron cargar los datos"

**Causa:** El servidor PHP no está respondiendo o los permisos son incorrectos.

**Solución:**
1. Verificar que la carpeta `data/` existe
2. Verificar permisos: `chmod 755 data && chmod 644 data/quincenas.json`
3. Verificar que los archivos PHP en `api/` son accesibles
4. Revisar logs del servidor en Hostinger

### Los datos no se guardan

**Causa:** Permisos insuficientes en `data/quincenas.json`

**Solución:**
```bash
chmod 666 data/quincenas.json
```

### Error 404 al navegar

**Causa:** `.htaccess` no está funcionando

**Solución:**
1. Verificar que `.htaccess` está en la raíz de `public_html`
2. Verificar que Apache tiene `mod_rewrite` habilitado
3. Contactar soporte de Hostinger para habilitar `.htaccess`

### Página en blanco después de deployment

**Causa:** Rutas incorrectas en archivos JS/CSS

**Solución:**
1. Verificar que todos los archivos de `dist/` se copiaron correctamente
2. Abrir DevTools → Console para ver errores específicos
3. Verificar que `index.html` está en la raíz de `public_html`

## 📞 Soporte

Si encuentras problemas:

1. Revisar los logs del servidor
2. Abrir DevTools del navegador (F12) y revisar la consola
3. Verificar que la API responde: `https://tu-dominio.com/api/load.php`

## 📝 Licencia

Proyecto privado para uso personal.
