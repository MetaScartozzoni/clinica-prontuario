
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import { BrowserRouter as Router } from 'react-router-dom';
    import { HelmetProvider } from 'react-helmet-async';
    import App from '@/App';
    import './index.css';
    import 'react-big-calendar/lib/css/react-big-calendar.css';
    import './styles/calendar.css';
    import { AuthProvider } from '@/contexts/SupabaseAuthContext';
    import { ProfileProvider } from '@/contexts/ProfileContext';
    import { SidebarProvider } from '@/contexts/SidebarContext';
    import { NotificationProvider } from '@/contexts/NotificationContext';
    import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
    import { Toaster } from "@/components/ui/toaster";
    import { WherebyProvider } from '@/contexts/WherebyContext';

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <HelmetProvider>
          <Router>
            <AuthProvider>
              <ProfileProvider>
                <AdminAuthProvider>
                  <WherebyProvider>
                    <NotificationProvider>
                      <SidebarProvider>
                        <App />
                        <Toaster />
                      </SidebarProvider>
                    </NotificationProvider>
                  </WherebyProvider>
                </AdminAuthProvider>
              </ProfileProvider>
            </AuthProvider>
          </Router>
        </HelmetProvider>
      </React.StrictMode>
    );
  