import { useState } from 'react';
import './QuincenaSelector.css';

function QuincenaSelector({ quincenas, activeQuincenaId, onCreateQuincena, onSelectQuincena, onDeleteQuincena, onCloseQuincena }) {
  const [showNewForm, setShowNewForm] = useState(!quincenas.length);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const activeQuincena = quincenas.find(q => q.id === activeQuincenaId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (startDate && endDate) {
      onCreateQuincena(startDate, endDate);
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
    <div className="quincena-selector">
      <div className="selector-header">
        <h2>📅 Quincenas</h2>
        {activeQuincena && (
          <button
            className="btn-new-quincena"
            onClick={() => setShowNewForm(!showNewForm)}
          >
            {showNewForm ? '❌ Cancelar' : '➕ Nueva Quincena'}
          </button>
        )}
      </div>

      {showNewForm && (
        <form onSubmit={handleSubmit} className="new-quincena-form">
          <div className="form-inline">
            <div className="form-group">
              <label htmlFor="startDate">Inicio:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">Fin:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                required
              />
            </div>

            <button type="submit" className="btn-create">
              ✓ Crear
            </button>
          </div>
        </form>
      )}

      {activeQuincena && (
        <div className="active-quincena">
          <div className="quincena-info">
            <span className="quincena-badge">Activa</span>
            <span className="quincena-dates">{formatDateRange(activeQuincena.startDate, activeQuincena.endDate)}</span>
            <span className="quincena-stats">{activeQuincena.payments.length} registros</span>
          </div>
          {activeQuincena.payments.length > 0 && (
            <button className="btn-close-quincena" onClick={onCloseQuincena}>
              ✓ Cerrar Quincena
            </button>
          )}
        </div>
      )}

      {sortedQuincenas.length > 1 && (
        <div className="quincenas-history">
          <h3>📚 Historial</h3>
          <div className="quincenas-list">
            {sortedQuincenas
              .filter(q => q.id !== activeQuincenaId)
              .map(quincena => (
                <div key={quincena.id} className="quincena-item">
                  <div
                    className="quincena-item-content"
                    onClick={() => onSelectQuincena(quincena.id)}
                  >
                    <span className="quincena-dates">{formatDateRange(quincena.startDate, quincena.endDate)}</span>
                    <span className="quincena-stats">{quincena.payments.length} registros</span>
                  </div>
                  <button
                    className="btn-delete-mini"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteQuincena(quincena.id);
                    }}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuincenaSelector;
