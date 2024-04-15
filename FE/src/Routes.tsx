import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard/dashboard';
import Datasensors from './components/Datasensors/datasensors';
import Actionhistory from './components/Actionhistory/actionhistory';
import Profile from './components/Profile/profile';

const AppRoutes: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/datasensors" element={<Datasensors />} />
      <Route path="/actionhistory" element={<Actionhistory />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  </Router>
);

export default AppRoutes;