import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute';
import { LoadingScreen } from './components/LoadingScreen';
import { Toaster } from './components/Toaster';
import { AuthProvider } from './context/AuthContext';
import ComingSoon from './pages/ComingSoon';
import Assistant from './pages/Assistant';
import Dashboard from './pages/Dashboard';
import EditorHome from './pages/EditorHome';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Redesign from './pages/Redesign';
import Register from './pages/Register';

const Editor = lazy(() => import('./pages/Editor'));

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
              <Route path="/redesign" element={<Redesign />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/editor" element={<EditorHome />} />
              <Route
                path="/editor/:projectId"
                element={
                  <Suspense fallback={<LoadingScreen />}>
                    <Editor />
                  </Suspense>
                }
              />
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
