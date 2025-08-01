import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layouts/Sidebar';
import Header from '@/components/layouts/Header';
import { SidebarProvider } from '@/contexts/SidebarContext';

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gradient-to-br from-[#0E0A21] to-[#1B1446] text-white">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;