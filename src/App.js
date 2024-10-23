import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import RegisterDevice from './RegisterDevice';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route redirects to the login page */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/registerDevice" element={<RegisterDevice />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
