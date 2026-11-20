import { Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute';
import { LoadingScreen } from './components/LoadingScreen';
import { Toaster } from './components/Toaster';
import { AuthProvider } from './context/AuthContext';
import { pages } from './routes/pages';

const {
  login: Login,
  register: Register,
  dashboard: Dashboard,
  redesign: Redesign,
  assistant: Assistant,
  editorHome: EditorHome,
  editor: Editor,
  projects: Projects,
  docs: Docs,
  admin: Admin,
  notFound: NotFound,
} = pages;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
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
                <Route path="/editor/:projectId" element={<Editor />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/docs" element={<Docs />} />
                <Route element={<ProtectedRoute role="admin" />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
