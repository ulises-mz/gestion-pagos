import './Summary.css';

function Summary({ payments }) {
  const totalHours = payments.reduce((sum, payment) => sum + payment.hours, 0);
  const totalAmount = payments.reduce((sum, payment) => sum + payment.total, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (payments.length === 0) {
    return null;
  }

  return (
    <div className="summary">
      <h2>💰 Resumen de Totales</h2>
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-label">Total de Horas</div>
          <div className="summary-value">{totalHours} hrs</div>
        </div>
        <div className="summary-card highlight">
          <div className="summary-label">Total a Pagar</div>
          <div className="summary-value">{formatCurrency(totalAmount)}</div>
        </div>
      </div>
    </div>
  );
}

export default Summary;
