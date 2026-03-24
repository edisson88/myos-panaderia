import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import DashboardPage from '../pages/DashboardPage';
import OrdersPage from '../pages/OrdersPage';
import CustomerPage from '../pages/CustomerPage';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';


export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    element={(
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    )}
                >
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/pedidos" element={<OrdersPage />} />
                    <Route path="/clientes" element={<CustomerPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}