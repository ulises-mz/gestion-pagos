import './PaymentTable.css';

function PaymentTable({ payments, onEdit, onDelete }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return {
      dayName: days[date.getDay()],
      formattedDate: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
  };

  if (payments.length === 0) {
    return (
      <div className="payment-table-empty">
        <p>📋 No hay registros de pagos todavía. Agrega tu primer registro arriba.</p>
      </div>
    );
  }

  return (
    <div className="payment-table-container">
      <h2>📊 Registros de Pagos</h2>
      <div className="table-wrapper">
        <table className="payment-table">
          <thead>
            <tr>
              <th>Día</th>
              <th>Fecha</th>
              <th>Horas</th>
              <th>Horario</th>
              <th>Valor x Hora</th>
              <th>Sucursal</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => {
              const { dayName, formattedDate } = formatDate(payment.date);
              return (
                <tr key={index}>
                  <td data-label="Día">{dayName}</td>
                  <td data-label="Fecha">{formattedDate}</td>
                  <td data-label="Horas">{payment.hours}</td>
                  <td data-label="Horario">{payment.schedule}</td>
                  <td data-label="Valor x Hora">{formatCurrency(payment.hourlyRate)}</td>
                  <td data-label="Sucursal">{payment.branch}</td>
                  <td data-label="Total" className="total-cell">{formatCurrency(payment.total)}</td>
                  <td data-label="Acciones" className="actions-cell">
                    <button
                      className="btn-edit"
                      onClick={() => onEdit(index)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
                          onDelete(index);
                        }
                      }}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentTable;
