import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AssistantActions } from '../assistant/AssistantActions';
import { LumiLauncher } from '../assistant/LumiLauncher';
import { MobileNav, MobileTopBar } from './MobileNav';
import { PageLoading } from '../PageLoading';
import { Sidebar } from './Sidebar';
import { AppBackdrop } from './AppBackdrop';

export function AppLayout() {
  return (
    <div className="app-shell">
      <AppBackdrop />
      <Sidebar />
      <MobileTopBar />
      <main className="app-main">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <MobileNav />
      <LumiLauncher />
      <AssistantActions />
    </div>
  );
}
