import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Public Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CalculatorPage from './pages/public/CalculatorPage';

// Protected Routes
import PrivateRoute from './components/routing/PrivateRoute';

// Client Pages
import ClientDashboard from './pages/client/DashboardPage';
import ClientOrders from './pages/client/OrdersPage';
import ClientOrderDetails from './pages/client/OrderDetailsPage';

// Booster Pages
import BoosterDashboard from './pages/booster/DashboardPage';
import BoosterAvailableOrders from './pages/booster/AvailableOrdersPage';
import BoosterActiveOrders from './pages/booster/ActiveOrdersPage';
import BoosterUpdateProgress from './pages/booster/UpdateOrderProgressPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              
              {/* Client Routes */}
              <Route 
                path="/client/dashboard" 
                element={<PrivateRoute element={<ClientDashboard />} allowedRoles={['client']} />} 
              />
              <Route 
                path="/client/orders" 
                element={<PrivateRoute element={<ClientOrders />} allowedRoles={['client']} />} 
              />
              <Route 
                path="/client/orders/:id" 
                element={<PrivateRoute element={<ClientOrderDetails />} allowedRoles={['client']} />} 
              />
              
              {/* Booster Routes */}
              <Route 
                path="/booster/dashboard" 
                element={<PrivateRoute element={<BoosterDashboard />} allowedRoles={['booster']} />} 
              />
              <Route 
                path="/booster/available-orders" 
                element={<PrivateRoute element={<BoosterAvailableOrders />} allowedRoles={['booster']} />} 
              />
              <Route 
                path="/booster/orders" 
                element={<PrivateRoute element={<BoosterActiveOrders />} allowedRoles={['booster']} />} 
              />
              <Route 
                path="/booster/orders/:id/update" 
                element={<PrivateRoute element={<BoosterUpdateProgress />} allowedRoles={['booster']} />} 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;