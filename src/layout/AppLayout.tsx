import React from 'react';
import { AppSidebar, AppRoute } from './AppSidebar';

interface AppLayoutProps {
  activeRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ activeRoute, onRouteChange, children }) => {
  return (
    <div className="app">
      <AppSidebar activeRoute={activeRoute} onRouteChange={onRouteChange} />
      <main className="app-main">
        <header className="app-header top-bar">
          <h1 className="app-header-title">Creare Sistemas</h1>
        </header>
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
};

export type { AppRoute };
