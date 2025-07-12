import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Wifi, 
  Folder, 
  Bell, 
  Shield, 
  Info,
  Download,
  Upload,
  Monitor,
  Smartphone,
  Save,
  RefreshCw
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    autoStart: false,
    minimizeToTray: true,
    notifications: true,
    autoAcceptFiles: false,
    downloadPath: '',
    maxFileSize: 100,
    discoveryTimeout: 30,
    theme: 'light',
    language: 'en'
  });

  const [appVersion, setAppVersion] = useState('');
  const [localIP, setLocalIP] = useState('');

  useEffect(() => {
    const getAppInfo = async () => {
      try {
        const version = await window.electronAPI.getAppVersion();
        setAppVersion(version);
        
        const ip = await window.electronAPI.getLocalIP();
        setLocalIP(ip);
      } catch (error) {
        console.error('Failed to get app info:', error);
      }
    };
    getAppInfo();
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      // Save settings logic here
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

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
        },
        {
          key: 'theme',
          label: 'Theme',
          type: 'select',
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' }
          ],
          description: 'Choose your preferred theme'
        },
        {
          key: 'language',
          label: 'Language',
          type: 'select',
          options: [
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
            { value: 'de', label: 'Deutsch' }
          ],
          description: 'Choose your preferred language'
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600">Configure your application preferences</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveSettings}
            className="btn-primary text-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </button>
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

          <div className="card p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Privacy</h2>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <button className="w-full btn-secondary text-xs sm:text-sm">
                Clear Transfer History
              </button>
              
              <button className="w-full btn-secondary text-xs sm:text-sm">
                Clear Message History
              </button>
              
              <button className="w-full btn-secondary text-xs sm:text-sm">
                Reset All Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 