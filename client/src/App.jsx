import { useState, useEffect } from 'react';
import './App.css';
import PeriodConfig from './components/PeriodConfig';
import PaymentForm from './components/PaymentForm';
import PaymentTable from './components/PaymentTable';
import Summary from './components/Summary';

function App() {
  const [period, setPeriod] = useState({
    startDate: '',
    endDate: ''
  });

  const [payments, setPayments] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  // Cargar datos del localStorage al inicio
  useEffect(() => {
    const savedPeriod = localStorage.getItem('period');
    const savedPayments = localStorage.getItem('payments');

    if (savedPeriod) {
      setPeriod(JSON.parse(savedPeriod));
    }

    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }
  }, []);

  // Guardar período en localStorage cuando cambie
  useEffect(() => {
    if (period.startDate && period.endDate) {
      localStorage.setItem('period', JSON.stringify(period));
    }
  }, [period]);

  // Guardar pagos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const handleAddPayment = (payment) => {
    if (editingIndex !== null) {
      // Editar pago existente
      const updatedPayments = [...payments];
      updatedPayments[editingIndex] = payment;
      setPayments(updatedPayments);
      setEditingIndex(null);
    } else {
      // Agregar nuevo pago
      setPayments([...payments, payment]);
    }
  };

  const handleEditPayment = (index) => {
    setEditingIndex(index);
  };

  const handleDeletePayment = (index) => {
    const updatedPayments = payments.filter((_, i) => i !== index);
    setPayments(updatedPayments);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que deseas borrar todos los registros?')) {
      setPayments([]);
      setPeriod({ startDate: '', endDate: '' });
      localStorage.removeItem('period');
      localStorage.removeItem('payments');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📋 Sistema de Gestión de Pagos</h1>
      </header>

      <div className="app-container">
        <PeriodConfig
          period={period}
          onChange={handlePeriodChange}
          workDays={payments.filter(p => p.hours > 0).length}
        />

        <PaymentForm
          onSubmit={handleAddPayment}
          editingPayment={editingIndex !== null ? payments[editingIndex] : null}
          onCancelEdit={handleCancelEdit}
        />

        <PaymentTable
          payments={payments}
          onEdit={handleEditPayment}
          onDelete={handleDeletePayment}
        />

        <Summary payments={payments} />

        {payments.length > 0 && (
          <div className="clear-section">
            <button className="btn-clear" onClick={handleClearAll}>
              🗑️ Borrar Todos los Registros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
