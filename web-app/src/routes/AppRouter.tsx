import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import DashboardPage from '../pages/DashboardPage';
import OrdersPage from '../pages/OrdersPage';
import ClientsPage from '../pages/ClientsPage';
import ProductsPage from '../pages/ProductsPage';
import LoginPage from '../pages/LoginPage';


export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<AppLayout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/clientes" element={<ClientsPage />} />
                    <Route path="/productos" element={<ProductsPage />} />
                    {/* <Route path="customers" element={<CustomerPage />} /> */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}