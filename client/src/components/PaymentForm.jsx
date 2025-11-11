import { useState, useEffect } from 'react';
import './PaymentForm.css';

function PaymentForm({ onSubmit, editingPayment, onCancelEdit }) {
  const [formData, setFormData] = useState({
    date: '',
    hours: '',
    schedule: '',
    hourlyRate: '',
    branch: ''
  });

  const scheduleOptions = {
    '4': ['8am-12pm', '1pm-5pm', '2pm-6pm'],
    '5': ['8am-1pm', '1pm-6pm', '2pm-7pm'],
    '8': ['7am-4:30pm', '8am-5pm', '10am-7pm', '12pm-9pm'],
    '9': ['8am-5pm', '9am-6pm']
  };

  const branchOptions = ['UNIBE', 'H. niños', 'Central', 'Hatillo', 'Heredia', 'Cartago'];

  useEffect(() => {
    if (editingPayment) {
      setFormData(editingPayment);
    }
  }, [editingPayment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Limpiar el horario si se cambian las horas
      ...(name === 'hours' && { schedule: '' })
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payment = {
      ...formData,
      hours: parseFloat(formData.hours) || 0,
      hourlyRate: parseFloat(formData.hourlyRate.replace(/,/g, '')) || 0,
      total: (parseFloat(formData.hours) || 0) * (parseFloat(formData.hourlyRate.replace(/,/g, '')) || 0)
    };

    onSubmit(payment);

    // Limpiar formulario
    setFormData({
      date: '',
      hours: '',
      schedule: '',
      hourlyRate: '',
      branch: ''
    });
  };

  const handleCancel = () => {
    setFormData({
      date: '',
      hours: '',
      schedule: '',
      hourlyRate: '',
      branch: ''
    });
    onCancelEdit();
  };

  const formatCurrency = (value) => {
    const num = value.replace(/[^\d]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleCurrencyChange = (e) => {
    const formatted = formatCurrency(e.target.value);
    setFormData(prev => ({ ...prev, hourlyRate: formatted }));
  };

  return (
    <div className="payment-form">
      <h2>{editingPayment ? '✏️ Editar Registro' : '➕ Agregar Registro de Pago'}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="date">Fecha:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hours">Horas:</label>
            <select
              id="hours"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar...</option>
              {Object.keys(scheduleOptions).map(hours => (
                <option key={hours} value={hours}>{hours} horas</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="schedule">Horario:</label>
            <select
              id="schedule"
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
              required
              disabled={!formData.hours}
            >
              <option value="">Seleccionar...</option>
              {formData.hours && scheduleOptions[formData.hours]?.map(schedule => (
                <option key={schedule} value={schedule}>{schedule}</option>
              ))}
            </select>
            {!formData.hours && (
              <small className="hint">Selecciona las horas primero</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="hourlyRate">Valor x Hora (₡):</label>
            <input
              type="text"
              id="hourlyRate"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleCurrencyChange}
              placeholder="0,000"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="branch">Sucursal:</label>
            <select
              id="branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar...</option>
              {branchOptions.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editingPayment ? '💾 Guardar Cambios' : '➕ Agregar Registro'}
          </button>
          {editingPayment && (
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              ❌ Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default PaymentForm;
