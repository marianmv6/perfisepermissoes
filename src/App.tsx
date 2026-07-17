import React, { useState } from 'react';
import { AppLayout, AppRoute } from './layout/AppLayout';
import { PerfisPermissoesPage } from './pages/perfis-permissoes/PerfisPermissoesPage';
import './App.css';
import './styles/components.css';

function App() {
  const [activeRoute, setActiveRoute] = useState<AppRoute>('perfis-permissoes');

  const renderContent = () => {
    if (activeRoute === 'perfis-permissoes') {
      return <PerfisPermissoesPage />;
    }
    return null;
  };

  return (
    <AppLayout activeRoute={activeRoute} onRouteChange={setActiveRoute}>
      {renderContent()}
    </AppLayout>
  );
}

export default App;
