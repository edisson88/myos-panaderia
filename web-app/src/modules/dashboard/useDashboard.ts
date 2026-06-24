import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
    fetchDashboardSummary,
    fetchRecentOrders,
    fetchInventory,
    type DashboardSummary,
    type DashboardOrder,
    type DashboardInventoryItem,
} from './dashboard.service';


interface DashboardState {
    summary: DashboardSummary | null;
    orders: DashboardOrder[];
    inventory: DashboardInventoryItem[];
    isLoading: boolean;
    error: string | null;
}

export function useDashboard() {
    const { token } = useAuth();
    const [state, setState] = useState<DashboardState>({
        summary: null,
        orders: [],
        inventory: [],
        isLoading: true,
        error: null,
    });

    const loadDashboard = useCallback(async () => {
        if (!token) return;

        let active = true;
        setState((prev) => ({...prev, isLoading: true, error: null}));
        try {
                const [summary, orders, inventory] = await Promise.all([
                    fetchDashboardSummary(token),
                    fetchRecentOrders(token),
                    fetchInventory(token),
                ]);
            

            if (!active) return;

            setState({
                summary,
                orders,
                inventory,
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
    }, [token]) ;

    useEffect(() => {
    void loadDashboard();
    }, [loadDashboard]);

    return {...state, refresh: loadDashboard};
}