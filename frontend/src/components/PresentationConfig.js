import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

function PresentationConfig() {
  const [summaries, setSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [selectedSummaryId, setSelectedSummaryId] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [selectedColorTheme, setSelectedColorTheme] = useState('default');
  const [selectedTemplate, setSelectedTemplate] = useState('none');
  const [customTemplateFile, setCustomTemplateFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { summaryId } = useParams();
  const location = useLocation();

  useEffect(() => {
    fetch('/api/summaries')
      .then((response) => response.json())
      .then((data) => {
        setSummaries(data);

        if (summaryId) {
          const selected = data.find(summary => summary.id.toString() === summaryId);
          if (selected) {
            setSelectedSummary(selected);
            setSelectedSummaryId(selected.id.toString());
          }
        } else if (location.state?.temporarySummary) {
          const tempSummary = location.state.temporarySummary;
          tempSummary.id = 'temporary';
          setSummaries([tempSummary, ...data]);
          setSelectedSummary(tempSummary);
          setSelectedSummaryId('temporary');
        }
      })
      .catch((error) => console.error('Fehler beim Laden der Zusammenfassungen:', error));
  }, [summaryId, location.state]);

  const handleSelectSummary = (event) => {
    const summaryId = event.target.value;
    if (summaryId) {
      setSelectedSummaryId(summaryId);
      if (summaryId === 'temporary') {
        const tempSummary = summaries.find(summary => summary.id === 'temporary');
        setSelectedSummary(tempSummary);
      } else {
        const selected = summaries.find(summary => summary.id.toString() === summaryId);
        if (selected) {
          setSelectedSummary(selected);
        }
      }
    }
  };

  const handleFormatChange = (event) => {
    const format = event.target.value;
    setSelectedFormat(format);

    if (format !== 'beamer') {
      setSelectedTheme('default');
      setSelectedColorTheme('default');
    }
    if (format !== 'pptx') {
      setSelectedTemplate('none');
    }
  };

  const handleThemeChange = (event) => {
    setSelectedTheme(event.target.value);
  };

  const handleColorThemeChange = (event) => {
    setSelectedColorTheme(event.target.value);
  };

  const handleTemplateChange = (event) => {
    setSelectedTemplate(event.target.value);
  };

  const handleCreatePresentation = async () => {
    if (!selectedSummary) {
      alert('Bitte wählen Sie eine Zusammenfassung aus.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('format', selectedFormat);
      formData.append('title', selectedSummary.title || 'Meine Präsentation');
      formData.append('is_temporary', selectedSummary.id === 'temporary' ? 'true' : 'false');
      if (selectedSummary.id !== 'temporary') {
        formData.append('summary_id', selectedSummary.id);
      } else {
        formData.append('summary_text', selectedSummary.gpt_response || selectedSummary.summary);
      }

      if (selectedFormat === 'beamer') {
        formData.append('theme', selectedTheme);
        formData.append('colortheme', selectedColorTheme);
      }

      if (selectedFormat === 'pptx') {
        formData.append('template', selectedTemplate);
        if (selectedTemplate === 'custom' && customTemplateFile) {
          formData.append('custom_template', customTemplateFile);
        }
      }

      const response = await fetch('/api/create-presentation', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const presentationData = await response.json(); // Präsentationsdaten abrufen

        // Speichern der temporären Präsentation im localStorage
        if (presentationData.is_temporary) {
          let tempPresentations = JSON.parse(localStorage.getItem('tempPresentations')) || [];
          tempPresentations.push(presentationData);
          localStorage.setItem('tempPresentations', JSON.stringify(tempPresentations));
        }

        setLoading(false);
        navigate('/presentations');
      } else {
        console.error('Fehler beim Erstellen der Präsentation');
        setLoading(false);
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Präsentation:', error);
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ fontFamily: 'Lato, sans-serif' }}>
      <h1 className="mb-4 text-center">
        <i className="fa-solid fa-chalkboard me-2"></i>
        Präsentationskonfiguration
      </h1>

      {/* Dropdown-Menü für die Auswahl der Zusammenfassungen */}
      <div className="mb-3">
        <label htmlFor="summarySelect" className="form-label">Wählen Sie eine Zusammenfassung:</label>
        <select
          className="form-select"
          id="summarySelect"
          onChange={handleSelectSummary}
          value={selectedSummaryId}
        >
          <option value="" disabled>Bitte wählen...</option>
          {summaries.map(summary => (
            <option key={summary.id} value={summary.id.toString()}>
              {summary.id === 'temporary' ? 'Temporäre Zusammenfassung' : `Zusammenfassung ${summary.id}`}
            </option>
          ))}
        </select>
      </div>

      {/* Anzeige der ausgewählten Zusammenfassung */}
      {selectedSummary && (
        <div className="mt-3">
          <h5>Gewählte Zusammenfassung:</h5>
          <p>{selectedSummary.gpt_response || selectedSummary.summary}</p>
        </div>
      )}

      {/* Dropdown-Menü für die Format-Auswahl */}
      <div className="mb-3">
        <label htmlFor="formatSelect" className="form-label">Wählen Sie ein Präsentationsformat:</label>
        <select
          className="form-select"
          id="formatSelect"
          value={selectedFormat}
          onChange={handleFormatChange}
        >
          <option value="pdf">PDF</option>
          <option value="pptx">PowerPoint</option>
          <option value="latex">LaTeX</option>
          <option value="beamer">Beamer</option>
        </select>
      </div>

      {/* Template-Auswahl nur anzeigen, wenn 'pptx' ausgewählt ist */}
      {selectedFormat === 'pptx' && (
        <div className="mb-3">
          <label className="form-label">Vorlage für PowerPoint:</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="template"
              value="none"
              checked={selectedTemplate === 'none'}
              onChange={handleTemplateChange}
            />
            <label className="form-check-label">
              <i className="fa-solid fa-file me-2"></i>
              Kein Template
            </label>
          </div>
          <div className="form-check mt-2">
            <input
              className="form-check-input"
              type="radio"
              name="template"
              value="medieninformatik"
              checked={selectedTemplate === 'medieninformatik'}
              onChange={handleTemplateChange}
            />
            <label className="form-check-label">
              <i className="fa-solid fa-file-powerpoint me-2"></i>
              Medieninformatik
            </label>
          </div>
          <div className="form-check mt-2">
            <input
              className="form-check-input"
              type="radio"
              name="template"
              value="custom"
              checked={selectedTemplate === 'custom'}
              onChange={handleTemplateChange}
            />
            <label className="form-check-label">
              <i className="fa-solid fa-upload me-2"></i>
              Eigenes Template hochladen
            </label>
          </div>

          {/* Dateiupload-Feld, nur sichtbar, wenn 'custom' ausgewählt ist */}
          {selectedTemplate === 'custom' && (
            <div className="mt-2">
              <input
                type="file"
                accept=".pptx"
                onChange={(e) => setCustomTemplateFile(e.target.files[0])}
                className="form-control"
              />
            </div>
          )}
        </div>
      )}

      {/* Auswahl des Themes und Colorthemes, wenn Beamer ausgewählt ist */}
      {selectedFormat === 'beamer' && (
        <div className="row">
          <div className="col-md-6">
            <label className="form-label">Wählen Sie ein Theme für Beamer:</label>
            {['default', 'Hildesheim', 'AnnArbor', 'Darmstadt', 'Copenhagen', 'Hannover', 'Malmoe'].map(theme => (
              <div className="form-check mt-2" key={theme}>
                <input
                  className="form-check-input"
                  type="radio"
                  name="theme"
                  value={theme}
                  checked={selectedTheme === theme}
                  onChange={handleThemeChange}
                />
                <label className="form-check-label">{theme}</label>
              </div>
            ))}
          </div>

          <div className="col-md-6">
            <label className="form-label">Wählen Sie ein Colortheme für Beamer:</label>
            {['default', 'albatross', 'beaver', 'beetle', 'crane', 'seahorse'].map(colorTheme => (
              <div className="form-check mt-2" key={colorTheme}>
                <input
                  className="form-check-input"
                  type="radio"
                  name="colortheme"
                  value={colorTheme}
                  checked={selectedColorTheme === colorTheme}
                  onChange={handleColorThemeChange}
                />
                <label className="form-check-label">{colorTheme}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Button zum Erstellen der Präsentation */}
      <div className="mt-4 mb-5 text-center">
        <button
          className="btn btn-primary btn-lg"
          onClick={handleCreatePresentation}
          disabled={loading || !selectedSummary}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              &nbsp;Erstellen...
            </>
          ) : (
            <>
              <i className="fa-solid fa-play me-2"></i>
              Präsentation erstellen
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default PresentationConfig;
