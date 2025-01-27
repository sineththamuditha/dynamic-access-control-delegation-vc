import './App.css';
import LogProvider from './context/LogContext';
import TwoPageView from './pages/TwoPageView';

function App() {
  return (
      <LogProvider>
        <TwoPageView />
      </LogProvider>
  );
}

export default App;
