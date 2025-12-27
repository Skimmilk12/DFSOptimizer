import React, { useCallback } from 'react';

const FileUpload = ({ label, accept = ".csv", onFileSelect, fileName, status, disabled = false }) => {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    const file = e.dataTransfer?.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      onFileSelect(file);
    }
  }, [onFileSelect, disabled]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="flex-1">
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          block p-4 border-2 border-dashed rounded-lg cursor-pointer
          transition-colors text-center
          ${disabled
            ? 'border-gray-700 bg-gray-800/50 cursor-not-allowed opacity-50'
            : fileName
              ? 'border-green-500 bg-green-900/20 hover:bg-green-900/30'
              : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700/50'
          }
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="font-medium">{label}</span>
        </div>

        {fileName && (
          <div className="mt-2 text-sm text-green-400 flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {fileName}
          </div>
        )}

        {status && (
          <div className="mt-1 text-sm text-gray-400">{status}</div>
        )}
      </label>
    </div>
  );
};

export default FileUpload;
