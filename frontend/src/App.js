import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ChatForm from './components/ChatForm';
import MySummaries from './components/MySummaries';
import MyPresentations from './components/MyPresentations';
import PresentationConfig from './components/PresentationConfig'; // Import der neuen Seite

function App() {
  return (
    <Router>
      <div>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <Link className="navbar-brand" to="/">KI Assistent</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Chat</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/summaries">Meine Zusammenfassungen</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/presentation-config">Konfiguration</Link> {/* Neuer Tab für Konfiguration */}
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/presentations">Meine Präsentationen</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<ChatForm />} />
            <Route path="/summaries" element={<MySummaries />} />
            {/* Route mit Parameter :summaryId */}
            <Route path="/presentation-config/:summaryId" element={<PresentationConfig />} />
            {/* Zusätzliche Route ohne Parameter, falls benötigt */}
            <Route path="/presentation-config" element={<PresentationConfig />} />
            <Route path="/presentations" element={<MyPresentations />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
