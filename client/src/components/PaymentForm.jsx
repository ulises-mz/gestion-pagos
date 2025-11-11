import { useState, useEffect } from 'react';
import './PaymentForm.css';

function PaymentForm({ period, existingPayments, onSubmit, editingPayment, onCancelEdit }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [dayDetails, setDayDetails] = useState({}); // Guarda horas y horario por día
  const [branch, setBranch] = useState('');

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
        // Remover día y sus detalles
        const newDayDetails = { ...dayDetails };
        delete newDayDetails[date];
        setDayDetails(newDayDetails);
        return prev.filter(d => d !== date);
      } else {
        // Agregar día con valores por defecto
        const defaultHours = getDefaultHours(date);
        setDayDetails(prev => ({
          ...prev,
          [date]: {
            hours: defaultHours,
            schedule: ''
          }
        }));
        return [...prev, date];
      }
    });
  };

  // Seleccionar todos
  const handleSelectAll = () => {
    const available = getAvailableDates();
    const newDayDetails = {};
    available.forEach(date => {
      newDayDetails[date] = {
        hours: getDefaultHours(date),
        schedule: ''
      };
    });
    setDayDetails(newDayDetails);
    setSelectedDates(available);
  };

  // Deseleccionar todos
  const handleDeselectAll = () => {
    setSelectedDates([]);
    setDayDetails({});
  };

  // Actualizar detalles de un día específico
  const handleDayDetailChange = (date, field, value) => {
    setDayDetails(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [field]: value,
        ...(field === 'hours' && { schedule: '' }) // Reset schedule si cambian horas
      }
    }));
  };

  // Remover un día de la selección
  const handleRemoveDay = (date) => {
    setSelectedDates(prev => prev.filter(d => d !== date));
    const newDayDetails = { ...dayDetails };
    delete newDayDetails[date];
    setDayDetails(newDayDetails);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedDates.length === 0) {
      alert('Selecciona al menos un día');
      return;
    }

    if (!branch) {
      alert('Selecciona una sucursal');
      return;
    }

    // Validar que todos los días tengan horario
    const missingSchedule = selectedDates.some(date => !dayDetails[date]?.schedule);
    if (missingSchedule) {
      alert('Completa el horario para todos los días seleccionados');
      return;
    }

    // Crear un pago por cada fecha seleccionada con sus horas específicas
    selectedDates.forEach(date => {
      const details = dayDetails[date];
      const hours = parseFloat(details.hours) || 0;
      const hourlyRate = getHourlyRate(date);
      const total = hours * hourlyRate;

      const payment = {
        date: date,
        hours: hours,
        schedule: details.schedule,
        hourlyRate: hourlyRate,
        branch: branch,
        total: total
      };

      onSubmit(payment);
    });

    // Limpiar formulario
    setSelectedDates([]);
    setDayDetails({});
    setBranch('');
  };

  const availableDates = getAvailableDates();

  // Calcular preview total sumando horas individuales
  const calculateTotalPreview = () => {
    if (selectedDates.length === 0) return null;

    let totalHours = 0;
    let totalAmount = 0;

    selectedDates.forEach(date => {
      const details = dayDetails[date];
      if (details) {
        const hours = parseFloat(details.hours) || 0;
        const rate = getHourlyRate(date);
        totalHours += hours;
        totalAmount += hours * rate;
      }
    });

    return { totalDays: selectedDates.length, totalHours, totalAmount };
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
              <div className="selected-days-section">
                <h3>✏️ Edita las horas de cada día:</h3>
                <div className="selected-days-list">
                  {selectedDates.map(date => {
                    const { text, isWeekend } = formatDateOption(date);
                    const details = dayDetails[date] || { hours: '8', schedule: '' };

                    return (
                      <div key={date} className={`selected-day-card ${isWeekend ? 'weekend' : ''}`}>
                        <div className="day-card-header">
                          <span className="day-name-selected">{text}</span>
                          <button
                            type="button"
                            className="btn-remove-day"
                            onClick={() => handleRemoveDay(date)}
                          >
                            ✕
                          </button>
                        </div>

                        <div className="day-card-inputs">
                          <div className="day-input-group">
                            <label>⏰ Horas:</label>
                            <select
                              value={details.hours}
                              onChange={(e) => handleDayDetailChange(date, 'hours', e.target.value)}
                              required
                            >
                              {Object.keys(scheduleOptions).map(hours => (
                                <option key={hours} value={hours}>{hours}h</option>
                              ))}
                            </select>
                          </div>

                          <div className="day-input-group">
                            <label>🕐 Horario:</label>
                            <select
                              value={details.schedule}
                              onChange={(e) => handleDayDetailChange(date, 'schedule', e.target.value)}
                              required
                            >
                              <option value="">Seleccionar...</option>
                              {scheduleOptions[details.hours]?.map(schedule => (
                                <option key={schedule} value={schedule}>{schedule}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="day-card-summary">
                          <span className="day-rate">₡{getHourlyRate(date).toLocaleString()}/h</span>
                          <span className="day-total">
                            ₡{(parseFloat(details.hours) * getHourlyRate(date)).toLocaleString('es-CR')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="branch-section">
                <div className="form-group">
                  <label htmlFor="branch">🏢 Sucursal (para todos los días):</label>
                  <select
                    id="branch"
                    name="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {branchOptions.map(branchOpt => (
                      <option key={branchOpt} value={branchOpt}>{branchOpt}</option>
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
