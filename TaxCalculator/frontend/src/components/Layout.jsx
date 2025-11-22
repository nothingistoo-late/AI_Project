import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calculator, GitCompare, Settings, Bookmark, DollarSign } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const navItems = [
    { path: '/', icon: Calculator, label: t('calculate') },
    { path: '/exchange', icon: DollarSign, label: t('exchange') },
    { path: '/comparison', icon: GitCompare, label: t('comparison') },
    { path: '/config', icon: Settings, label: t('config') },
    { path: '/presets', icon: Bookmark, label: t('presets') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">{t('appName')}</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 text-sm rounded ${i18n.language === 'en' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('vi')}
                className={`px-3 py-1 text-sm rounded ${i18n.language === 'vi' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                VI
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

