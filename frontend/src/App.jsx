import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MarketplacePage from './pages/MarketplacePage';
import LotDetailPage from './pages/LotDetailPage';
import FarmerDashboardPage from './pages/FarmerDashboardPage';
import CreateLotPage from './pages/CreateLotPage';
import FarmerLotDetailPage from './pages/FarmerLotDetailPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<Layout />}>
            <Route path="/" element={<MarketplacePage />} />
            <Route path="/lots/:id" element={<LotDetailPage />} />

            <Route element={<ProtectedRoute role="FARMER" />}>
              <Route path="/farmer" element={<FarmerDashboardPage />} />
              <Route path="/farmer/create-lot" element={<CreateLotPage />} />
              <Route path="/farmer/lots/:id" element={<FarmerLotDetailPage />} />
            </Route>

            <Route element={<ProtectedRoute role="BUYER" />}>
              <Route path="/my-orders" element={<MyOrdersPage />} />
            </Route>

            <Route element={<ProtectedRoute role="ADMIN" />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;