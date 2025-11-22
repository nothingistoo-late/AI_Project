import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tax Calculator API
export const calculateTax = async (data) => {
  const response = await api.post('/TaxCalculator/calculate', data);
  return response.data;
};

export const compareTaxSystems = async (data) => {
  const response = await api.post('/TaxCalculator/compare', data);
  return response.data;
};

// Tax Config API
export const getAllTaxConfigs = async () => {
  const response = await api.get('/TaxConfig');
  return response.data;
};

export const getTaxConfigById = async (id) => {
  const response = await api.get(`/TaxConfig/${id}`);
  return response.data;
};

export const getDefaultTaxConfig = async () => {
  const response = await api.get('/TaxConfig/default');
  return response.data;
};

export const getTaxConfigsByCountry = async (countryCode) => {
  const response = await api.get(`/TaxConfig/country/${countryCode}`);
  return response.data;
};

export const createTaxConfig = async (data) => {
  const response = await api.post('/TaxConfig', data);
  return response.data;
};

export const updateTaxConfig = async (id, data) => {
  const response = await api.put(`/TaxConfig/${id}`, data);
  return response.data;
};

export const deleteTaxConfig = async (id) => {
  await api.delete(`/TaxConfig/${id}`);
};

export const setDefaultTaxConfig = async (id) => {
  const response = await api.post(`/TaxConfig/${id}/set-default`);
  return response.data;
};

// Preset API
export const getAllPresets = async () => {
  const response = await api.get('/Preset');
  return response.data;
};

export const getPresetById = async (id) => {
  const response = await api.get(`/Preset/${id}`);
  return response.data;
};

export const getPresetsByConfigId = async (taxConfigId) => {
  const response = await api.get(`/Preset/config/${taxConfigId}`);
  return response.data;
};

export const createPreset = async (data) => {
  const response = await api.post('/Preset', data);
  return response.data;
};

export const updatePreset = async (id, data) => {
  const response = await api.put(`/Preset/${id}`, data);
  return response.data;
};

export const deletePreset = async (id) => {
  await api.delete(`/Preset/${id}`);
};

// Exchange Rate API
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  const response = await api.post('/ExchangeRate/convert', {
    amount,
    fromCurrency,
    toCurrency,
  });
  return response.data;
};

export const getAllExchangeRates = async () => {
  const response = await api.get('/ExchangeRate');
  return response.data;
};

export const getExchangeRatesByBase = async (baseCurrency) => {
  const response = await api.get(`/ExchangeRate/base/${baseCurrency}`);
  return response.data;
};

export const getExchangeRate = async (fromCurrency, toCurrency) => {
  const response = await api.get(`/ExchangeRate/${fromCurrency}/${toCurrency}`);
  return response.data;
};

export const createOrUpdateExchangeRate = async (data) => {
  const response = await api.post('/ExchangeRate', data);
  return response.data;
};

export const refreshExchangeRates = async () => {
  const response = await api.post('/ExchangeRate/refresh');
  return response.data;
};

export const deleteExchangeRate = async (id) => {
  await api.delete(`/ExchangeRate/${id}`);
};

export default api;

