import { useState, useRef } from 'react';
import './PaymentForm.css';

function PaymentForm({ period, existingPayments, onSubmit, editingPayment, onCancelEdit }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [dayDetails, setDayDetails] = useState({}); // Guarda horas, horario y sucursal por día
  const [editingDay, setEditingDay] = useState(null); // Día que se está editando en el modal
  const [editFormData, setEditFormData] = useState({ hours: '8', schedule: '', branch: '' });

  const longPressTimer = useRef(null);
  const longPressDelay = 800; // 800ms para activar long press (más largo)
  const touchStartPos = useRef(null); // Para detectar movimiento
  const moveThreshold = 10; // Píxeles de movimiento permitidos antes de cancelar

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

  // Obtener horas por defecto según tipo de día
  const getDefaultHours = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay();
    return (dayOfWeek === 0 || dayOfWeek === 6) ? '5' : '8';
  };

  // Obtener horario por defecto según tipo de día
  const getDefaultSchedule = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay();
    // Lunes a viernes: 7am-4:30pm
    // Sábados y domingos: 8am-1pm
    return (dayOfWeek === 0 || dayOfWeek === 6) ? '8am-1pm' : '7am-4:30pm';
  };

  // Obtener sucursal por defecto según tipo de día
  const getDefaultBranch = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const dayOfWeek = date.getDay();
    // Lunes a viernes: UNIBE
    // Sábados: H. niños
    // Domingos: sin asignar
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      return 'UNIBE';
    } else if (dayOfWeek === 6) {
      return 'H. niños';
    }
    return '';
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
        // Agregar día con valores por defecto (incluyendo horario y sucursal automáticos)
        const defaultHours = getDefaultHours(date);
        const defaultSchedule = getDefaultSchedule(date);
        const defaultBranch = getDefaultBranch(date);
        setDayDetails(prev => ({
          ...prev,
          [date]: {
            hours: defaultHours,
            schedule: defaultSchedule,
            branch: defaultBranch
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
        schedule: getDefaultSchedule(date),
        branch: getDefaultBranch(date)
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

  // Remover un día de la selección
  const handleRemoveDay = (date) => {
    setSelectedDates(prev => prev.filter(d => d !== date));
    const newDayDetails = { ...dayDetails };
    delete newDayDetails[date];
    setDayDetails(newDayDetails);
  };

  // Long press handlers con detección de movimiento
  const handleLongPressStart = (date, event) => {
    // Guardar posición inicial para detectar movimiento
    if (event.touches && event.touches[0]) {
      touchStartPos.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    } else if (event.clientX !== undefined) {
      touchStartPos.current = {
        x: event.clientX,
        y: event.clientY
      };
    }

    longPressTimer.current = setTimeout(() => {
      openEditModal(date);
      touchStartPos.current = null;
    }, longPressDelay);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStartPos.current = null;
  };

  // Detectar movimiento durante el long press
  const handleLongPressMove = (event) => {
    if (!touchStartPos.current || !longPressTimer.current) return;

    let currentX, currentY;
    if (event.touches && event.touches[0]) {
      currentX = event.touches[0].clientX;
      currentY = event.touches[0].clientY;
    } else if (event.clientX !== undefined) {
      currentX = event.clientX;
      currentY = event.clientY;
    } else {
      return;
    }

    const deltaX = Math.abs(currentX - touchStartPos.current.x);
    const deltaY = Math.abs(currentY - touchStartPos.current.y);

    // Si se movió más del threshold, cancelar el long press
    if (deltaX > moveThreshold || deltaY > moveThreshold) {
      handleLongPressEnd();
    }
  };

  // Abrir modal de edición para un día específico
  const openEditModal = (date) => {
    const details = dayDetails[date];
    setEditingDay(date);
    setEditFormData({
      hours: details.hours,
      schedule: details.schedule,
      branch: details.branch
    });
  };

  // Cerrar modal
  const closeEditModal = () => {
    setEditingDay(null);
    setEditFormData({ hours: '8', schedule: '', branch: '' });
  };

  // Guardar cambios del modal
  const handleSaveEdit = () => {
    if (!editFormData.schedule) {
      alert('Selecciona un horario');
      return;
    }

    if (!editFormData.branch) {
      alert('Selecciona una sucursal');
      return;
    }

    setDayDetails(prev => ({
      ...prev,
      [editingDay]: {
        hours: editFormData.hours,
        schedule: editFormData.schedule,
        branch: editFormData.branch
      }
    }));

    closeEditModal();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedDates.length === 0) {
      alert('Selecciona al menos un día');
      return;
    }

    // Validar que todos los días tengan sucursal
    const missingBranch = selectedDates.some(date => !dayDetails[date]?.branch);
    if (missingBranch) {
      alert('Completa la sucursal para todos los días seleccionados');
      return;
    }

    // Crear un pago por cada fecha seleccionada con sus detalles específicos
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
        branch: details.branch,
        total: total
      };

      onSubmit(payment);
    });

    // Limpiar formulario
    setSelectedDates([]);
    setDayDetails({});
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
                <h3>📋 Días seleccionados <span className="hint-text">(mantén presionado para editar)</span></h3>
                <div className="selected-days-list">
                  {selectedDates.map(date => {
                    const { text, isWeekend } = formatDateOption(date);
                    const details = dayDetails[date] || { hours: '8', schedule: '7am-4:30pm', branch: '' };

                    return (
                      <div
                        key={date}
                        className={`selected-day-card ${isWeekend ? 'weekend' : ''}`}
                        onMouseDown={(e) => handleLongPressStart(date, e)}
                        onMouseUp={handleLongPressEnd}
                        onMouseMove={handleLongPressMove}
                        onMouseLeave={handleLongPressEnd}
                        onTouchStart={(e) => handleLongPressStart(date, e)}
                        onTouchMove={handleLongPressMove}
                        onTouchEnd={handleLongPressEnd}
                        onTouchCancel={handleLongPressEnd}
                      >
                        <div className="day-card-header">
                          <span className="day-name-selected">{text}</span>
                          <button
                            type="button"
                            className="btn-remove-day"
                            onClick={() => handleRemoveDay(date)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                          >
                            ✕
                          </button>
                        </div>

                        <div className="day-card-info">
                          <div className="info-row">
                            <span className="info-label">⏰ Horas:</span>
                            <span className="info-value">{details.hours}h</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">🕐 Horario:</span>
                            <span className="info-value">{details.schedule}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">🏢 Sucursal:</span>
                            <span className="info-value">{details.branch || 'Sin asignar'}</span>
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

      {/* Modal de edición */}
      {editingDay && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar día</h3>
              <button className="modal-close" onClick={closeEditModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-day-name">
                {formatDateOption(editingDay).text}
              </div>

              <div className="modal-form-group">
                <label>⏰ Horas:</label>
                <select
                  value={editFormData.hours}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, hours: e.target.value, schedule: '' }))}
                >
                  {Object.keys(scheduleOptions).map(hours => (
                    <option key={hours} value={hours}>{hours}h</option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label>🕐 Horario:</label>
                <select
                  value={editFormData.schedule}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, schedule: e.target.value }))}
                >
                  <option value="">Seleccionar...</option>
                  {scheduleOptions[editFormData.hours]?.map(schedule => (
                    <option key={schedule} value={schedule}>{schedule}</option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label>🏢 Sucursal:</label>
                <select
                  value={editFormData.branch}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, branch: e.target.value }))}
                >
                  <option value="">Seleccionar...</option>
                  {branchOptions.map(branchOpt => (
                    <option key={branchOpt} value={branchOpt}>{branchOpt}</option>
                  ))}
                </select>
              </div>

              <div className="modal-total">
                Total: ₡{(parseFloat(editFormData.hours) * getHourlyRate(editingDay)).toLocaleString('es-CR')}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={closeEditModal}>
                Cancelar
              </button>
              <button className="btn-modal-save" onClick={handleSaveEdit}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentForm;
