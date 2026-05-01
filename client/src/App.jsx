import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/AdminDashboard';
import AdminProductAdd from './pages/AdminProductAdd';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminSettings from './pages/AdminSettings';
import AdminInventory from './pages/AdminInventory';
import CustomerShop from './pages/CustomerShop';
import CustomerOrders from './pages/CustomerOrders';
import CustomerProfile from './pages/CustomerProfile';
import CustomerFavourites from './pages/CustomerFavourites';
import CustomerSubscriptions from './pages/CustomerSubscriptions';
import CustomerReviews from './pages/CustomerReviews';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/shop'} />;
  return children;
};

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/shop'} />;
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-dummy-google-client-id.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Login />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<PrivateRoute role="admin"><Dashboard /></PrivateRoute>} />
              <Route path="/admin/orders" element={<PrivateRoute role="admin"><AdminOrders /></PrivateRoute>} />
              <Route path="/admin/products" element={<PrivateRoute role="admin"><AdminProducts /></PrivateRoute>} />
              <Route path="/admin/products/add" element={<PrivateRoute role="admin"><AdminProductAdd /></PrivateRoute>} />
              <Route path="/admin/inventory" element={<PrivateRoute role="admin"><AdminInventory /></PrivateRoute>} />
              <Route path="/admin/users" element={<PrivateRoute role="admin"><AdminUsers /></PrivateRoute>} />
              <Route path="/admin/subscriptions" element={<PrivateRoute role="admin"><AdminSubscriptions /></PrivateRoute>} />
              <Route path="/admin/settings" element={<PrivateRoute role="admin"><AdminSettings /></PrivateRoute>} />

              {/* Customer Routes */}
              <Route path="/shop" element={<PrivateRoute role="customer"><CustomerShop /></PrivateRoute>} />
              <Route path="/subscriptions" element={<PrivateRoute role="customer"><CustomerSubscriptions /></PrivateRoute>} />
              <Route path="/orders" element={<PrivateRoute role="customer"><CustomerOrders /></PrivateRoute>} />
              <Route path="/favourites" element={<PrivateRoute role="customer"><CustomerFavourites /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute role="customer"><CustomerProfile /></PrivateRoute>} />
              <Route path="/reviews" element={<PrivateRoute role="customer"><CustomerReviews /></PrivateRoute>} />
              <Route path="/cart" element={<PrivateRoute role="customer"><Cart /></PrivateRoute>} />
              <Route path="/checkout" element={<PrivateRoute role="customer"><Checkout /></PrivateRoute>} />

              {/* Home redirect */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="*" element={<HomeRedirect />} />
            </Routes>
          </div>
          <Toaster />
        </Router>
      </CartProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
