import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layout/AppLayout';
import DashboardPage from '../pages/DashboardPage';
import OrdersPage from '../pages/OrdersPage';
//import CustomerPage from '../pages/CustomerPage';


export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    {/* <Route path="customers" element={<CustomerPage />} /> */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}