import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthProvider from './components/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import CategoriasPage from './pages/CategoriasPage';
import MarcasPage from './pages/MarcasPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categorias"
            element={
              <ProtectedRoute>
                <CategoriasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marcas"
            element={
              <ProtectedRoute>
                <MarcasPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;