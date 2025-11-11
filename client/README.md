# 📋 Sistema de Gestión de Pagos

Sistema web para gestionar y registrar pagos quincenales desarrollado con React y Vite.

## 🚀 Características

- ✅ Configuración de período de pago (fecha inicio y fin)
- ✅ Registro de pagos diarios con:
  - Fecha
  - Horas trabajadas
  - Horarios predefinidos basados en horas
  - Valor por hora en colones (₡)
  - Sucursal
  - Cálculo automático de totales
- ✅ Tabla de registros con opciones de editar y eliminar
- ✅ Resumen de totales (horas y monto)
- ✅ Diseño responsivo (funciona en móviles y tablets)
- ✅ Almacenamiento local (los datos se guardan en el navegador)

## 💻 Desarrollo Local

### Requisitos Previos

- Node.js 18 o superior
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:5173
```

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Producción
npm run build        # Crear build de producción
npm run preview      # Vista previa del build

# Linting
npm run lint         # Verificar código
```

## 📦 Despliegue en Hostinger

### Paso 1: Crear el Build de Producción

```bash
npm run build
```

Esto creará una carpeta `dist/` con todos los archivos optimizados.

### Paso 2: Subir Archivos a Hostinger

1. **Accede a tu panel de control de Hostinger**
2. **Ve a "Administrador de archivos" o usa FTP**
3. **Navega a la carpeta `public_html` (o la carpeta raíz de tu dominio)**
4. **Sube TODO el contenido de la carpeta `dist/`**:
   - `index.html`
   - carpeta `assets/`
   - archivo `.htaccess` (si lo creaste)

### Paso 3: Configurar .htaccess (Importante)

Crea un archivo `.htaccess` en la carpeta raíz de tu hosting con el siguiente contenido:

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

Este archivo asegura que todas las rutas redirijan a `index.html` para que la aplicación funcione correctamente.

### Paso 4: Verificar

Visita tu dominio en el navegador y la aplicación debería estar funcionando.

## 📱 Cómo Usar la Aplicación

### 1. Configurar Período

1. Ingresa la **Fecha de Inicio** del período
2. Ingresa la **Fecha de Fin** del período
3. Haz clic en **"Guardar Período"**

### 2. Agregar Registros de Pago

1. Selecciona la **Fecha** del día trabajado
2. Selecciona las **Horas** trabajadas (4, 5, 8, o 9 horas)
3. Selecciona el **Horario** (aparecen opciones según las horas)
4. Ingresa el **Valor por Hora** en colones
5. Selecciona la **Sucursal**
6. Haz clic en **"Agregar Registro"**

### 3. Editar o Eliminar Registros

- **Editar**: Haz clic en el botón ✏️ del registro que deseas editar
- **Eliminar**: Haz clic en el botón 🗑️ y confirma la eliminación

### 4. Ver Resumen

El resumen muestra automáticamente:
- **Total de Horas** trabajadas en el período
- **Total a Pagar** en colones

### 5. Borrar Todos los Registros

Si deseas comenzar de nuevo, haz clic en **"🗑️ Borrar Todos los Registros"** al final de la página.

## 💾 Almacenamiento de Datos

Los datos se almacenan localmente en tu navegador usando `localStorage`. Esto significa:

- ✅ Los datos permanecen aunque cierres la página
- ✅ No se requiere servidor ni base de datos
- ⚠️ Los datos son específicos del navegador (no se sincronizan entre dispositivos)
- ⚠️ Si borras los datos del navegador, perderás la información

## 🎨 Tecnologías Utilizadas

- **React 19** - Framework de UI
- **Vite 7** - Build tool
- **CSS3** - Estilos y diseño responsivo
- **LocalStorage API** - Persistencia de datos

## 📞 Soporte

Para reportar problemas o sugerencias, contacta al desarrollador.

## 📄 Licencia

Uso privado - Todos los derechos reservados
