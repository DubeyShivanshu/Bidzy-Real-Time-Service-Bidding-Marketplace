/**
 * app/routes/PublicRoutes.jsx — Public Route Definitions
 *
 * Routes (accessible without authentication):
 *  /              → Landing.jsx
 *  /login         → Login.jsx (customer + provider selector)
 *  /register      → Register.jsx (customer + provider selector)
 *  /admin/login   → AdminLogin page (separate)
 *  *              → NotFound.jsx
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from '../../pages/public/Landing.jsx';
import Login from '../../pages/public/Login.jsx';
import Register from '../../pages/public/Register.jsx';
import NotFound from '../../pages/public/NotFound.jsx';

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default PublicRoutes;

