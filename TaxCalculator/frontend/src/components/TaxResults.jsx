import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function TaxResults({ result, onExportPDF, onExportCSV }) {
  const { t } = useTranslation();

  if (!result) return null;

  const taxData = [
    { name: t('incomeTax'), value: result.incomeTax },
    { name: t('freelanceTax'), value: result.freelanceTax },
    { name: t('bonusTax'), value: result.bonusTax },
    { name: t('otherIncomeTax'), value: result.otherIncomeTax },
  ].filter(item => item.value > 0);

  const insuranceData = [
    { name: t('socialInsurance'), value: result.socialInsurance },
    { name: t('healthInsurance'), value: result.healthInsurance },
    { name: t('unemploymentInsurance'), value: result.unemploymentInsurance },
  ].filter(item => item.value > 0);

  const breakdownData = result.bracketBreakdown?.map((bracket, index) => ({
    name: `${bracket.rate}%`,
    amount: bracket.taxAmount,
    taxable: bracket.taxableAmount,
  })) || [];

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Tax Calculation Results', 14, 22);
    
    doc.setFontSize(12);
    let y = 30;
    
    doc.text(`Tax System: ${result.taxConfigName}`, 14, y);
    y += 7;
    doc.text(`Currency: ${result.currency}`, 14, y);
    y += 7;
    doc.text(`Calculated At: ${new Date(result.calculatedAt).toLocaleString()}`, 14, y);
    y += 15;

    const tableData = [
      [t('grossIncome'), result.grossIncome.toFixed(2)],
      [t('netIncome'), result.netIncome.toFixed(2)],
      [t('taxableIncome'), result.taxableIncome.toFixed(2)],
      [t('totalTax'), result.totalTax.toFixed(2)],
      [t('totalInsurance'), result.totalInsurance.toFixed(2)],
      [t('totalDeductions'), result.totalDeductions.toFixed(2)],
      [t('incomeTax'), result.incomeTax.toFixed(2)],
      [t('socialInsurance'), result.socialInsurance.toFixed(2)],
      [t('healthInsurance'), result.healthInsurance.toFixed(2)],
      [t('unemploymentInsurance'), result.unemploymentInsurance.toFixed(2)],
      [t('personalDeduction'), result.personalDeduction.toFixed(2)],
      [t('dependentDeduction'), result.dependentDeduction.toFixed(2)],
    ];

    doc.autoTable({
      startY: y,
      head: [['Item', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save('tax-calculation.pdf');
    if (onExportPDF) onExportPDF();
  };

  const handleExportCSV = () => {
    const csv = [
      ['Item', 'Amount'],
      [t('grossIncome'), result.grossIncome.toFixed(2)],
      [t('netIncome'), result.netIncome.toFixed(2)],
      [t('taxableIncome'), result.taxableIncome.toFixed(2)],
      [t('totalTax'), result.totalTax.toFixed(2)],
      [t('totalInsurance'), result.totalInsurance.toFixed(2)],
      [t('totalDeductions'), result.totalDeductions.toFixed(2)],
      [t('incomeTax'), result.incomeTax.toFixed(2)],
      [t('socialInsurance'), result.socialInsurance.toFixed(2)],
      [t('healthInsurance'), result.healthInsurance.toFixed(2)],
      [t('unemploymentInsurance'), result.unemploymentInsurance.toFixed(2)],
      [t('personalDeduction'), result.personalDeduction.toFixed(2)],
      [t('dependentDeduction'), result.dependentDeduction.toFixed(2)],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tax-calculation.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    if (onExportCSV) onExportCSV();
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t('results')}</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            {t('exportPDF')}
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('exportCSV')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">{t('grossIncome')}</div>
          <div className="text-2xl font-bold text-blue-600">
            {result.currency} {result.grossIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">{t('netIncome')}</div>
          <div className="text-2xl font-bold text-green-600">
            {result.currency} {result.netIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">{t('totalTax')}</div>
          <div className="text-2xl font-bold text-red-600">
            {result.currency} {result.totalTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('taxBreakdown')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taxData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {taxData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">{t('insuranceBreakdown')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={insuranceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {insuranceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {breakdownData.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Tax Bracket Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={breakdownData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#3b82f6" name="Tax Amount" />
              <Bar dataKey="taxable" fill="#10b981" name="Taxable Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">{t('taxBreakdown')}</h3>
          <div className="space-y-2">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>{t('taxableIncome')}</span>
              <span className="font-semibold">{result.currency} {result.taxableIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>{t('incomeTax')}</span>
              <span className="font-semibold">{result.currency} {result.incomeTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>{t('freelanceTax')}</span>
              <span className="font-semibold">{result.currency} {result.freelanceTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>{t('bonusTax')}</span>
              <span className="font-semibold">{result.currency} {result.bonusTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>{t('otherIncomeTax')}</span>
              <span className="font-semibold">{result.currency} {result.otherIncomeTax.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">{t('insuranceBreakdown')}</h3>
          <div className="space-y-2">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>{t('socialInsurance')}</span>
              <span className="font-semibold">{result.currency} {result.socialInsurance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>{t('healthInsurance')}</span>
              <span className="font-semibold">{result.currency} {result.healthInsurance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>{t('unemploymentInsurance')}</span>
              <span className="font-semibold">{result.currency} {result.unemploymentInsurance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>{t('personalDeduction')}</span>
              <span className="font-semibold">{result.currency} {result.personalDeduction.toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>{t('dependentDeduction')}</span>
              <span className="font-semibold">{result.currency} {result.dependentDeduction.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

