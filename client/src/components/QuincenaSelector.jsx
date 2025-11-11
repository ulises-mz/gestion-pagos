import { useState } from 'react';
import './QuincenaSelector.css';

function QuincenaSelector({ quincenas, onStartNewQuincena, onOpenQuincena, onDeleteQuincena, onDownloadQuincena, viewMode }) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      onStartNewQuincena(startDate, endDate);
      setStartDate('');
      setEndDate('');
      setShowNewForm(false);
    }
  };

  const formatDateRange = (start, end) => {
    const startFormatted = new Date(start).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    const endFormatted = new Date(end).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${startFormatted} - ${endFormatted}`;
  };

  // Ordenar quincenas por fecha de creación (más reciente primero)
  const sortedQuincenas = [...quincenas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="quincena-selector-history">
      <div className="history-header">
        <h2>📚 Historial de Quincenas</h2>
        <button
          className="btn-new-quincena-large"
          onClick={() => setShowNewForm(!showNewForm)}
        >
          {showNewForm ? '❌ Cancelar' : '➕ Nueva Quincena'}
        </button>
      </div>

      {showNewForm && (
        <div className="new-quincena-modal">
          <form onSubmit={handleSubmit} className="new-quincena-form-modal">
            <h3>Crear Nueva Quincena</h3>

            <div className="form-group">
              <label htmlFor="startDate">Fecha de inicio:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">Fecha de fin:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                required
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel-modal" onClick={() => setShowNewForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-create-modal">
                ✓ Crear Quincena
              </button>
            </div>
          </form>
        </div>
      )}

      {sortedQuincenas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No hay quincenas registradas</h3>
          <p>Crea una nueva quincena para empezar a registrar tus pagos</p>
        </div>
      ) : (
        <div className="quincenas-grid">
          {sortedQuincenas.map(quincena => (
            <div key={quincena.id} className="quincena-card">
              <div
                className="quincena-card-content"
                onClick={() => onOpenQuincena(quincena.id)}
              >
                <div className="quincena-card-header">
                  <span className="quincena-period">{formatDateRange(quincena.startDate, quincena.endDate)}</span>
                </div>
                <div className="quincena-card-stats">
                  <div className="stat-item">
                    <span className="stat-label">Días:</span>
                    <span className="stat-value">{quincena.payments.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total:</span>
                    <span className="stat-value">
                      ₡{quincena.payments.reduce((sum, p) => sum + p.total, 0).toLocaleString('es-CR')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="quincena-card-actions">
                {quincena.payments.length > 0 && (
                  <button
                    className="btn-download-card"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownloadQuincena(quincena.id);
                    }}
                    title="Descargar CSV"
                  >
                    📥 Descargar
                  </button>
                )}
                <button
                  className="btn-delete-card"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteQuincena(quincena.id);
                  }}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuincenaSelector;
