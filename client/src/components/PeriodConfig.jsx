import { useState, useEffect } from 'react';
import './PeriodConfig.css';

function PeriodConfig({ period, onChange, workDays }) {
  const [startDate, setStartDate] = useState(period.startDate || '');
  const [endDate, setEndDate] = useState(period.endDate || '');

  useEffect(() => {
    setStartDate(period.startDate || '');
    setEndDate(period.endDate || '');
  }, [period]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      onChange({ startDate, endDate });
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="period-config">
      <h2>📅 Configuración del Período</h2>
      <form onSubmit={handleSubmit} className="period-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Fecha Inicio:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">Fecha Fin:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Guardar Período
          </button>
        </div>
      </form>

      {period.startDate && period.endDate && (
        <div className="period-info">
          <div className="info-card">
            <span className="info-label">Período:</span>
            <span className="info-value">
              {new Date(period.startDate).toLocaleDateString('es-ES')} - {new Date(period.endDate).toLocaleDateString('es-ES')}
            </span>
          </div>
          <div className="info-card">
            <span className="info-label">Días del período:</span>
            <span className="info-value">{calculateDays()} días</span>
          </div>
          <div className="info-card">
            <span className="info-label">Días laborados:</span>
            <span className="info-value">{workDays} días</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PeriodConfig;
