import { useState, useEffect } from 'react';
import './App.css';
import QuincenaSelector from './components/QuincenaSelector';
import PaymentForm from './components/PaymentForm';
import PaymentTable from './components/PaymentTable';
import Summary from './components/Summary';

function App() {
  // Sistema de quincenas con historial
  const [quincenas, setQuincenas] = useState([]);
  const [activeQuincenaId, setActiveQuincenaId] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  // Cargar quincenas del localStorage al inicio
  useEffect(() => {
    const savedQuincenas = localStorage.getItem('quincenas');
    const savedActiveId = localStorage.getItem('activeQuincenaId');

    if (savedQuincenas) {
      const parsedQuincenas = JSON.parse(savedQuincenas);
      setQuincenas(parsedQuincenas);

      // Validar que la quincena activa existe
      if (savedActiveId && savedActiveId !== 'null') {
        const quincenaExists = parsedQuincenas.some(q => q.id === savedActiveId);
        if (quincenaExists) {
          setActiveQuincenaId(savedActiveId);
        } else {
          // Si no existe, limpiar
          setActiveQuincenaId(null);
          localStorage.removeItem('activeQuincenaId');
        }
      }
    }
  }, []);

  // Guardar quincenas en localStorage cuando cambien
  useEffect(() => {
    if (quincenas.length > 0) {
      localStorage.setItem('quincenas', JSON.stringify(quincenas));
    } else {
      // Si no hay quincenas, limpiar localStorage
      localStorage.removeItem('quincenas');
    }
  }, [quincenas]);

  // Guardar quincena activa
  useEffect(() => {
    if (activeQuincenaId) {
      localStorage.setItem('activeQuincenaId', activeQuincenaId);
    } else {
      localStorage.removeItem('activeQuincenaId');
    }
  }, [activeQuincenaId]);

  // Obtener quincena activa
  const activeQuincena = quincenas.find(q => q.id === activeQuincenaId);

  // Crear nueva quincena
  const handleCreateQuincena = (startDate, endDate) => {
    const newQuincena = {
      id: Date.now().toString(),
      startDate,
      endDate,
      payments: [],
      createdAt: new Date().toISOString()
    };

    setQuincenas([...quincenas, newQuincena]);
    setActiveQuincenaId(newQuincena.id);
  };

  // Cambiar quincena activa
  const handleSelectQuincena = (quincenaId) => {
    setActiveQuincenaId(quincenaId);
    setEditingIndex(null);
  };

  // Agregar o editar pago
  const handleAddPayment = (payment) => {
    if (!activeQuincenaId) return;

    const updatedQuincenas = quincenas.map(q => {
      if (q.id === activeQuincenaId) {
        if (editingIndex !== null) {
          // Editar pago existente
          const updatedPayments = [...q.payments];
          updatedPayments[editingIndex] = payment;
          return { ...q, payments: updatedPayments };
        } else {
          // Agregar nuevo pago
          return { ...q, payments: [...q.payments, payment] };
        }
      }
      return q;
    });

    setQuincenas(updatedQuincenas);
    setEditingIndex(null);
  };

  // Editar pago
  const handleEditPayment = (index) => {
    setEditingIndex(index);
  };

  // Eliminar pago
  const handleDeletePayment = (index) => {
    if (!activeQuincenaId) return;

    const updatedQuincenas = quincenas.map(q => {
      if (q.id === activeQuincenaId) {
        const updatedPayments = q.payments.filter((_, i) => i !== index);
        return { ...q, payments: updatedPayments };
      }
      return q;
    });

    setQuincenas(updatedQuincenas);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  // Eliminar quincena
  const handleDeleteQuincena = (quincenaId) => {
    if (window.confirm('¿Estás seguro de eliminar esta quincena? Se perderán todos los registros.')) {
      const updatedQuincenas = quincenas.filter(q => q.id !== quincenaId);
      setQuincenas(updatedQuincenas);

      if (activeQuincenaId === quincenaId) {
        setActiveQuincenaId(updatedQuincenas.length > 0 ? updatedQuincenas[0].id : null);
      }
    }
  };

  // Cerrar quincena (ir al historial)
  const handleCloseQuincena = () => {
    setActiveQuincenaId(null);
    setEditingIndex(null);
  };

  // Descargar desglose de quincena en CSV
  const handleDownloadQuincena = (quincenaId) => {
    const quincena = quincenas.find(q => q.id === quincenaId);
    if (!quincena) return;

    // Preparar datos para CSV
    const formatDate = (dateString) => {
      const date = new Date(dateString + 'T00:00:00');
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      return `${dayNames[date.getDay()]} ${date.toLocaleDateString('es-ES')}`;
    };

    // Ordenar pagos por fecha
    const sortedPayments = [...quincena.payments].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Crear contenido CSV
    let csvContent = '\uFEFF'; // BOM para UTF-8
    csvContent += `REGISTRO DE PAGOS QUINCENAL\n`;
    csvContent += `Período:,${new Date(quincena.startDate).toLocaleDateString('es-ES')} - ${new Date(quincena.endDate).toLocaleDateString('es-ES')}\n`;
    csvContent += `\n`;
    csvContent += `Día,Fecha,Horas,Horario,Valor x Hora (₡),Sucursal,Total (₡)\n`;

    // Agregar cada pago
    sortedPayments.forEach(payment => {
      csvContent += `${formatDate(payment.date)},${new Date(payment.date).toLocaleDateString('es-ES')},${payment.hours},${payment.schedule},"${payment.hourlyRate.toLocaleString('es-CR')}",${payment.branch},"${payment.total.toLocaleString('es-CR')}"\n`;
    });

    // Totales
    const totalHours = sortedPayments.reduce((sum, p) => sum + p.hours, 0);
    const totalAmount = sortedPayments.reduce((sum, p) => sum + p.total, 0);

    csvContent += `\n`;
    csvContent += `TOTALES:,,${totalHours},,,,"${totalAmount.toLocaleString('es-CR')}"\n`;
    csvContent += `\n`;
    csvContent += `Días laborados:,${sortedPayments.length}\n`;

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const fileName = `Quincena_${new Date(quincena.startDate).toLocaleDateString('es-ES').replace(/\//g, '-')}_${new Date(quincena.endDate).toLocaleDateString('es-ES').replace(/\//g, '-')}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Gestión de Pagos</h1>
      </header>

      <div className="app-container">
        <QuincenaSelector
          quincenas={quincenas}
          activeQuincenaId={activeQuincenaId}
          onCreateQuincena={handleCreateQuincena}
          onSelectQuincena={handleSelectQuincena}
          onDeleteQuincena={handleDeleteQuincena}
          onCloseQuincena={handleCloseQuincena}
          onDownloadQuincena={handleDownloadQuincena}
        />

        {activeQuincena && (
          <>
            <PaymentForm
              period={{ startDate: activeQuincena.startDate, endDate: activeQuincena.endDate }}
              existingPayments={activeQuincena.payments}
              onSubmit={handleAddPayment}
              editingPayment={editingIndex !== null ? activeQuincena.payments[editingIndex] : null}
              onCancelEdit={handleCancelEdit}
            />

            <PaymentTable
              payments={activeQuincena.payments}
              onEdit={handleEditPayment}
              onDelete={handleDeletePayment}
            />

            <Summary payments={activeQuincena.payments} period={{ startDate: activeQuincena.startDate, endDate: activeQuincena.endDate }} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
