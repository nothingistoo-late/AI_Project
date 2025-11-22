import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllPresets, deletePreset } from '../services/api';
import { Trash2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PresetsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    setLoading(true);
    try {
      const data = await getAllPresets();
      setPresets(data);
    } catch (error) {
      console.error('Error loading presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this preset?')) return;
    try {
      await deletePreset(id);
      await loadPresets();
    } catch (error) {
      console.error('Error deleting preset:', error);
      alert('Error deleting preset');
    }
  };

  const handleUsePreset = (preset) => {
    navigate('/', { state: { preset } });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('presets')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your saved calculation presets
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">{t('loading')}</p>
        </div>
      ) : presets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No presets saved yet.</p>
          <p className="text-sm text-gray-500 mt-2">Save calculations from the calculator page to create presets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presets.map(preset => (
            <div key={preset.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{preset.name}</h3>
                  {preset.description && (
                    <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(preset.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode:</span>
                  <span className="font-semibold">{preset.calculationMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('grossIncome')}:</span>
                  <span className="font-semibold">{preset.grossIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('netIncome')}:</span>
                  <span className="font-semibold">{preset.netIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('numberOfDependents')}:</span>
                  <span className="font-semibold">{preset.numberOfDependents}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Updated: {new Date(preset.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleUsePreset(preset)}
                className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Use Preset
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

