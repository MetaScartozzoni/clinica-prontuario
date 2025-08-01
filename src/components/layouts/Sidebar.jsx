import React, { useContext, useState } from 'react';
    import { NavLink, useLocation } from 'react-router-dom';
    import {
      LayoutDashboard,
      Calendar,
      Users,
      Stethoscope,
      FileText,
      Settings,
      LogOut,
      ChevronLeft,
      ChevronRight,
      GanttChartSquare,
      Briefcase,
      Inbox,
      Gem,
      Star,
      Sparkles
    } from 'lucide-react';
    import { SidebarContext } from '@/contexts/SidebarContext';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useProfile } from '@/contexts/ProfileContext';
    import { motion, AnimatePresence } from 'framer-motion';
    import PerformanceModal from '@/components/performance/PerformanceModal';
    import ZenSpaceModal from '@/components/zen/ZenSpaceModal';

    const navItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'doctor', 'nurse', 'accountant', 'patient'] },
      { icon: LayoutDashboard, label: 'Painel Principal', path: '/secretary/dashboard', roles: ['receptionist'] },
      { icon: Inbox, label: 'Caixa de Entrada', path: '/central-de-tarefas', roles: ['admin', 'doctor', 'nurse', 'receptionist', 'accountant'] },
      { icon: Calendar, label: 'Agenda', path: '/agenda', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
      { icon: Users, label: 'Pacientes', path: '/pacientes', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
      { icon: Stethoscope, label: 'Cirurgias', path: '/cirurgias', roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
      { icon: Gem, label: 'Espaço Paciente', path: '/espaco-paciente', roles: ['patient'] },
      { icon: FileText, label: 'Orçamentos', path: '/orcamentos', roles: ['admin', 'doctor', 'receptionist'] },
      { icon: GanttChartSquare, label: 'Pipeline', path: '/pipeline-vendas', roles: ['admin', 'receptionist'] },
      { icon: Briefcase, label: 'Comercial', path: '/painel-comercial', roles: ['admin', 'receptionist'] },
    ];
    
    const employeeRoles = ['receptionist', 'nurse', 'doctor', 'accountant', 'admin'];

    const Sidebar = () => {
      const { isCollapsed, toggleSidebar } = useContext(SidebarContext);
      const { signOut } = useAuth();
      const { profile } = useProfile();
      const location = useLocation();
      const [isPerformanceModalOpen, setPerformanceModalOpen] = useState(false);
      const [isZenSpaceModalOpen, setZenSpaceModalOpen] = useState(false);

      const sidebarVariants = {
        collapsed: { width: '80px' },
        expanded: { width: '250px' },
      };

      const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
      };

      const textVariants = {
        collapsed: { opacity: 0, width: 0, display: 'none' },
        expanded: { opacity: 1, width: 'auto', display: 'inline' },
      };

      const filteredNavItems = navItems.filter(item => {
        if (!profile || !profile.role) return false;
        return item.roles.includes(profile.role);
      });

      return (
        <>
          <motion.aside
            variants={sidebarVariants}
            initial={false}
            animate={isCollapsed ? 'collapsed' : 'expanded'}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-gray-900 text-white flex flex-col h-screen sticky top-0"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    variants={textVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    transition={{ duration: 0.2 }}
                    className="font-bold text-xl whitespace-nowrap"
                  >
                    Clínica
                  </motion.span>
                )}
              </AnimatePresence>
              <button onClick={toggleSidebar} className="p-1 rounded-full hover:bg-gray-700">
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>

            <nav className="flex-grow p-2">
              <ul>
                {filteredNavItems.map((item, index) => (
                  <motion.li
                    key={item.path}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                          isActive
                            ? 'bg-violet-600 text-white shadow-lg'
                            : 'hover:bg-gray-700'
                        } ${isCollapsed ? 'justify-center' : ''}`
                      }
                    >
                      <item.icon size={24} />
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            variants={textVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            transition={{ duration: 0.2, delay: 0.1 }}
                            className="ml-4 font-medium whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </NavLink>
                  </motion.li>
                ))}
                
                {profile && employeeRoles.includes(profile.role) && (
                   <>
                    <motion.li
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: filteredNavItems.length * 0.1 }}
                    >
                      <button
                        onClick={() => setZenSpaceModalOpen(true)}
                        className={`w-full flex items-center p-3 my-1 rounded-lg transition-colors duration-200 hover:bg-sky-500/80 ${isCollapsed ? 'justify-center' : ''}`}
                      >
                        <Sparkles size={24} className="text-sky-300" />
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.span
                              variants={textVariants}
                              initial="collapsed"
                              animate="expanded"
                              exit="collapsed"
                              transition={{ duration: 0.2, delay: 0.1 }}
                              className="ml-4 font-medium whitespace-nowrap"
                            >
                              Fale Comigo
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </motion.li>
                    <motion.li
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: (filteredNavItems.length + 1) * 0.1 }}
                    >
                      <button
                        onClick={() => setPerformanceModalOpen(true)}
                        className={`w-full flex items-center p-3 my-1 rounded-lg transition-colors duration-200 hover:bg-amber-500/80 ${isCollapsed ? 'justify-center' : ''}`}
                      >
                        <Star size={24} className="text-amber-300" />
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.span
                              variants={textVariants}
                              initial="collapsed"
                              animate="expanded"
                              exit="collapsed"
                              transition={{ duration: 0.2, delay: 0.1 }}
                              className="ml-4 font-medium whitespace-nowrap"
                            >
                              Meu Desempenho
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </button>
                    </motion.li>
                   </>
                )}

              </ul>
            </nav>

            <div className="p-2 border-t border-gray-700">
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                    isActive ? 'bg-violet-600 text-white' : 'hover:bg-gray-700'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
              >
                <Settings size={24} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      variants={textVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className="ml-4 font-medium whitespace-nowrap"
                    >
                      Configurações
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
              <button
                onClick={signOut}
                className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 hover:bg-red-500/80 ${
                  isCollapsed ? 'justify-center' : ''
                }`}
              >
                <LogOut size={24} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      variants={textVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className="ml-4 font-medium whitespace-nowrap"
                    >
                      Sair
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </motion.aside>
          {isPerformanceModalOpen && (
            <PerformanceModal
              isOpen={isPerformanceModalOpen}
              onClose={() => setPerformanceModalOpen(false)}
            />
          )}
          {isZenSpaceModalOpen && (
            <ZenSpaceModal
              isOpen={isZenSpaceModalOpen}
              onClose={() => setZenSpaceModalOpen(false)}
            />
          )}
        </>
      );
    };

    export default Sidebar;