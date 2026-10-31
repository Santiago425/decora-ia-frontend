import { Outlet } from 'react-router-dom';
import { AssistantActions } from '../assistant/AssistantActions';
import { LumiLauncher } from '../assistant/LumiLauncher';
import { MobileNav, MobileTopBar } from './MobileNav';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <MobileTopBar />
      <main className="app-main">
        <Outlet />
      </main>
      <MobileNav />
      <LumiLauncher />
      <AssistantActions />
    </div>
  );
}
