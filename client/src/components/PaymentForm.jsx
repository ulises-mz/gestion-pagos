import { useState, useEffect } from 'react';
import './PaymentForm.css';

function PaymentForm({ period, existingPayments, onSubmit, editingPayment, onCancelEdit }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [formData, setFormData] = useState({
    hours: '8',
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

  // Generar lista de días del período
  const generatePeriodDays = () => {
    const days = [];
    const start = new Date(period.startDate + 'T00:00:00');
    const end = new Date(period.endDate + 'T00:00:00');

    const current = new Date(start);
    while (current <= end) {
      const dateString = current.toISOString().split('T')[0];
      days.push(dateString);
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Formatear fecha para mostrar
  const formatDateOption = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    return { text: `${dayName} ${day} ${month}`, isWeekend, date: dateString };
  };

  // Obtener fechas disponibles
  const getAvailableDates = () => {
    const allDates = generatePeriodDays();
    const usedDates = new Set(existingPayments.map(p => p.date));
    return allDates.filter(date => !usedDates.has(date));
  };

  // Calcular tarifa automática
  const getHourlyRate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay();
    return (dayOfWeek === 0 || dayOfWeek === 6) ? 5000 : 2400;
  };

  //  Obtener horas por defecto según tipo de día
  const getDefaultHours = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay();
    return (dayOfWeek === 0 || dayOfWeek === 6) ? '5' : '8';
  };

  // Toggle selección de fecha
  const handleDateToggle = (date) => {
    setSelectedDates(prev => {
      if (prev.includes(date)) {
        return prev.filter(d => d !== date);
      } else {
        return [...prev, date];
      }
    });
  };

  // Seleccionar todos
  const handleSelectAll = () => {
    const available = getAvailableDates();
    setSelectedDates(available);
  };

  // Deseleccionar todos
  const handleDeselectAll = () => {
    setSelectedDates([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'hours' && { schedule: '' })
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedDates.length === 0) {
      alert('Selecciona al menos un día');
      return;
    }

    // Crear un pago por cada fecha seleccionada
    selectedDates.forEach(date => {
      const hours = parseFloat(formData.hours) || 0;
      const hourlyRate = getHourlyRate(date);
      const total = hours * hourlyRate;

      const payment = {
        date: date,
        hours: hours,
        schedule: formData.schedule,
        hourlyRate: hourlyRate,
        branch: formData.branch,
        total: total
      };

      onSubmit(payment);
    });

    // Limpiar formulario
    setSelectedDates([]);
    setFormData({
      hours: '8',
      schedule: '',
      branch: ''
    });
  };

  const availableDates = getAvailableDates();

  // Calcular preview total
  const calculateTotalPreview = () => {
    if (selectedDates.length === 0 || !formData.hours) return null;

    const hours = parseFloat(formData.hours);
    let totalAmount = 0;

    selectedDates.forEach(date => {
      const rate = getHourlyRate(date);
      totalAmount += hours * rate;
    });

    return { totalDays: selectedDates.length, totalHours: hours * selectedDates.length, totalAmount };
  };

  const preview = calculateTotalPreview();

  return (
    <div className="payment-form">
      <h2>➕ Agregar Pagos</h2>

      {availableDates.length === 0 ? (
        <div className="no-dates-message">
          ✅ Todos los días de esta quincena tienen registro
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="dates-selection">
            <div className="selection-header">
              <h3>📅 Selecciona los días:</h3>
              <div className="selection-buttons">
                <button type="button" onClick={handleSelectAll} className="btn-select-all">
                  Todos
                </button>
                <button type="button" onClick={handleDeselectAll} className="btn-deselect-all">
                  Ninguno
                </button>
              </div>
            </div>

            <div className="dates-grid">
              {availableDates.map(date => {
                const { text, isWeekend } = formatDateOption(date);
                const isSelected = selectedDates.includes(date);

                return (
                  <label
                    key={date}
                    className={`date-checkbox ${isWeekend ? 'weekend' : ''} ${isSelected ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleDateToggle(date)}
                    />
                    <span className="date-text">{text}</span>
                    {isSelected && <span className="checkmark">✓</span>}
                  </label>
                );
              })}
            </div>
          </div>

          {selectedDates.length > 0 && (
            <>
              <div className="form-inputs">
                <div className="form-group">
                  <label htmlFor="hours">⏰ Horas:</label>
                  <select
                    id="hours"
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                    required
                  >
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
                  <div className="preview-item">
                    <span className="preview-label">Días seleccionados:</span>
                    <span className="preview-value">{preview.totalDays}</span>
                  </div>
                  <div className="preview-item">
                    <span className="preview-label">Horas totales:</span>
                    <span className="preview-value">{preview.totalHours}h</span>
                  </div>
                  <div className="preview-item highlight">
                    <span className="preview-label">Total a pagar:</span>
                    <span className="preview-value">₡{preview.totalAmount.toLocaleString('es-CR')}</span>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  ✓ Agregar {selectedDates.length} {selectedDates.length === 1 ? 'día' : 'días'}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}

export default PaymentForm;
