import './Summary.css';

function Summary({ payments, period }) {
  const totalHours = payments.reduce((sum, payment) => sum + payment.hours, 0);
  const totalAmount = payments.reduce((sum, payment) => sum + payment.total, 0);
  const daysWorked = payments.length;

  const formatCurrency = (amount) => {
    return `₡${amount.toLocaleString('es-CR')}`;
  };

  const calculatePeriodDays = () => {
    if (!period || !period.startDate || !period.endDate) return 0;
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (payments.length === 0) {
    return null;
  }

  return (
    <div className="summary">
      <h2>💰 Resumen</h2>
      <div className="summary-grid">
        <div className="summary-card-compact">
          <span className="compact-label">Días trabajados</span>
          <span className="compact-value">{daysWorked} / {calculatePeriodDays()}</span>
        </div>
        <div className="summary-card-compact">
          <span className="compact-label">Horas totales</span>
          <span className="compact-value">{totalHours}h</span>
        </div>
        <div className="summary-card-large">
          <span className="large-label">Total a pagar</span>
          <span className="large-value">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}

export default Summary;
