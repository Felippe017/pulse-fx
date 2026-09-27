import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { IndicatorDetail } from './components/IndicatorDetail';
import { Disclaimer } from './components/Disclaimer';
import './styles/index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/indicator/:id" element={<IndicatorDetail />} />
        </Routes>
        <Disclaimer />
      </div>
    </BrowserRouter>
  );
}

export default App;
