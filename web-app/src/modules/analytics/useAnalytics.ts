import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchOverview,
  fetchSalesTimeseries,
  fetchWeekdaySeasonality,
  fetchProductRanking,
  fetchCustomerRanking,
  fetchDemandForecast,
  type Granularity,
  type SalesOverview,
  type SalesTimeseries,
  type WeekdaySeasonality,
  type ProductRanking,
  type CustomerRanking,
  type DemandForecast,
} from './analytics.service';

export interface AnalyticsRange {
  from: string;
  to: string;
  granularity: Granularity;
}

interface AnalyticsState {
  overview: SalesOverview | null;
  timeseries: SalesTimeseries | null;
  weekday: WeekdaySeasonality | null;
  products: ProductRanking | null;
  customers: CustomerRanking | null;
  forecast: DemandForecast | null;
  isLoading: boolean;
  error: string | null;
}

const EMPTY: AnalyticsState = {
  overview: null,
  timeseries: null,
  weekday: null,
  products: null,
  customers: null,
  forecast: null,
  isLoading: true,
  error: null,
};

/**
 * Devuelve el rango por defecto: los últimos `days` días incluyendo hoy.
 *
 * Se trabaja con la fecha en UTC a propósito: `delivery_date` se persiste a
 * medianoche UTC y el backend agrupa en UTC, así que el frontend debe pedir el
 * rango en la misma referencia para que los bordes coincidan.
 */
export function defaultRange(days = 30): { from: string; to: string } {
  const today = new Date();
  const to = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1),
  );
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - days);

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function useAnalytics(range: AnalyticsRange) {
  const { token } = useAuth();
  const [state, setState] = useState<AnalyticsState>(EMPTY);
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  const { from, to, granularity } = range;

  useEffect(() => {
    if (!token) return;

    let active = true;

    const load = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // El backend comparte y cachea el dataset del período, así que lanzar
        // las seis peticiones en paralelo golpea Hasura una sola vez.
        const [overview, timeseries, weekday, products, customers, forecast] =
          await Promise.all([
            fetchOverview(token, from, to),
            fetchSalesTimeseries(token, from, to, granularity),
            fetchWeekdaySeasonality(token, from, to),
            fetchProductRanking(token, from, to),
            fetchCustomerRanking(token, from, to),
            fetchDemandForecast(token),
          ]);

        if (!active) return;

        setState({
          overview,
          timeseries,
          weekday,
          products,
          customers,
          forecast,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        if (!active) return;

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Error desconocido',
        }));
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [token, from, to, granularity, reloadKey]);

  return { ...state, refresh };
}
