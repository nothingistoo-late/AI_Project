import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import TaxInputForm from '../components/TaxInputForm';
import TaxResults from '../components/TaxResults';
import { calculateTax } from '../services/api';
import { Save } from 'lucide-react';
import { createPreset } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function CalculatorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    if (location.state?.preset) {
      const preset = location.state.preset;
      setInitialData({
        taxConfigId: preset.taxConfigId,
        income: preset.calculationMode === 'GrossToNet' ? preset.grossIncome : preset.netIncome,
        mode: preset.calculationMode,
        numberOfDependents: preset.numberOfDependents,
        freelanceIncome: preset.freelanceIncome,
        bonusIncome: preset.bonusIncome,
        otherIncome: preset.otherIncome,
      });
    }
  }, [location.state]);

  const handleCalculate = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const calculationResult = await calculateTax({
        taxConfigId: formData.taxConfigId,
        income: formData.income,
        mode: formData.mode,
        numberOfDependents: formData.numberOfDependents,
        freelanceIncome: formData.freelanceIncome,
        bonusIncome: formData.bonusIncome,
        otherIncome: formData.otherIncome,
      });
      setResult(calculationResult);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while calculating tax.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!presetName.trim() || !result) return;

    try {
      // Get the current form data - we'll need to track this
      await createPreset({
        name: presetName,
        taxConfigId: 1, // Default, should be tracked from form
        grossIncome: result.grossIncome,
        netIncome: result.netIncome,
        numberOfDependents: 0,
        calculationMode: 'GrossToNet',
        freelanceIncome: 0,
        bonusIncome: 0,
        otherIncome: 0,
      });
      setShowSavePreset(false);
      setPresetName('');
      alert(t('success'));
      navigate('/presets');
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving preset');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('calculate')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Calculate your tax liability with detailed breakdowns
        </p>
      </div>

      <TaxInputForm onSubmit={handleCalculate} initialData={initialData} />

      {loading && (
        <div className="mt-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">{t('loading')}</p>
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {result && (
        <>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowSavePreset(true)}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {t('savePreset')}
            </button>
          </div>
          {showSavePreset && (
            <div className="mt-4 bg-white shadow rounded-lg p-4">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder={t('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSavePreset}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {t('save')}
                </button>
                <button
                  onClick={() => {
                    setShowSavePreset(false);
                    setPresetName('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}
          <TaxResults result={result} />
        </>
      )}
    </div>
  );
}

