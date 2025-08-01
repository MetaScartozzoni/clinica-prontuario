
    import React, { useEffect } from 'react';
    import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
    import { Helmet, HelmetProvider } from 'react-helmet-async';
    import { DndContext } from '@dnd-kit/core';

    import ClinicLayout from '@/components/layouts/ClinicLayout';
    import AdminLayout from '@/components/layouts/AdminLayout';
    import DoctorLayout from '@/components/layouts/DoctorLayout';

    import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
    import DoctorDashboardPage from '@/pages/doctor/DoctorDashboardPage';
    import SecretaryDashboardPage from '@/pages/secretary/SecretaryDashboardPage';

    import UserManagementPage from '@/pages/admin/UserManagementPage';
    import ProfessionalsManagementPage from '@/pages/admin/ProfessionalsManagementPage';
    import QuoteManagementPage from '@/pages/admin/QuoteManagementPage';
    import AppointmentsPage from '@/pages/AppointmentsPage';
    import PatientsManagementPage from '@/pages/PatientsManagementPage';
    import MedicalEvaluationPage from '@/pages/MedicalEvaluationPage';
    import ExamsPage from '@/pages/ExamsPage';
    import PatientDossierPage from '@/pages/PatientDossierPage';
    import PatientPortalPage from '@/pages/PatientPortalPage';
    import SurgeriesPage from '@/pages/SurgeriesPage';
    import UserSettingsPage from '@/pages/UserSettingsPage';
    import PublicPatientRegistrationPage from '@/pages/PublicPatientRegistrationPage';
    import { Loader2 } from 'lucide-react';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useProfile } from '@/contexts/ProfileContext';
    import Login from '@/pages/Login';
    import SignUp from '@/pages/SignUp';
    import UnauthorizedPage from '@/pages/UnauthorizedPage';
    import InactiveAccountPage from '@/pages/InactiveAccountPage';
    import PendingApprovalPage from '@/pages/PendingApprovalPage';
    import AdminRoute from '@/components/routes/AdminRoute';
    import UserRoute from '@/components/routes/UserRoute';
    import ForgotPassword from '@/pages/ForgotPassword';
    import UpdatePassword from '@/pages/UpdatePassword';
    import PublicHelpPage from '@/pages/PublicHelpPage';
    import SetupGate from '@/components/routes/SetupGate';
    import SetupPage from '@/pages/Setup';
    import AdminReAuthPage from '@/pages/AdminReAuthPage';
    import QuotesPage from '@/pages/QuotesPage';
    import ConsultationPage from '@/pages/ConsultationPage';
    import SalesPipelinePage from '@/pages/SalesPipelinePage';
    import CommercialPanelPage from '@/pages/CommercialPanelPage';
    import TaskCenterPage from '@/pages/TaskCenterPage';
    import PatientSchedulingPage from '@/pages/PatientSchedulingPage';
    import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

    const LoadingScreen = () => (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0E0A21] to-[#1B1446]">
        <div className="text-white text-2xl flex items-center">
          <Loader2 className="animate-spin h-8 w-8 mr-3" />
          Carregando...
        </div>
      </div>
    );

    const AppRouter = () => {
      const { loading: authLoading, session } = useAuth();
      const { profile, loadingProfile } = useProfile();
      const location = useLocation();
      const navigate = useNavigate();

      const getHomeRoute = () => {
        if (!profile) return '/login';
        
        switch(profile.status) {
          case 'inactive': return '/inactive';
          case 'pending': return '/pending-approval';
          case 'active':
            if (profile.role === 'admin') return '/admin/dashboard';
            if (profile.role === 'doctor') return '/doctor/dashboard';
            if (profile.role === 'receptionist') return '/secretary/dashboard';
            return '/login';
          default:
            return '/login';
        }
      };

      useEffect(() => {
        if (!authLoading && !loadingProfile && session && profile) {
          const homeRoute = getHomeRoute();
          const currentPath = location.pathname;
          
          const authPaths = ['/', '/login', '/signup', '/inactive', '/pending-approval', '/setup', '/forgot-password', '/update-password'];
          
          if (profile.status === 'active') {
            if (authPaths.includes(currentPath) && currentPath !== homeRoute) {
              navigate(homeRoute, { replace: true });
            }
          } else {
            if (currentPath !== homeRoute) {
              navigate(homeRoute, { replace: true });
            }
          }
        }
      }, [authLoading, loadingProfile, session, profile, location.pathname, navigate]);


      if (authLoading || (session && loadingProfile)) {
        return <LoadingScreen />;
      }

      return (
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/cadastro-paciente" element={<PublicPatientRegistrationPage />} />
          <Route path="/ajuda" element={<PublicHelpPage />} />
          
          {/* Rotas Protegidas */}
          <Route element={<UserRoute />}>
            {/* Páginas de status e verificação */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/inactive" element={<InactiveAccountPage />} />
            <Route path="/pending-approval" element={<PendingApprovalPage />} />
            <Route path="/admin/reauth" element={<AdminReAuthPage />} />

            {/* Redirecionamento da raiz para a home do usuário */}
            <Route path="/" element={<Navigate to={getHomeRoute()} replace />} />
            
            {/* Layout de Administrador */}
            <Route path="/admin/*" element={<AdminRoute requiredRole="admin"><AdminLayout /></AdminRoute>}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="professionals" element={<ProfessionalsManagementPage />} />
              <Route path="quotes" element={<QuoteManagementPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
            
            {/* Layout da Secretaria */}
            <Route path="/secretary/*" element={<AdminRoute requiredRole="receptionist"><ClinicLayout /></AdminRoute>}>
                <Route path="dashboard" element={<SecretaryDashboardPage />} />
                <Route path="agenda" element={<AppointmentsPage />} />
                <Route path="pacientes" element={<PatientsManagementPage />} />
                <Route path="cirurgias" element={<SurgeriesPage />} />
                <Route path="orcamentos" element={<QuotesPage />} />
                <Route path="tarefas" element={<TaskCenterPage />} />
                <Route path="configuracoes" element={<UserSettingsPage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Layout do Médico */}
            <Route path="/doctor/*" element={<AdminRoute requiredRole="doctor"><DoctorLayout /></AdminRoute>}>
                <Route path="dashboard" element={<DoctorDashboardPage />} />
                <Route path="agenda" element={<AppointmentsPage />} />
                <Route path="pacientes" element={<PatientsManagementPage />} />
                <Route path="cirurgias" element={<SurgeriesPage />} />
                <Route path="tarefas" element={<TaskCenterPage />} />
                <Route path="configuracoes" element={<UserSettingsPage />} />
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>

            {/* Rotas genéricas que podem ser acessadas por múltiplos perfis dentro de um layout */}
            <Route path="/atendimento/:patientId" element={<ClinicLayout><ConsultationPage /></ClinicLayout>} />
            <Route path="/avaliacao-medica/:patientId" element={<ClinicLayout><MedicalEvaluationPage /></ClinicLayout>} />
            <Route path="/exames/:patientId" element={<ClinicLayout><ExamsPage /></ClinicLayout>} />
            <Route path="/dossie/:patientId" element={<ClinicLayout><PatientDossierPage /></ClinicLayout>} />
            <Route path="/portal" element={<ClinicLayout><PatientPortalPage /></ClinicLayout>} />
            <Route path="/espaco-paciente" element={<ClinicLayout><PatientSchedulingPage /></ClinicLayout>} />
            <Route path="/pipeline-vendas" element={<ClinicLayout><SalesPipelinePage /></ClinicLayout>} />
            <Route path="/painel-comercial" element={<ClinicLayout><CommercialPanelPage /></ClinicLayout>} />

          </Route>

          {/* Rota Padrão para qualquer outro caminho */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      );
    };

    function App() {
      return (
        <HelmetProvider>
          <Helmet
            titleTemplate="%s | Clínica Prontuários"
            defaultTitle="Clínica Prontuários"
          >
            <meta name="description" content="Sistema de Gestão Clínica e Prontuários." />
          </Helmet>
          <DndContext>
            <SetupGate>
                <AppRouter />
            </SetupGate>
          </DndContext>
        </HelmetProvider>
      );
    }

    export default App;
  