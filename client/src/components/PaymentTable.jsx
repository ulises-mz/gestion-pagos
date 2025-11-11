import './PaymentTable.css';

function PaymentTable({ payments, onEdit, onDelete }) {
  const formatCurrency = (amount) => {
    return `₡${amount.toLocaleString('es-CR')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const dayName = days[date.getDay()];
    const formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    return { dayName, formattedDate, isWeekend };
  };

  // Ordenar por fecha (más reciente primero)
  const sortedPayments = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (payments.length === 0) {
    return (
      <div className="payment-table-empty">
        <p>📋 Sin registros. Agrega tu primer pago arriba.</p>
      </div>
    );
  }

  return (
    <div className="payment-table-container">
      <h2>📊 Registros ({payments.length})</h2>
      <div className="payment-list">
        {sortedPayments.map((payment, index) => {
          const { dayName, formattedDate, isWeekend } = formatDate(payment.date);
          const originalIndex = payments.findIndex(p => p === payment);

          return (
            <div key={index} className={`payment-card ${isWeekend ? 'weekend' : ''}`}>
              <div className="payment-card-header">
                <div className="payment-date">
                  <span className="day-name">{dayName}</span>
                  <span className="date-num">{formattedDate}</span>
                </div>
                <div className="payment-total">{formatCurrency(payment.total)}</div>
              </div>

              <div className="payment-card-body">
                <div className="payment-detail">
                  <span className="detail-label">⏰</span>
                  <span className="detail-value">{payment.hours}h · {payment.schedule}</span>
                </div>
                <div className="payment-detail">
                  <span className="detail-label">🏢</span>
                  <span className="detail-value">{payment.branch}</span>
                </div>
                <div className="payment-detail">
                  <span className="detail-label">💵</span>
                  <span className="detail-value">{formatCurrency(payment.hourlyRate)}/h</span>
                </div>
              </div>

              <div className="payment-card-actions">
                <button
                  className="btn-edit-card"
                  onClick={() => onEdit(originalIndex)}
                  title="Editar"
                >
                  ✏️ Editar
                </button>
                <button
                  className="btn-delete-card"
                  onClick={() => {
                    if (window.confirm('¿Eliminar este registro?')) {
                      onDelete(originalIndex);
                    }
                  }}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PaymentTable;
