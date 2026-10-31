import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/Toaster';
import { config } from './config';
import { AuthProvider } from './context/AuthContext';
import ComingSoon from './pages/ComingSoon';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Register from './pages/Register';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/redesign" element={<ComingSoon title="Rediseño con foto" />} />
              <Route path="/assistant" element={<ComingSoon title={config.assistantName} />} />
              <Route path="/editor" element={<ComingSoon title="Editor 3D" />} />
              <Route path="/projects" element={<ComingSoon title="Mis proyectos" />} />
              <Route path="/docs" element={<ComingSoon title="Documentación" />} />
              <Route element={<ProtectedRoute role="admin" />}>
                <Route path="/admin" element={<ComingSoon title="Administración" />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
