import React, { useState, ReactNode } from "react";

interface LogContextType {
  logs: string[];
  addLog: (newLog: string) => void;
  clearLogs: () => void;
}

export const LogContext = React.createContext<LogContextType>({
  logs: [],
  addLog: () => {},
  clearLogs: () => {},
});

interface LogProviderProps {
  children: ReactNode;
}
const LogProvider: React.FC<LogProviderProps> = ({ children }) => {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (newLog: string) => {
    setLogs((preLogs) => [...preLogs, newLog]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <LogContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </LogContext.Provider>
  );
};

export default LogProvider;
