import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CalculatorPage from './pages/CalculatorPage';
import ExchangePage from './pages/ExchangePage';
import ComparisonPage from './pages/ComparisonPage';
import ConfigPage from './pages/ConfigPage';
import PresetsPage from './pages/PresetsPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<CalculatorPage />} />
          <Route path="/exchange" element={<ExchangePage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/presets" element={<PresetsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

