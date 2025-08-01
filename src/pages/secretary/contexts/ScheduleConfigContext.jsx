import React, { createContext, useContext, useState } from 'react';

const ScheduleConfigContext = createContext();

export const useScheduleConfig = () => useContext(ScheduleConfigContext);

export const ScheduleConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    workHours: { start: '08:00', end: '18:00' },
    slotDuration: 30, // in minutes
    hiddenDays: [0, 6], // Sunday, Saturday
  });

  const updateConfig = (newConfig) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const value = {
    config,
    updateConfig,
  };

  return (
    <ScheduleConfigContext.Provider value={value}>
      {children}
    </ScheduleConfigContext.Provider>
  );
};