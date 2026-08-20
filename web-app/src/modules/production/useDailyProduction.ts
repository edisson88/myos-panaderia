// web-app/src/modules/production/useDailyProduction.ts

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchDailyProduction,
  type DailyProductionItem,
} from './production.service';

interface DailyProductionState {
  items: DailyProductionItem[];
  isLoading: boolean;
  error: string | null;
}

export function useDailyProduction() {
  const { token } = useAuth();
  const [state, setState] = useState<DailyProductionState>({
    items: [],
    isLoading: true,
    error: null,
  });

  const loadDaily = useCallback(async () => {
    if (!token) return;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const items = await fetchDailyProduction(token);
      setState({ items, isLoading: false, error: null });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error cargando producción diaria',
      }));
    }
  }, [token]);

  useEffect(() => {
    void loadDaily();
  }, [loadDaily]);

  return { ...state, refresh: loadDaily };
}
