import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function MyPresentations() {
  const location = useLocation();
  const [presentations, setPresentations] = useState([]);
  const [selectedPresentation, setSelectedPresentation] = useState(null);

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        const response = await fetch('/api/presentations');
        if (!response.ok) {
          throw new Error('Netzwerkantwort war nicht ok');
        }
        const data = await response.json();

        // Temporäre Präsentationen aus localStorage laden
        const tempPresentations = JSON.parse(localStorage.getItem('tempPresentations')) || [];

        // Zusammenführen von temporären und permanenten Präsentationen
        const allPresentations = [...tempPresentations, ...data];

        setPresentations(allPresentations);
      } catch (error) {
        console.error('Fehler beim Laden der Präsentationen:', error);
      }
    };

    fetchPresentations();
  }, []);

  const handleDownload = (presentation) => {
    if (presentation.is_temporary) {
      // Setze die temporäre Präsentation als ausgewählte Präsentation, um das Modal zu öffnen
      setSelectedPresentation(presentation);
    } else {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

      // Download-Link erstellen und direkt herunterladen
      const downloadUrl = `${backendUrl}/presentations/${presentation.id}/download`;
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = presentation.title || `presentation_${presentation.id}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  };

  const handleConfirmDownload = () => {
    if (selectedPresentation) {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const downloadUrl = `${backendUrl}/presentations/${selectedPresentation.id}/download`;

      // Trigger den Download
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = selectedPresentation.title || `presentation_${selectedPresentation.id}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      // Entferne die temporäre Präsentation aus dem Zustand und localStorage
      setPresentations((prev) =>
        prev.filter((p) => p.id !== selectedPresentation.id)
      );

      const tempPresentations = JSON.parse(localStorage.getItem('tempPresentations')) || [];
      const updatedTempPresentations = tempPresentations.filter((p) => p.id !== selectedPresentation.id);
      localStorage.setItem('tempPresentations', JSON.stringify(updatedTempPresentations));

      // Schließe das Modal
      setSelectedPresentation(null);
    }
  };

  const handleDelete = async (presentationId) => {
    const confirmed = window.confirm('Möchten Sie diese Präsentation wirklich löschen?');
    if (confirmed) {
      const isTemporary = presentations.find((p) => p.id === presentationId)?.is_temporary;

      if (isTemporary) {
        // Lösche die temporäre Präsentation aus localStorage
        const tempPresentations = JSON.parse(localStorage.getItem('tempPresentations')) || [];
        const updatedTempPresentations = tempPresentations.filter((p) => p.id !== presentationId);
        localStorage.setItem('tempPresentations', JSON.stringify(updatedTempPresentations));

        // Präsentation aus dem Zustand entfernen
        setPresentations((prev) => prev.filter((p) => p.id !== presentationId));
      } else {
        // Permanente Präsentationen über API löschen
        try {
          const response = await fetch(`/api/presentations/${presentationId}/delete`, {
            method: 'DELETE',
          });

          if (response.ok) {
            setPresentations((prev) => prev.filter((p) => p.id !== presentationId));
          } else {
            console.error('Fehler beim Löschen der Präsentation');
          }
        } catch (error) {
          console.error('Fehler beim Löschen der Präsentation:', error);
        }
      }
    }
  };

  // Funktion zum Prüfen, ob eine temporäre Präsentation in der Liste ist
  const hasTemporaryPresentation = presentations.some((p) => p.is_temporary);

  return (
    <div className="container mt-5" style={{ fontFamily: 'Lato, sans-serif' }}>
      <h1 className="mb-4 text-center">
        <i className="fa-solid fa-chalkboard-user me-2"></i>
        Meine Präsentationen
      </h1>

      {/* Banner für temporäre Präsentationen */}
      {hasTemporaryPresentation && (
        <div className="alert alert-info">
          <i className="fa-solid fa-user-secret me-2"></i>
          Eine oder mehrere Präsentationen wurden im <strong>Inkognito-Modus</strong> erstellt. 
          Sie werden nach dem Herunterladen oder beim Schließen der Anwendung gelöscht.
        </div>
      )}

      {presentations.length === 0 ? (
        <p>Keine Präsentationen verfügbar.</p>
      ) : (
        <div className="list-group">
          {presentations.map((presentation) => (
            <div
              key={presentation.id}
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            >
              <div>
                <h2 className="mb-1" style={{ fontSize: '1.25rem' }}>
                  <i className="fa-solid fa-file-powerpoint me-2"></i>
                  {presentation.title || `Präsentation ${presentation.id}`}
                </h2>
                <small className="text-muted">Format: {presentation.format.toUpperCase()}</small>
              </div>
              <div>
                <button
                  className="btn btn-primary btn-sm me-2"
                  onClick={() => handleDownload(presentation)}
                  title="Herunterladen"
                >
                  <i className="fa-solid fa-download"></i>
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(presentation.id)}
                  title="Löschen"
                >
                  <i className="fa-solid fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal für temporäre Präsentationen */}
      {selectedPresentation && selectedPresentation.is_temporary && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Präsentation herunterladen</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedPresentation(null)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Nach dem Download werden diese Präsentation und die zugehörige Zusammenfassung gelöscht.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedPresentation(null)}
                  >
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleConfirmDownload}
                  >
                    <i className="fa-solid fa-download me-2"></i>
                    Herunterladen und löschen
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}

export default MyPresentations;
