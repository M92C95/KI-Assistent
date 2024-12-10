import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function MySummaries() {
  const [summaries, setSummaries] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const temporarySummary = location.state?.temporarySummary;
    console.log('Temporary Summary:', temporarySummary);

    const fetchSummaries = async () => {
      try {
        const response = await fetch('/api/summaries', {
          headers: {
            'Cache-Control': 'no-cache', // Deaktiviert den Browser-Cache
          },
        });
        if (!response.ok) {
          throw new Error('Die Netzwerkantwort fehlerhaft');
        }
        const data = await response.json();

        // Temporäre Zusammenfassung hinzufügen, falls vorhanden
        if (temporarySummary) {
          setSummaries([temporarySummary, ...data]);
        } else {
          setSummaries(data);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Zusammenfassungen:', error);
      }
    };

    fetchSummaries();

    // Cleanup: Temporäre Zusammenfassung entfernen, wenn der Benutzer die Seite verlässt
    return () => {
      if (temporarySummary) {
        setSummaries((prev) => prev.filter((s) => s.id));
        console.log('Temporäre Zusammenfassung beim Verlassen der Seite entfernt');
      }
    };
  }, [location.state]);

  const handleDelete = async (summaryId) => {
    const confirmed = window.confirm('Möchten Sie diese Zusammenfassung wirklich löschen?');
    if (confirmed) {
      try {
        const response = await fetch(`/api/summaries/${summaryId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSummaries((prev) => prev.filter((summary) => summary.id !== summaryId));
          console.log(`Zusammenfassung mit ID ${summaryId} erfolgreich gelöscht.`);
        } else {
          console.error('Die Zusammenfassung konnte nicht gelöscht werden');
        }
      } catch (error) {
        console.error('Fehler beim Löschen der Zusammenfassung:', error);
      }
    }
  };

  const handleCreatePresentation = (summaryId, tempSummary = null) => {
    if (summaryId) {
      navigate(`/presentation-config/${summaryId}`);
    } else if (tempSummary) {
      navigate('/presentation-config', { state: { temporarySummary: tempSummary } });
    }
  };

  return (
    <div className="container mt-5" style={{ fontFamily: 'Lato, sans-serif' }}>
      <h1 className="mb-4 text-center">
        <i className="fa-solid fa-file-alt me-2"></i>
        Meine Zusammenfassungen
      </h1>

      {summaries.length > 0 && !summaries[0].id && (
        <div className="alert alert-info">
          <i className="fa-solid fa-user-secret me-2"></i>
          Sie befinden sich im <strong>Inkognito-Modus</strong>. Die erste Zusammenfassung wurde nicht gespeichert und wird nach dem Verlassen der Seite nicht mehr verfügbar sein.
        </div>
      )}

      <div className="accordion" id="accordionExample">
        {summaries.length === 0 ? (
          <p>Keine Zusammenfassungen gefunden.</p>
        ) : (
          summaries.map((summary, index) => (
            <div
              className={`accordion-item ${index === summaries.length - 1 ? 'mb-5' : ''}`}
              key={summary.id || `temporary-${index}`}
            >
              <h2 className="accordion-header" id={`heading${index}`}>
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${index}`}
                  aria-expanded="false"
                  aria-controls={`collapse${index}`}
                >
                  <i className="fa-solid fa-file-lines me-2"></i>
                  Zusammenfassung {summary.id || 'Temporär'}
                </button>
              </h2>
              <div
                id={`collapse${index}`}
                className="accordion-collapse collapse"
                aria-labelledby={`heading${index}`}
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body">
                  <h5>Zusammenfassung:</h5>
                  <p>{summary.summary || summary.gpt_response || 'Keine Zusammenfassung verfügbar.'}</p>

                  {summary.segmentation && (
                    <>
                      <h5>Erkannte Überschriften und Textsegmente:</h5>
                      <pre>{summary.segmentation}</pre>
                    </>
                  )}

                  {summary.key_points && (
                    <>
                      <h5>Schlüsselpunkte:</h5>
                      <pre>{summary.key_points}</pre>
                    </>
                  )}

                  <div className="d-flex justify-content-start mt-3">
                    {summary.id ? (
                      <>
                        <button 
                          className="btn btn-danger me-2"
                          onClick={() => handleDelete(summary.id)}
                          title="Zusammenfassung löschen"
                        >
                          <i className="fa-solid fa-trash-alt"></i> Löschen
                        </button>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => handleCreatePresentation(summary.id)}
                          title="Präsentation erstellen"
                        >
                          <i className="fa-solid fa-chalkboard-user"></i> Präsentation erstellen
                        </button>
                      </>
                    ) : (
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleCreatePresentation(null, summary)}
                        title="Präsentation erstellen"
                      >
                        <i className="fa-solid fa-chalkboard-user"></i> Präsentation erstellen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MySummaries;
