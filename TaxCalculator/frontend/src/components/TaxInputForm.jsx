import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllTaxConfigs } from '../services/api';

export default function TaxInputForm({ onSubmit, initialData = {} }) {
  const { t } = useTranslation();
  const [taxConfigs, setTaxConfigs] = useState([]);
  const [formData, setFormData] = useState({
    taxConfigId: initialData.taxConfigId || '',
    income: initialData.income || '',
    mode: initialData.mode || 'GrossToNet',
    numberOfDependents: initialData.numberOfDependents || 0,
    freelanceIncome: initialData.freelanceIncome || 0,
    bonusIncome: initialData.bonusIncome || 0,
    otherIncome: initialData.otherIncome || 0,
  });

  useEffect(() => {
    loadTaxConfigs();
  }, []);

  const loadTaxConfigs = async () => {
    try {
      const configs = await getAllTaxConfigs();
      setTaxConfigs(configs);
      if (configs.length > 0 && !formData.taxConfigId) {
        const defaultConfig = configs.find(c => c.isDefault) || configs[0];
        setFormData(prev => ({ ...prev, taxConfigId: defaultConfig.id }));
      }
    } catch (error) {
      console.error('Error loading tax configs:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mode' || name === 'taxConfigId' ? value : parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      income: parseFloat(formData.income),
      taxConfigId: parseInt(formData.taxConfigId),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('selectTaxSystem')}
          </label>
          <select
            name="taxConfigId"
            value={formData.taxConfigId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="">{t('selectTaxSystem')}</option>
            {taxConfigs.map(config => (
              <option key={config.id} value={config.id}>
                {config.name} ({config.currency})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calculation Mode
          </label>
          <select
            name="mode"
            value={formData.mode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="GrossToNet">{t('grossToNet')}</option>
            <option value="NetToGross">{t('netToGross')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.mode === 'GrossToNet' ? t('grossIncome') : t('netIncome')}
          </label>
          <input
            type="number"
            name="income"
            value={formData.income}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('numberOfDependents')}
          </label>
          <input
            type="number"
            name="numberOfDependents"
            value={formData.numberOfDependents}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('freelanceIncome')}
          </label>
          <input
            type="number"
            name="freelanceIncome"
            value={formData.freelanceIncome}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('bonusIncome')}
          </label>
          <input
            type="number"
            name="bonusIncome"
            value={formData.bonusIncome}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('otherIncome')}
          </label>
          <input
            type="number"
            name="otherIncome"
            value={formData.otherIncome}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {t('calculateTax')}
        </button>
      </div>
    </form>
  );
}

