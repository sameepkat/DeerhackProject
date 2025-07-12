import React, { useState } from 'react';
import { 
  Volume2, 
  Volume1, 
  Sun, 
  SunDim, 
  Monitor, 
  MonitorOff,
  Music,
  Mic,
  MicOff,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Zap,
  Settings,
  Speaker,
  MonitorUp
} from 'lucide-react';

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

const MultimediaControl = () => {
  const [volume, setVolume] = useState(0.5);
  const [brightness, setBrightness] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('Unknown Track');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleVolumeDown = () => {
    const newVolume = clamp(volume - 0.1, 0, 1);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    window.electronAPI?.volumeDown?.();
  };

  const handleVolumeUp = () => {
    const newVolume = clamp(volume + 0.1, 0, 1);
    setVolume(newVolume);
    setIsMuted(false);
    window.electronAPI?.volumeUp?.();
  };

  const handleBrightnessDown = () => {
    const newBrightness = clamp(brightness - 0.1, 0, 1);
    setBrightness(newBrightness);
    window.electronAPI?.brightnessDown?.();
  };

  const handleBrightnessUp = () => {
    const newBrightness = clamp(brightness + 0.1, 0, 1);
    setBrightness(newBrightness);
    window.electronAPI?.brightnessUp?.();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    window.electronAPI?.toggleMute?.();
  };

  const toggleMicMute = () => {
    setIsMicMuted(!isMicMuted);
    window.electronAPI?.toggleMicMute?.();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    window.electronAPI?.togglePlayPause?.();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    window.electronAPI?.toggleFullscreen?.();
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return Volume1;
    if (volume < 0.3) return Volume1;
    if (volume < 0.7) return Volume2;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Multimedia Controls</h1>
          <p className="text-sm sm:text-base text-gray-600">Control your system's audio, video, and display settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Volume Control Card */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Audio Control</h3>
                <p className="text-xs sm:text-sm text-gray-600">System volume & microphone</p>
              </div>
            </div>
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg ${
                isMuted 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <VolumeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Volume</span>
              <span className="text-xs sm:text-sm font-bold text-gray-800">{Math.round(volume * 100)}%</span>
            </div>
            <div className="relative">
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${volume * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleVolumeDown}
              className="p-3 sm:p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Volume1 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-lg flex items-center justify-center">
              <Speaker className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <button
              onClick={handleVolumeUp}
              className="p-3 sm:p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
          </div>

          {/* Microphone Control */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4 text-gray-500" />
                <span className="text-xs sm:text-sm font-medium text-gray-600">Microphone</span>
              </div>
              <button
                onClick={toggleMicMute}
                className={`p-2 rounded-lg ${
                  isMicMuted 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-green-100 text-green-600'
                }`}
              >
                {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Brightness Control Card */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Display Control</h3>
                <p className="text-xs sm:text-sm text-gray-600">Brightness & screen settings</p>
              </div>
            </div>
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-lg ${
                isFullscreen 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isFullscreen ? <MonitorOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

          {/* Brightness Slider */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Brightness</span>
              <span className="text-xs sm:text-sm font-bold text-gray-800">{Math.round(brightness * 100)}%</span>
            </div>
            <div className="relative">
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${brightness * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Brightness Controls */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleBrightnessDown}
              className="p-3 sm:p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <SunDim className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-500 rounded-lg flex items-center justify-center">
              <MonitorUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <button
              onClick={handleBrightnessUp}
              className="p-3 sm:p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <button className="p-2 sm:p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium text-gray-700">
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Reset
              </button>
              <button className="p-2 sm:p-3 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors text-xs sm:text-sm font-medium text-blue-700">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                Auto
              </button>
            </div>
          </div>
        </div>

        {/* Media Control Card */}
        <div className="card p-4 sm:p-6 lg:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Media Control</h3>
                <p className="text-xs sm:text-sm text-gray-600">Playback & media settings</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Current Track */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">{currentTrack}</p>
                <p className="text-xs text-gray-600">Now Playing</p>
              </div>
            </div>
          </div>

          {/* Media Controls */}
          <div className="flex items-center justify-center space-x-4">
            <button className="p-3 sm:p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
            <button
              onClick={togglePlayPause}
              className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              ) : (
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-1" />
              )}
            </button>
            <button className="p-3 sm:p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 sm:mt-6">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '45%' }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>2:34</span>
              <span>5:42</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Current Volume</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{Math.round(volume * 100)}%</p>
            </div>
          </div>
        </div>
        <div className="card p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Screen Brightness</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{Math.round(brightness * 100)}%</p>
            </div>
          </div>
        </div>
        <div className="card p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <Music className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Media Status</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{isPlaying ? 'Playing' : 'Paused'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultimediaControl;
