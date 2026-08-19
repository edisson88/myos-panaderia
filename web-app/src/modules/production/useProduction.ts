// web-app/src/modules/production/useProduction.ts

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchProductionConfig,
  type ProductionConfigItem,
} from './production.service';

interface ProductionState {
  items: ProductionConfigItem[];
  isLoading: boolean;
  error: string | null;
}

export function useProduction() {
  const { token } = useAuth();
  const [state, setState] = useState<ProductionState>({
    items: [],
    isLoading: true,
    error: null,
  });

  const loadConfig = useCallback(async () => {
    if (!token) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const items = await fetchProductionConfig(token);
      setState({ items, isLoading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error cargando configuración',
      }));
    }
  }, [token]);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  return { ...state, refresh: loadConfig };
}