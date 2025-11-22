import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllTaxConfigs, createTaxConfig, updateTaxConfig, deleteTaxConfig, setDefaultTaxConfig } from '../services/api';
import { Plus, Edit, Trash2, Star } from 'lucide-react';

export default function ConfigPage() {
  const { t } = useTranslation();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    countryCode: 'US',
    currency: 'USD',
    socialInsuranceRate: 0,
    healthInsuranceRate: 0,
    unemploymentInsuranceRate: 0,
    personalDeduction: 0,
    dependentDeduction: 0,
    maxInsuranceBase: 0,
    notes: '',
    isDefault: false,
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await getAllTaxConfigs();
      setConfigs(data);
    } catch (error) {
      console.error('Error loading configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingConfig) {
        await updateTaxConfig(editingConfig.id, formData);
      } else {
        await createTaxConfig(formData);
      }
      await loadConfigs();
      resetForm();
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error saving configuration');
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      countryCode: config.countryCode,
      currency: config.currency,
      socialInsuranceRate: config.socialInsuranceRate,
      healthInsuranceRate: config.healthInsuranceRate,
      unemploymentInsuranceRate: config.unemploymentInsuranceRate,
      personalDeduction: config.personalDeduction,
      dependentDeduction: config.dependentDeduction,
      maxInsuranceBase: config.maxInsuranceBase,
      notes: config.notes || '',
      isDefault: config.isDefault,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    try {
      await deleteTaxConfig(id);
      await loadConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      alert('Error deleting configuration');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultTaxConfig(id);
      await loadConfigs();
    } catch (error) {
      console.error('Error setting default config:', error);
      alert('Error setting default configuration');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      countryCode: 'US',
      currency: 'USD',
      socialInsuranceRate: 0,
      healthInsuranceRate: 0,
      unemploymentInsuranceRate: 0,
      personalDeduction: 0,
      dependentDeduction: 0,
      maxInsuranceBase: 0,
      notes: '',
      isDefault: false,
    });
    setEditingConfig(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('config')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage tax system configurations
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('create')}
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingConfig ? t('edit') : t('create')} Tax Configuration
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('name')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country Code
                </label>
                <input
                  type="text"
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  maxLength="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  maxLength="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Social Insurance Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.socialInsuranceRate}
                  onChange={(e) => setFormData({ ...formData, socialInsuranceRate: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Health Insurance Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.healthInsuranceRate}
                  onChange={(e) => setFormData({ ...formData, healthInsuranceRate: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unemployment Insurance Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.unemploymentInsuranceRate}
                  onChange={(e) => setFormData({ ...formData, unemploymentInsuranceRate: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Deduction
                </label>
                <input
                  type="number"
                  value={formData.personalDeduction}
                  onChange={(e) => setFormData({ ...formData, personalDeduction: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dependent Deduction
                </label>
                <input
                  type="number"
                  value={formData.dependentDeduction}
                  onChange={(e) => setFormData({ ...formData, dependentDeduction: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Insurance Base (0 = no limit)
                </label>
                <input
                  type="number"
                  value={formData.maxInsuranceBase}
                  onChange={(e) => setFormData({ ...formData, maxInsuranceBase: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label className="ml-2 text-sm text-gray-700">Set as default</label>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {editingConfig ? t('update') : t('save')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">{t('loading')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configs.map(config => (
            <div key={config.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{config.name}</h3>
                  {config.isDefault && (
                    <span className="inline-flex items-center text-xs text-primary-600 mt-1">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(config)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Country:</span>
                  <span className="font-semibold">{config.countryCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-semibold">{config.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Social Insurance:</span>
                  <span className="font-semibold">{config.socialInsuranceRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Health Insurance:</span>
                  <span className="font-semibold">{config.healthInsuranceRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Personal Deduction:</span>
                  <span className="font-semibold">{config.currency} {config.personalDeduction.toLocaleString()}</span>
                </div>
                {!config.isDefault && (
                  <button
                    onClick={() => handleSetDefault(config.id)}
                    className="w-full mt-4 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

