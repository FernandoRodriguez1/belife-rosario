import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layers, Tag } from 'lucide-react';
import AuthProvider from './components/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import ToastProvider from './components/ToastProvider';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import CatalogPage from './pages/CatalogPage';
import { categoriasService, marcasService } from './services/catalogService';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
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
                <CatalogPage
                  title="Categorías"
                  icon={Layers}
                  labelSingular="categoría"
                  service={categoriasService}
                  emptyMessage="Aún no hay categorías. Creá la primera."
                  productLabel="Productos"
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marcas"
            element={
              <ProtectedRoute>
                <CatalogPage
                  title="Marcas"
                  icon={Tag}
                  labelSingular="marca"
                  service={marcasService}
                  emptyMessage="Aún no hay marcas. Creá la primera."
                  productLabel="Productos"
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;