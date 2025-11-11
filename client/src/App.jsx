import { useState, useEffect } from 'react';
import './App.css';
import QuincenaSelector from './components/QuincenaSelector';
import PaymentForm from './components/PaymentForm';
import PaymentTable from './components/PaymentTable';
import Summary from './components/Summary';

function App() {
  // Sistema de quincenas con historial
  const [quincenas, setQuincenas] = useState([]);
  const [view, setView] = useState('history'); // 'history' | 'edit'
  const [workingQuincena, setWorkingQuincena] = useState(null); // Quincena temporal en edición
  const [editingIndex, setEditingIndex] = useState(null);

  // Cargar quincenas del localStorage al inicio
  useEffect(() => {
    const savedQuincenas = localStorage.getItem('quincenas');
    if (savedQuincenas) {
      const parsedQuincenas = JSON.parse(savedQuincenas);
      setQuincenas(parsedQuincenas);
    }
  }, []);

  // Guardar quincenas en localStorage cuando cambien
  useEffect(() => {
    if (quincenas.length > 0) {
      localStorage.setItem('quincenas', JSON.stringify(quincenas));
    } else {
      localStorage.removeItem('quincenas');
    }
  }, [quincenas]);

  // Iniciar creación de nueva quincena
  const handleStartNewQuincena = (startDate, endDate) => {
    const newQuincena = {
      id: Date.now().toString(),
      startDate,
      endDate,
      payments: [],
      createdAt: new Date().toISOString()
    };

    setWorkingQuincena(newQuincena);
    setView('edit');
  };

  // Abrir quincena existente para edición
  const handleOpenQuincena = (quincenaId) => {
    const quincena = quincenas.find(q => q.id === quincenaId);
    if (quincena) {
      setWorkingQuincena({ ...quincena });
      setView('edit');
      setEditingIndex(null);
    }
  };

  // Guardar quincena (nueva o editada) y volver al historial
  const handleSaveQuincena = () => {
    if (!workingQuincena) return;

    setQuincenas(prevQuincenas => {
      // Verificar si la quincena ya existe
      const existingIndex = prevQuincenas.findIndex(q => q.id === workingQuincena.id);

      if (existingIndex >= 0) {
        // Actualizar quincena existente
        const updated = [...prevQuincenas];
        updated[existingIndex] = workingQuincena;
        return updated;
      } else {
        // Agregar nueva quincena
        return [...prevQuincenas, workingQuincena];
      }
    });

    // Volver al historial
    setWorkingQuincena(null);
    setView('history');
    setEditingIndex(null);
  };

  // Cancelar edición y volver al historial
  const handleCancelEdit = () => {
    setWorkingQuincena(null);
    setView('history');
    setEditingIndex(null);
  };

  // Agregar o editar pago en la quincena temporal
  const handleAddPayment = (payment) => {
    if (!workingQuincena) return;

    setWorkingQuincena(prevQuincena => {
      if (editingIndex !== null) {
        // Editar pago existente
        const updatedPayments = [...prevQuincena.payments];
        updatedPayments[editingIndex] = payment;
        return { ...prevQuincena, payments: updatedPayments };
      } else {
        // Agregar nuevo pago
        return { ...prevQuincena, payments: [...prevQuincena.payments, payment] };
      }
    });

    setEditingIndex(null);
  };

  // Editar pago
  const handleEditPayment = (index) => {
    setEditingIndex(index);
  };

  // Eliminar pago
  const handleDeletePayment = (index) => {
    if (!workingQuincena) return;

    setWorkingQuincena(prevQuincena => ({
      ...prevQuincena,
      payments: prevQuincena.payments.filter((_, i) => i !== index)
    }));

    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  // Cancelar edición de pago
  const handleCancelPaymentEdit = () => {
    setEditingIndex(null);
  };

  // Eliminar quincena del historial
  const handleDeleteQuincena = (quincenaId) => {
    if (window.confirm('¿Estás seguro de eliminar esta quincena? Se perderán todos los registros.')) {
      setQuincenas(prevQuincenas => prevQuincenas.filter(q => q.id !== quincenaId));
    }
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
        {view === 'history' ? (
          // VISTA DE HISTORIAL
          <QuincenaSelector
            quincenas={quincenas}
            onStartNewQuincena={handleStartNewQuincena}
            onOpenQuincena={handleOpenQuincena}
            onDeleteQuincena={handleDeleteQuincena}
            onDownloadQuincena={handleDownloadQuincena}
            viewMode="history"
          />
        ) : (
          // VISTA DE EDICIÓN/CREACIÓN
          <>
            <div className="edit-header">
              <div className="edit-header-content">
                <button className="btn-back" onClick={handleCancelEdit}>
                  ← Volver al historial
                </button>
                <div className="edit-title">
                  <h2>📅 {workingQuincena ? `Quincena: ${new Date(workingQuincena.startDate).toLocaleDateString('es-ES')} - ${new Date(workingQuincena.endDate).toLocaleDateString('es-ES')}` : ''}</h2>
                </div>
              </div>
            </div>

            {workingQuincena && (
              <>
                <PaymentForm
                  period={{ startDate: workingQuincena.startDate, endDate: workingQuincena.endDate }}
                  existingPayments={workingQuincena.payments}
                  onSubmit={handleAddPayment}
                  editingPayment={editingIndex !== null ? workingQuincena.payments[editingIndex] : null}
                  onCancelEdit={handleCancelPaymentEdit}
                />

                <PaymentTable
                  payments={workingQuincena.payments}
                  onEdit={handleEditPayment}
                  onDelete={handleDeletePayment}
                />

                <Summary payments={workingQuincena.payments} period={{ startDate: workingQuincena.startDate, endDate: workingQuincena.endDate }} />

                {workingQuincena.payments.length > 0 && (
                  <div className="save-section">
                    <button className="btn-save-quincena" onClick={handleSaveQuincena}>
                      ✓ Guardar Quincena
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
