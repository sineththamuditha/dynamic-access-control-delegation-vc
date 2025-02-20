import "./App.css";
import DIDStoreProvider from "./context/didStore";
import LogProvider from "./context/LogContext";
import PageProvider from "./context/PageContext";
import TwoPageView from "./pages/TwoPageView";

function App() {
  return (
    <LogProvider>
      <PageProvider>
        <DIDStoreProvider>
          <TwoPageView />
        </DIDStoreProvider>
      </PageProvider>
    </LogProvider>
  );
}

export default App;
