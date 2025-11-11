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
      setQuincenas(JSON.parse(savedQuincenas));
    }

    if (savedActiveId) {
      setActiveQuincenaId(savedActiveId);
    }
  }, []);

  // Guardar quincenas en localStorage cuando cambien
  useEffect(() => {
    if (quincenas.length > 0) {
      localStorage.setItem('quincenas', JSON.stringify(quincenas));
    }
  }, [quincenas]);

  // Guardar quincena activa
  useEffect(() => {
    if (activeQuincenaId) {
      localStorage.setItem('activeQuincenaId', activeQuincenaId);
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

  // Cerrar quincena (archivar)
  const handleCloseQuincena = () => {
    if (window.confirm('¿Deseas cerrar esta quincena y crear una nueva?')) {
      setActiveQuincenaId(null);
      setEditingIndex(null);
    }
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
