import { useState, useEffect } from 'react';
import './PaymentForm.css';

function PaymentForm({ period, onSubmit, editingPayment, onCancelEdit }) {
  const [formData, setFormData] = useState({
    date: '',
    hours: '',
    schedule: '',
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
      setFormData({
        date: editingPayment.date,
        hours: editingPayment.hours.toString(),
        schedule: editingPayment.schedule,
        branch: editingPayment.branch
      });
    }
  }, [editingPayment]);

  // Calcular tarifa automática según el día
  const getHourlyRate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay();
    // 0 = Domingo, 6 = Sábado
    return (dayOfWeek === 0 || dayOfWeek === 6) ? 5000 : 2400;
  };

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

    const hours = parseFloat(formData.hours) || 0;
    const hourlyRate = getHourlyRate(formData.date);
    const total = hours * hourlyRate;

    const payment = {
      date: formData.date,
      hours: hours,
      schedule: formData.schedule,
      hourlyRate: hourlyRate,
      branch: formData.branch,
      total: total
    };

    onSubmit(payment);

    // Limpiar formulario
    setFormData({
      date: '',
      hours: '',
      schedule: '',
      branch: ''
    });
  };

  const handleCancel = () => {
    setFormData({
      date: '',
      hours: '',
      schedule: '',
      branch: ''
    });
    onCancelEdit();
  };

  // Calcular el total previo
  const calculatePreview = () => {
    if (!formData.date || !formData.hours) return null;
    const hours = parseFloat(formData.hours);
    const rate = getHourlyRate(formData.date);
    const total = hours * rate;
    return { rate, total };
  };

  const preview = calculatePreview();

  return (
    <div className="payment-form">
      <h2>{editingPayment ? '✏️ Editar' : '➕ Agregar Pago'}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-grid-simple">
          <div className="form-group">
            <label htmlFor="date">📅 Fecha:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={period.startDate}
              max={period.endDate}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hours">⏰ Horas:</label>
            <select
              id="hours"
              name="hours"
              value={formData.hours}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar...</option>
              {Object.keys(scheduleOptions).map(hours => (
                <option key={hours} value={hours}>{hours}h</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="schedule">🕐 Horario:</label>
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
          </div>

          <div className="form-group">
            <label htmlFor="branch">🏢 Sucursal:</label>
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

        {preview && (
          <div className="payment-preview">
            <span className="preview-label">Tarifa:</span>
            <span className="preview-rate">₡{preview.rate.toLocaleString('es-CR')}/hora</span>
            <span className="preview-label">Total:</span>
            <span className="preview-total">₡{preview.total.toLocaleString('es-CR')}</span>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {editingPayment ? '💾 Guardar' : '✓ Agregar'}
          </button>
          {editingPayment && (
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              ✕ Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default PaymentForm;
