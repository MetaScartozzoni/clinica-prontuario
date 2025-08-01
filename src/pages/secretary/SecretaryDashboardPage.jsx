import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardHeader from './components/DashboardHeader';
import CentralActionPanel from './components/CentralActionPanel';
import RecentActivityFeed from './components/RecentActivityFeed';
import UpcomingAppointments from './components/UpcomingAppointments';

const SecretaryDashboardPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleActionSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <Helmet>
        <title>Dashboard da Secretaria</title>
        <meta name="description" content="Painel de controle centralizado para gerenciamento da secretaria." />
      </Helmet>
      <div className="space-y-6">
        <DashboardHeader />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CentralActionPanel onActionSuccess={handleActionSuccess} />
          </div>
          
          <div className="space-y-6">
            <UpcomingAppointments refreshTrigger={refreshTrigger} />
            <RecentActivityFeed refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </>
  );
};

export default SecretaryDashboardPage;