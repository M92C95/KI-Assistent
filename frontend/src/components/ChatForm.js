import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ChatForm() {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [runSegmentation, setRunSegmentation] = useState(false);
  const [runSummary, setRunSummary] = useState(false);
  const [runKeyPoints, setRunKeyPoints] = useState(false);
  const [summaryLength, setSummaryLength] = useState('250');
  const [isLoading, setIsLoading] = useState(false);
  const [inkognitoMode, setInkognitoMode] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFiles([...e.target.files]); // Speichere alle hochgeladenen Dateien
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    if (files.length > 0) {
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file); // Dateien mit eindeutigen Schlüsseln anhängen
      });
    } else {
      formData.append('text', text);
    }

    formData.append('run_segmentation', runSegmentation ? 'on' : '');
    formData.append('run_summary', runSummary ? 'on' : '');
    formData.append('run_key_points', runKeyPoints ? 'on' : '');
    formData.append('summary_length', summaryLength);
    formData.append('is_temporary', inkognitoMode ? 'true' : 'false');

    try {
      const response = await fetch('/api/process-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Fehler bei der Verarbeitung des Textes');
      }

      const data = await response.json();

      // Ergebnisse weiterleiten
      if (inkognitoMode && data) {
        navigate('/summaries', { state: { temporarySummaries: data } });
      } else if (data.length > 0) {
        navigate('/summaries', { state: { latestSummaries: data } });
      }

    } catch (error) {
      console.error('Fehler:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ fontFamily: 'Lato, sans-serif' }}>
      <h1 className="mb-4 text-center">KI-Assistent für wissenschaftliche Literatur</h1>
      <form onSubmit={handleSubmit}>
        <div className="row mb-4">
          <div className="col-md-6">
            <label htmlFor="text" className="form-label">Text eingeben:</label>
            <textarea
              className="form-control"
              id="text"
              name="text"
              rows="5"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={files.length > 0} // Deaktiviere Textfeld, wenn Dateien hochgeladen sind
              placeholder="Geben Sie Ihren Text hier ein..."
            ></textarea>
          </div>
          <div className="col-md-6">
            <label htmlFor="file" className="form-label">Dateien hochladen:</label>
            <input
              type="file"
              className="form-control"
              id="file"
              name="files"
              accept=".txt, .pdf, .docx"
              multiple // Mehrere Dateien zulassen
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <i className="fa-solid fa-cogs me-2"></i>
            Verarbeitungseinstellungen
          </div>
          <div className="card-body">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="run_segmentation"
                checked={runSegmentation}
                onChange={(e) => setRunSegmentation(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="run_segmentation">
                Erkennung von Überschriften und Textsegmenten
              </label>
            </div>
            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="run_summary"
                checked={runSummary}
                onChange={(e) => setRunSummary(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="run_summary">
                Zusammenfassung
              </label>
            </div>
            <div className="form-check mt-2 mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="run_key_points"
                checked={runKeyPoints}
                onChange={(e) => setRunKeyPoints(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="run_key_points">
                Schlüsselpunkt-Extraktion
              </label>
            </div>
            <label htmlFor="summary_length" className="form-label">Zusammenfassungslänge:</label>
            <select
              className="form-select"
              id="summary_length"
              name="summary_length"
              value={summaryLength}
              onChange={(e) => setSummaryLength(e.target.value)}
            >
              <option value="150">Kurz (150 Wörter)</option>
              <option value="250">Standard (250 Wörter)</option>
              <option value="500">Erweitert (500 Wörter)</option>
            </select>
          </div>
        </div>

        <div className="form-check mb-4">
          <input
            className="form-check-input"
            type="checkbox"
            id="is_temporary"
            checked={inkognitoMode}
            onChange={(e) => setInkognitoMode(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="is_temporary">
            Inkognito-Modus
          </label>
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                &nbsp;Verarbeiten...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane me-2"></i>
                Verarbeiten
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatForm;
