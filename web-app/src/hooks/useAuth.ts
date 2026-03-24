// src/hooks/useAuth.ts
// Thin wrapper; la logica de autenticacion vive en AuthContext.

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.tsx';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};