import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage.jsx';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/send" element={<HomePage defaultMode="send" />} />
        <Route path="/receive" element={<HomePage defaultMode="receive" />} />
        <Route path="/activity" element={<HomePage defaultMode="activity" />} />
      </Routes>
    </BrowserRouter>
  );
}
