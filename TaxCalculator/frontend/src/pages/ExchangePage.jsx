import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { convertCurrency, getAllExchangeRates, refreshExchangeRates, createOrUpdateExchangeRate, deleteExchangeRate } from '../services/api';
import { RefreshCw, ArrowLeftRight, TrendingUp, Edit2, Trash2, Plus, X } from 'lucide-react';

const COMMON_CURRENCIES = ['USD', 'VND', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD', 'SGD'];

export default function ExchangePage() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('VND');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rates, setRates] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showManageRates, setShowManageRates] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({
    fromCurrency: 'USD',
    toCurrency: 'VND',
    rate: '',
    source: 'Manual'
  });

  useEffect(() => {
    loadRates();
    // Reload rates every 30 seconds to keep them fresh
    const interval = setInterval(() => {
      loadRates();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      handleConvert();
    }
  }, [amount, fromCurrency, toCurrency]);

  const loadRates = async () => {
    try {
      const data = await getAllExchangeRates();
      console.log('Loaded rates from API:', data); // Debug log
      if (data && Array.isArray(data)) {
        // Normalize property names (handle both camelCase and PascalCase)
        const normalizedRates = data.map(rate => ({
          Id: rate.Id || rate.id,
          FromCurrency: (rate.FromCurrency || rate.fromCurrency || '').toUpperCase(),
          ToCurrency: (rate.ToCurrency || rate.toCurrency || '').toUpperCase(),
          Rate: rate.Rate !== undefined ? (rate.Rate || rate.rate) : (rate.rate !== undefined ? rate.rate : undefined),
          LastUpdated: rate.LastUpdated || rate.lastUpdated,
          Source: rate.Source || rate.source,
          IsActive: rate.IsActive !== undefined ? rate.IsActive : (rate.isActive !== undefined ? rate.isActive : true)
        })).filter(rate => rate.FromCurrency && rate.ToCurrency && rate.Rate !== undefined);
        setRates(normalizedRates);
        console.log('Rates set successfully. Count:', normalizedRates.length);
        // Log USD rates specifically
        const usdRates = normalizedRates.filter(r => r.FromCurrency === 'USD');
        console.log('USD rates found:', usdRates.length, usdRates);
        // Log first rate structure for debugging
        if (normalizedRates.length > 0) {
          console.log('First rate structure:', normalizedRates[0]);
        }
      } else {
        console.warn('Invalid data format:', data);
        setRates([]);
      }
    } catch (error) {
      console.error('Error loading rates:', error);
      setRates([]);
    }
  };

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setResult(null);
      return;
    }

    if (fromCurrency === toCurrency) {
      setResult({
        originalAmount: parseFloat(amount),
        fromCurrency,
        convertedAmount: parseFloat(amount),
        toCurrency,
        exchangeRate: 1,
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await convertCurrency(parseFloat(amount), fromCurrency, toCurrency);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error converting currency');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshRates = async () => {
    setRefreshing(true);
    try {
      await refreshExchangeRates();
      await loadRates();
      // Re-convert with new rates
      if (amount && fromCurrency && toCurrency) {
        await handleConvert();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error refreshing rates');
    } finally {
      setRefreshing(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleEditRate = (rate) => {
    setEditingRate(rate);
    setFormData({
      fromCurrency: rate.FromCurrency,
      toCurrency: rate.ToCurrency,
      rate: rate.Rate.toString(),
      source: rate.Source || 'Manual'
    });
    setShowManageRates(true);
  };

  const handleSaveRate = async () => {
    if (!formData.fromCurrency || !formData.toCurrency || !formData.rate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await createOrUpdateExchangeRate({
        fromCurrency: formData.fromCurrency,
        toCurrency: formData.toCurrency,
        rate: parseFloat(formData.rate),
        source: formData.source
      });
      await loadRates();
      setShowManageRates(false);
      setEditingRate(null);
      setFormData({
        fromCurrency: 'USD',
        toCurrency: 'VND',
        rate: '',
        source: 'Manual'
      });
      alert('Exchange rate saved successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving exchange rate');
    }
  };

  const handleDeleteRate = async (id) => {
    if (!confirm('Are you sure you want to delete this exchange rate?')) return;
    
    try {
      await deleteExchangeRate(id);
      await loadRates();
      alert('Exchange rate deleted successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting exchange rate');
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('exchange')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            Convert between different currencies with real-time exchange rates
          </p>
        </div>
        <button
          onClick={handleRefreshRates}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('refreshRates')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Converter */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('amount')}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter amount"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('fromCurrency')}
                  </label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {COMMON_CURRENCIES.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={swapCurrencies}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-primary-300 rounded-md hover:bg-primary-50 text-primary-600"
                  >
                    <ArrowLeftRight className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('toCurrency')}
                  </label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {COMMON_CURRENCIES.map(currency => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {loading && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              )}

              {result && !loading && (
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border-2 border-primary-200">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      {result.originalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {result.fromCurrency}
                    </div>
                    <div className="text-4xl font-bold text-primary-600 mb-2">
                      {result.convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-lg text-gray-700 mb-4">
                      {result.toCurrency}
                    </div>
                    {result.exchangeRate && typeof result.exchangeRate === 'number' && (
                      <div className="text-sm text-gray-600">
                        {t('exchangeRate')}: 1 {result.fromCurrency} = {result.exchangeRate.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {result.toCurrency}
                        {result.isReverseRate && (
                          <span className="ml-2 text-xs text-blue-600" title="Calculated from reverse rate">
                            (reverse)
                          </span>
                        )}
                        {result.rateSource && result.rateSource.includes('Cross-rate') && (
                          <span className="ml-2 text-xs text-green-600" title="Calculated via USD">
                            (via USD)
                          </span>
                        )}
                      </div>
                    )}
                    {result.lastUpdated && (
                      <div className="text-xs text-gray-500 mt-2">
                        {t('lastUpdated')}: {new Date(result.lastUpdated).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Popular Rates */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
              Popular Rates
            </h2>
            <button
              onClick={() => setShowManageRates(!showManageRates)}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              {showManageRates ? <X className="w-4 h-4 mr-1" /> : <Edit2 className="w-4 h-4 mr-1" />}
              {showManageRates ? 'Close' : t('manageRates')}
            </button>
          </div>
          
          {!showManageRates ? (
            <div className="space-y-3">
              {(() => {
                // Filter out invalid rates first
                const validRates = rates.filter(rate => 
                  rate && 
                  rate.Id && 
                  rate.FromCurrency && 
                  rate.ToCurrency && 
                  rate.Rate !== undefined && 
                  rate.Rate !== null &&
                  typeof rate.Rate === 'number' &&
                  (rate.IsActive === undefined || rate.IsActive === true)
                );
                
                if (validRates.length === 0) {
                  return (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No rates available. Click "Refresh Rates" to load.
                    </div>
                  );
                }
                
                // Priority order: USD rates with common currencies > USD rates > Any rates
                // Also include reverse rates (e.g., if we have VND->USD, show USD->VND)
                let displayRates = [];
                
                // First priority: USD to common currencies
                const usdToCommon = validRates.filter(rate => 
                  rate.FromCurrency === 'USD' && 
                  COMMON_CURRENCIES.includes(rate.ToCurrency)
                );
                
                // Also check for reverse rates (e.g., VND->USD means we can show USD->VND)
                const reverseUsdRates = validRates
                  .filter(rate => 
                    rate.ToCurrency === 'USD' && 
                    COMMON_CURRENCIES.includes(rate.FromCurrency)
                  )
                  .map(rate => ({
                    ...rate,
                    FromCurrency: 'USD',
                    ToCurrency: rate.FromCurrency,
                    Rate: 1 / rate.Rate,
                    Id: rate.Id + 10000, // Virtual ID for reverse rate
                    Source: (rate.Source || '') + ' (reverse)'
                  }));
                
                if (usdToCommon.length > 0) {
                  displayRates = usdToCommon.slice(0, 6);
                } else if (reverseUsdRates.length > 0) {
                  displayRates = reverseUsdRates.slice(0, 6);
                } else {
                  // Second priority: Any USD rates
                  const anyUsdRates = validRates.filter(rate => rate.FromCurrency === 'USD');
                  if (anyUsdRates.length > 0) {
                    displayRates = anyUsdRates.slice(0, 6);
                  } else {
                    // Third priority: Any valid rates (including reverse)
                    const allRatesWithReverse = [
                      ...validRates,
                      ...validRates
                        .filter(rate => !validRates.some(r => r.FromCurrency === rate.ToCurrency && r.ToCurrency === rate.FromCurrency))
                        .map(rate => ({
                          ...rate,
                          FromCurrency: rate.ToCurrency,
                          ToCurrency: rate.FromCurrency,
                          Rate: 1 / rate.Rate,
                          Id: rate.Id + 10000,
                          Source: (rate.Source || '') + ' (reverse)'
                        }))
                    ];
                    displayRates = allRatesWithReverse.slice(0, 6);
                  }
                }
                
                return displayRates.map(rate => {
                  const isReverse = rate.Source && rate.Source.includes('reverse');
                  return (
                    <div key={rate.Id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                      onClick={() => {
                        setFromCurrency(rate.FromCurrency);
                        setToCurrency(rate.ToCurrency);
                      }}>
                      <div className="text-sm flex items-center">
                        <span className="font-semibold">{rate.FromCurrency || 'N/A'}</span>
                        <span className="mx-2">→</span>
                        <span className="font-semibold">{rate.ToCurrency || 'N/A'}</span>
                        {isReverse && (
                          <span className="ml-2 text-xs text-blue-600" title="Reverse rate">
                            ↻
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-primary-600">
                        {typeof rate.Rate === 'number' ? rate.Rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : 'N/A'}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-md font-semibold mb-3">{editingRate ? 'Edit Rate' : 'Add New Rate'}</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t('fromCurrency')}</label>
                    <select
                      value={formData.fromCurrency}
                      onChange={(e) => setFormData({ ...formData, fromCurrency: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      {COMMON_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t('toCurrency')}</label>
                    <select
                      value={formData.toCurrency}
                      onChange={(e) => setFormData({ ...formData, toCurrency: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      {COMMON_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">{t('exchangeRate')}</label>
                  <input
                    type="number"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    step="0.0001"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="e.g., 24500"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">{t('source')}</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="e.g., Manual, API, etc."
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveRate}
                    className="flex-1 px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                  >
                    {editingRate ? t('update') : t('save')}
                  </button>
                  {editingRate && (
                    <button
                      onClick={() => {
                        setEditingRate(null);
                        setFormData({
                          fromCurrency: 'USD',
                          toCurrency: 'VND',
                          rate: '',
                          source: 'Manual'
                        });
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                    >
                      {t('cancel')}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-3">
                <h4 className="text-sm font-semibold mb-2">All Exchange Rates</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {rates.map(rate => {
                    if (!rate || !rate.Id) return null;
                    return (
                      <div key={rate.Id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                        <div className="flex-1">
                          <span className="font-semibold">{rate.FromCurrency || 'N/A'}</span>
                          <span className="mx-2">→</span>
                          <span className="font-semibold">{rate.ToCurrency || 'N/A'}</span>
                          <span className="ml-2 text-gray-600">
                            {rate.Rate !== undefined && rate.Rate !== null && typeof rate.Rate === 'number' 
                              ? rate.Rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                              : 'N/A'}
                          </span>
                          {rate.Source && (
                            <span className="ml-2 text-xs text-gray-500">({rate.Source})</span>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditRate(rate)}
                            className="p-1 text-primary-600 hover:bg-primary-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteRate(rate.Id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                  {rates.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-4">
                      No exchange rates. Add one above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Convert Buttons */}
      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Convert</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { from: 'USD', to: 'VND', amount: 100 },
            { from: 'VND', to: 'USD', amount: 1000000 },
            { from: 'USD', to: 'EUR', amount: 100 },
            { from: 'EUR', to: 'USD', amount: 100 },
          ].map((quick, index) => (
            <button
              key={index}
              onClick={() => {
                setAmount(quick.amount.toString());
                setFromCurrency(quick.from);
                setToCurrency(quick.to);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              {quick.amount.toLocaleString()} {quick.from} → {quick.to}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

