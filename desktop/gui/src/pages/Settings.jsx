import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Wifi, 
  Folder, 
  Bell, 
  Info,
  Download,
  Upload,
  Monitor,
  Smartphone,
  Save,
  RefreshCw
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState(null); // Start with null to indicate loading
  const [appVersion, setAppVersion] = useState('');
  const [localIP, setLocalIP] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });
  const [lastSavedSettings, setLastSavedSettings] = useState(null);

  useEffect(() => {
    const getAppInfo = async () => {
      try {
        const version = await window.electronAPI.getAppVersion();
        setAppVersion(version);
        
        const ip = await window.electronAPI.getLocalIP();
        setLocalIP(ip);
        
        // Load saved settings with defaults
        const savedSettings = await window.electronAPI.getSettings();
        const defaultSettings = {
          autoStart: false,
          minimizeToTray: true,
          notifications: true,
          autoAcceptFiles: false,
          downloadPath: '',
          maxFileSize: 100,
          discoveryTimeout: 30
        };
        
        // Merge saved settings with defaults
        const mergedSettings = { ...defaultSettings, ...savedSettings };
        setSettings(mergedSettings);
        setLastSavedSettings(mergedSettings); // Track the last saved state
      } catch (error) {
        console.error('Failed to get app info:', error);
        // Set default settings if loading fails
        const defaultSettings = {
          autoStart: false,
          minimizeToTray: true,
          notifications: true,
          autoAcceptFiles: false,
          downloadPath: '',
          maxFileSize: 100,
          discoveryTimeout: 30
        };
        setSettings(defaultSettings);
        setLastSavedSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };
    getAppInfo();
  }, []);

  const handleSettingChange = async (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    setSettings(newSettings);
    try {
      const result = await window.electronAPI.saveSettings(newSettings);
      if (result.success) {
        setLastSavedSettings(newSettings);
        setSaveStatus({ type: 'success', message: 'Settings saved' });
      } else {
        throw new Error(result.message || 'Unknown error');
      }
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 2000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Auto-save failed: ' + error.message });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    }
  };

  // Remove the manual save function since we're using auto-save

  const selectDownloadPath = async () => {
    try {
      const path = await window.electronAPI.selectFolder();
      if (path) {
        handleSettingChange('downloadPath', path);
      }
    } catch (error) {
      console.error('Failed to select download path:', error);
    }
  };

  const settingsSections = [
    {
      title: 'General',
      icon: SettingsIcon,
      settings: [
        {
          key: 'autoStart',
          label: 'Start on system startup',
          type: 'toggle',
          description: 'Automatically start the application when your computer boots'
        },
        {
          key: 'minimizeToTray',
          label: 'Minimize to system tray',
          type: 'toggle',
          description: 'Minimize to system tray instead of closing when you click the X button'
        }
      ]
    },
    {
      title: 'Network',
      icon: Wifi,
      settings: [
        {
          key: 'discoveryTimeout',
          label: 'Discovery timeout (seconds)',
          type: 'number',
          min: 10,
          max: 120,
          description: 'How long to wait for device discovery'
        },
        {
          key: 'autoAcceptFiles',
          label: 'Auto-accept file transfers',
          type: 'toggle',
          description: 'Automatically accept incoming file transfers'
        }
      ]
    },
    {
      title: 'File Transfer',
      icon: Upload,
      settings: [
        {
          key: 'downloadPath',
          label: 'Download folder',
          type: 'path',
          description: 'Default folder for received files'
        },
        {
          key: 'maxFileSize',
          label: 'Maximum file size (MB)',
          type: 'number',
          min: 10,
          max: 1000,
          description: 'Maximum file size for transfers'
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          key: 'notifications',
          label: 'Enable notifications',
          type: 'toggle',
          description: 'Show notifications for new messages and file transfers'
        }
      ]
    }
  ];

  const renderSetting = (setting) => {
    switch (setting.type) {
      case 'toggle':
        return (
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings[setting.key]}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
              className="sr-only"
            />
            <div className={`relative w-10 h-5 sm:w-11 sm:h-6 rounded-full transition-colors ${
              settings[setting.key] ? 'bg-primary-600' : 'bg-gray-300'
            }`}>
              <div className={`absolute w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full transition-transform ${
                settings[setting.key] ? 'translate-x-5 sm:translate-x-5' : 'translate-x-0'
              }`} />
            </div>
          </label>
        );
      
      case 'select':
        return (
          <select
            value={settings[setting.key]}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="input-field text-sm"
          >
            {setting.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            min={setting.min}
            max={setting.max}
            value={settings[setting.key]}
            onChange={(e) => handleSettingChange(setting.key, parseInt(e.target.value))}
            className="input-field text-sm"
          />
        );
      
      case 'path':
        return (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="text"
              value={settings[setting.key]}
              readOnly
              className="input-field flex-1 text-sm"
              placeholder="Select download folder"
            />
            <button
              onClick={selectDownloadPath}
              className="btn-secondary text-sm"
            >
              Browse
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Show loading state while settings are being loaded
  if (isLoading || !settings) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600">Configure your application preferences (auto-saved)</p>
        </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span className="text-gray-600">Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600">Configure your application preferences (auto-saved)</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {saveStatus.type && (
            <div className={`px-3 py-2 rounded-lg text-sm ${
              saveStatus.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : saveStatus.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {saveStatus.message}
            </div>
          )}
          {/* Debug button - remove this in production */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={async () => {
                console.log('Current settings:', settings);
                console.log('Last saved settings:', lastSavedSettings);
                console.log('Settings type:', typeof settings);
                console.log('Settings keys:', Object.keys(settings || {}));
                try {
                  const testResult = await window.electronAPI.testSettings();
                  console.log('Test settings result:', testResult);
                } catch (error) {
                  console.error('Test settings failed:', error);
                }
              }}
              className="btn-secondary text-sm"
            >
              Debug
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {settingsSections.map((section) => (
            <div key={section.title} className="card p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <section.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">{section.title}</h2>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {section.settings.map((setting) => (
                  <div key={setting.key} className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-1">
                        {setting.label}
                      </label>
                      <p className="text-xs sm:text-sm text-gray-600">{setting.description}</p>
                    </div>
                    <div className="sm:ml-4">
                      {renderSetting(setting)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* System Information */}
        <div className="space-y-4 sm:space-y-6">
          <div className="card p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">System Info</h2>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Version</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">{appVersion}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Local IP</span>
                <span className="text-xs sm:text-sm font-mono text-gray-900">{localIP}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">Platform</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">
                  {navigator.platform}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">User Agent</span>
                <span className="text-xs sm:text-sm font-mono text-gray-900 truncate">
                  {navigator.userAgent.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <button className="w-full btn-secondary text-xs sm:text-sm">
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Restart Discovery
              </button>
              
              <button className="w-full btn-secondary text-xs sm:text-sm">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Check for Updates
              </button>
              
              <button className="w-full btn-secondary text-xs sm:text-sm">
                <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Reset Connections
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 