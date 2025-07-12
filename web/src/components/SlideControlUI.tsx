import React from 'react';

interface SlideControlUIProps {
  uploadedFiles: File[];
  selectedFileIdx: number | null;
  selectedFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (idx: number) => void;
  onSelectFile: (idx: number) => void;
  onDoubleClickFile: (idx: number) => void;
  onOpenFullScreen: () => void;
}

function formatFileSize(size: number) {
  if (size >= 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
  if (size >= 1024) return (size / 1024).toFixed(2) + ' KB';
  return size + ' B';
}

function getFileIcon(fileName: string) {
  const ext = fileName.toLowerCase().split('.').pop();
  switch (ext) {
    case 'pdf':
      return '📄';
    case 'pptx':
    case 'ppt':
      return '📊';
    default:
      return '📁';
  }
}

export default function SlideControlUI({
  uploadedFiles,
  selectedFileIdx,
  selectedFile,
  onFileChange,
  onRemoveFile,
  onSelectFile,
  onDoubleClickFile,
  onOpenFullScreen
}: SlideControlUIProps) {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-gray-800">Slide Control</h1>
      </div>
      
      {/* File Upload Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="text-center space-y-3">
            <div className="text-2xl mb-3">📁</div>
            <h3 className="text-lg font-semibold text-gray-800">Upload Files</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Support: PDF, PPTX, PPT
            </p>
            
            <div className="mt-4">
              <label
                htmlFor="slide-upload"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Choose Files
              </label>
              <input
                id="slide-upload"
                type="file"
                accept=".pdf,.pptx,.ppt"
                multiple
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Files List */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Uploaded Files</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {uploadedFiles.map((file, idx) => (
              <div
                key={idx}
                className={`p-6 transition-colors duration-200 ${
                  selectedFileIdx === idx ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                }`}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => onSelectFile(idx)}
                  onDoubleClick={() => onDoubleClickFile(idx)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getFileIcon(file.name)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{file.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFile(idx);
                      }}
                      className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Selected File Actions */}
      {selectedFile && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="text-3xl">{getFileIcon(selectedFile.name)}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{selectedFile.name}</h3>
                <p className="text-sm text-gray-600">Ready to present</p>
              </div>
            </div>
            
            <button 
              onClick={onOpenFullScreen}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Start Presentation
            </button>
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {uploadedFiles.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No files uploaded yet</h3>
        </div>
      )}
    </div>
  );
} 