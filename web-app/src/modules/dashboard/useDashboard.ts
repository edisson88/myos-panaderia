import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
    fetchDashboardSummary,
    fetchRecentOrders,
    type DashboardSummary,
    type DashboardOrder,
    type DashboardFilters,
} from './dashboard.service';


interface DashboardState {
    summary: DashboardSummary | null;
    orders: DashboardOrder[];
    isLoading: boolean;
    error: string | null;
}

export function useDashboard(filters: DashboardFilters) {
    const { token } = useAuth();
    const [state, setState] = useState<DashboardState>({
        summary: null,
        orders: [],
        isLoading: true,
        error: null,
    });

    const { dateFrom, dateTo } = filters;

    const loadDashboard = useCallback(async () => {
        if (!token) return;

        let active = true;
        setState((prev) => ({...prev, isLoading: true, error: null}));
        try {
                const [summary, orders] = await Promise.all([
                    fetchDashboardSummary(token, dateFrom, dateTo),
                    fetchRecentOrders(token, dateFrom, dateTo),
                ]);


            if (!active) return;

            setState({
                summary,
                orders,
                isLoading: false,
                error: null,
            });
        }   catch (err) {
            if (!active) return;

            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: err instanceof Error ? err.message : 'Error desconocido',
            }));
        }

    return () => {active = false;};
    }, [token, dateFrom, dateTo]) ;

    useEffect(() => {
    void loadDashboard();
    }, [loadDashboard]);

    return {...state, refresh: loadDashboard};
}
