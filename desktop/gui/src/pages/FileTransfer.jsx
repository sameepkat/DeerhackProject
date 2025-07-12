import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  File, 
  Folder, 
  X, 
  Check, 
  AlertCircle,
  Play,
  Pause,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useDevices } from '../contexts/DeviceContext';
import { useTransfer } from '../contexts/TransferContext';

const FileTransfer = () => {
  const { devices, selectedDevice } = useDevices();
  const { transfers, activeTransfers, sendFiles, cancelTransfer, clearCompletedTransfers } = useTransfer();
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [targetDevice, setTargetDevice] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async () => {
    try {
      const files = await window.electronAPI.selectFiles();
      if (files && files.length > 0) {
        setSelectedFiles(prev => [...prev, ...files.map(path => ({ path, name: path.split('/').pop() }))]);
      }
    } catch (error) {
      console.error('Failed to select files:', error);
    }
  };

  const handleFolderSelect = async () => {
    try {
      const folder = await window.electronAPI.selectFolder();
      if (folder) {
        setSelectedFiles(prev => [...prev, { path: folder, name: folder.split('/').pop(), isFolder: true }]);
      }
    } catch (error) {
      console.error('Failed to select folder:', error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).map(file => ({
        path: file.path,
        name: file.name,
        size: file.size
      }));
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendFiles = async () => {
    if (!targetDevice || selectedFiles.length === 0) return;
    
    try {
      await sendFiles(targetDevice.id, selectedFiles.map(f => f.path));
      setSelectedFiles([]);
      setTargetDevice(null);
    } catch (error) {
      console.error('Failed to send files:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTransferStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Play className="w-4 h-4 text-blue-500" />;
      default:
        return <Play className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">File Transfer</h1>
          <p className="text-sm sm:text-base text-gray-600">Send and receive files between devices</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={clearCompletedTransfers}
            className="btn-secondary text-sm"
          >
            Clear History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Send Files */}
        <div className="space-y-4 sm:space-y-6">
          <div className="card p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Send Files</h2>
            
            {/* Device Selection */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Target Device
              </label>
              <select
                value={targetDevice?.id || ''}
                onChange={(e) => {
                  const device = devices.find(d => d.id === e.target.value);
                  setTargetDevice(device);
                }}
                className="input-field text-sm"
              >
                <option value="">Select a device</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} ({device.ip})
                  </option>
                ))}
              </select>
            </div>

            {/* File Selection */}
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Files to Send
              </label>
              
              <div
                className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-xs sm:text-sm text-gray-600 mb-2">Drag and drop files here, or</p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={handleFileSelect}
                    className="btn-primary text-xs sm:text-sm w-full sm:w-auto"
                  >
                    Select Files
                  </button>
                  <button
                    onClick={handleFolderSelect}
                    className="btn-secondary text-xs sm:text-sm w-full sm:w-auto"
                  >
                    Select Folder
                  </button>
                </div>
              </div>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-medium text-gray-700">Selected Files:</h3>
                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        {file.isFolder ? <Folder className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" /> : <File className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />}
                        <span className="text-xs sm:text-sm text-gray-900 truncate">{file.name}</span>
                        {file.size && (
                          <span className="text-xs text-gray-500 flex-shrink-0">({formatFileSize(file.size)})</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500 flex-shrink-0 ml-2"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendFiles}
              disabled={!targetDevice || selectedFiles.length === 0}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Send Files
            </button>
          </div>
        </div>

        {/* Active Transfers */}
        <div className="space-y-4 sm:space-y-6">
          <div className="card p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Active Transfers</h2>
            
            {activeTransfers.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {activeTransfers.map((transfer) => (
                  <div key={transfer.id} className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        Transferring to {devices.find(d => d.id === transfer.deviceId)?.name || 'Unknown'}
                      </span>
                      <button
                        onClick={() => cancelTransfer(transfer.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-1 sm:space-y-2">
                      {transfer.files?.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs sm:text-sm">
                          <File className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                          <span className="text-gray-700 truncate">{file.split('/').pop()}</span>
                        </div>
                      ))}
                    </div>
                    
                    {transfer.progress !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(transfer.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 sm:h-2">
                          <div 
                            className="bg-primary-600 h-1 sm:h-2 rounded-full transition-all duration-300"
                            style={{ width: `${transfer.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-600">No active transfers</p>
                <p className="text-xs sm:text-sm text-gray-500">File transfers will appear here</p>
              </div>
            )}
          </div>

          {/* Transfer History */}
          <div className="card p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Transfer History</h2>
            
            {transfers.length > 0 ? (
              <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-60 overflow-y-auto">
                {transfers.map((transfer) => (
                  <div key={transfer.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      {getTransferStatusIcon(transfer.status)}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {transfer.type === 'sent' ? 'Sent' : 'Received'} files
                        </p>
                        <p className="text-xs text-gray-500">
                          {transfer.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2">
                      {transfer.files?.length || 1} file(s)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <File className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-600">No transfer history</p>
                <p className="text-xs sm:text-sm text-gray-500">Completed transfers will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileTransfer; 