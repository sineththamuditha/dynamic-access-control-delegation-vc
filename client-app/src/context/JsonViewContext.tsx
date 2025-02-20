import React, { useState, ReactNode } from "react";

interface JsonViewContextType {
  json: any;
  changeJson: (newJson: any) => void;
  clear: () => void;
}

export const JsonViewContext = React.createContext<JsonViewContextType>({
  json: {},
  changeJson: () => {},
  clear: () => {},
});

interface JsonViewProviderProps {
  children: ReactNode;
}

const JsonViewProvider: React.FC<JsonViewProviderProps> = ({ children }) => {
  const [json, setJson] = useState<any>({});

  const changeJson = (json: any) => {
    setJson(json);
  };

  const clear = () => {
    setJson({});
  };

  return (
    <JsonViewContext.Provider value={{ json, changeJson, clear }}>
      {children}
    </JsonViewContext.Provider>
  );
};

export default JsonViewProvider;
