import React from "react";
import "./App.css";
import DIDStoreProvider from "./context/didStore";
import LogProvider from "./context/LogContext";
import PageProvider from "./context/PageContext";
import TwoPageView from "./pages/TwoPageView";

function App() {
  return (
    <LogProvider children={undefined}>
      <PageProvider children={undefined}>
        <DIDStoreProvider children={undefined}>
          <TwoPageView />
        </DIDStoreProvider>
      </PageProvider>
    </LogProvider>
  );
}

export default App;
