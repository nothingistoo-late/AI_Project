import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { compareTaxSystems, getAllTaxConfigs } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ComparisonPage() {
  const { t } = useTranslation();
  const [taxConfigs, setTaxConfigs] = useState([]);
  const [selectedConfigs, setSelectedConfigs] = useState([]);
  const [grossIncome, setGrossIncome] = useState('');
  const [numberOfDependents, setNumberOfDependents] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTaxConfigs();
  }, []);

  const loadTaxConfigs = async () => {
    try {
      const configs = await getAllTaxConfigs();
      setTaxConfigs(configs);
    } catch (error) {
      console.error('Error loading tax configs:', error);
    }
  };

  const handleCompare = async () => {
    if (selectedConfigs.length === 0 || !grossIncome) return;

    setLoading(true);
    try {
      const comparisonResults = await Promise.all(
        selectedConfigs.map(configId =>
          compareTaxSystems({
            grossIncome: parseFloat(grossIncome),
            taxConfigIds: [configId],
            numberOfDependents,
          })
        )
      );
      setResults(comparisonResults);
    } catch (error) {
      console.error('Error comparing tax systems:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleConfig = (configId) => {
    setSelectedConfigs(prev =>
      prev.includes(configId)
        ? prev.filter(id => id !== configId)
        : [...prev, configId]
    );
  };

  const chartData = results.map((result, index) => {
    const config = taxConfigs.find(c => c.id === selectedConfigs[index]);
    return {
      name: config?.name || `Config ${index + 1}`,
      netIncome: result.netIncome,
      totalTax: result.totalTax,
      totalInsurance: result.totalInsurance,
    };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('comparison')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Compare tax calculations across different tax systems
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('grossIncome')}
            </label>
            <input
              type="number"
              value={grossIncome}
              onChange={(e) => setGrossIncome(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('numberOfDependents')}
            </label>
            <input
              type="number"
              value={numberOfDependents}
              onChange={(e) => setNumberOfDependents(parseInt(e.target.value) || 0)}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Tax Systems to Compare
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {taxConfigs.map(config => (
              <label key={config.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedConfigs.includes(config.id)}
                  onChange={() => toggleConfig(config.id)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm">{config.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={loading || selectedConfigs.length === 0}
          className="mt-6 w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('loading') : 'Compare'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Comparison Results</h2>
          
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="netIncome" fill="#10b981" name="Net Income" />
              <Bar dataKey="totalTax" fill="#ef4444" name="Total Tax" />
              <Bar dataKey="totalInsurance" fill="#f59e0b" name="Total Insurance" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result, index) => {
              const config = taxConfigs.find(c => c.id === selectedConfigs[index]);
              return (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4">{config?.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{t('grossIncome')}</span>
                      <span className="font-semibold">{result.currency} {result.grossIncome.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('netIncome')}</span>
                      <span className="font-semibold text-green-600">{result.currency} {result.netIncome.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('totalTax')}</span>
                      <span className="font-semibold text-red-600">{result.currency} {result.totalTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('totalInsurance')}</span>
                      <span className="font-semibold">{result.currency} {result.totalInsurance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

