import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
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
    if (isMuted || volume === 0) return VolumeX;
    if (volume < 0.3) return VolumeX;
    if (volume < 0.7) return Volume2;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Multimedia Hub
          </h1>
          <p className="text-gray-600 text-lg">Control your system's audio, video, and display settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Volume Control Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Audio Control</h3>
                    <p className="text-sm text-gray-500">System volume & microphone</p>
                  </div>
                </div>
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded-xl ${
                    isMuted 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <VolumeIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">Volume</span>
                  <span className="text-sm font-bold text-gray-800">{Math.round(volume * 100)}%</span>
                </div>
                <div className="relative">
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg"
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                  <div className="absolute inset-0 flex justify-between px-1">
                    {[...Array(11)].map((_, i) => (
                      <div key={i} className="w-0.5 h-4 bg-white/40 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Volume Controls */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handleVolumeDown}
                  className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg"
                >
                  <VolumeX className="w-6 h-6 text-gray-600" />
                </button>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Speaker className="w-8 h-8 text-white" />
                </div>
                <button
                  onClick={handleVolumeUp}
                  className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg text-white"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>

              {/* Microphone Control */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mic className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-600">Microphone</span>
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
          </div>

          {/* Brightness Control Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl blur-xl opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl">
                    <Sun className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Display Control</h3>
                    <p className="text-sm text-gray-500">Brightness & screen settings</p>
                  </div>
                </div>
                <button
                  onClick={toggleFullscreen}
                  className={`p-2 rounded-xl ${
                    isFullscreen 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isFullscreen ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                </button>
              </div>

              {/* Brightness Slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">Brightness</span>
                  <span className="text-sm font-bold text-gray-800">{Math.round(brightness * 100)}%</span>
                </div>
                <div className="relative">
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg"
                      style={{ width: `${brightness * 100}%` }}
                    />
                  </div>
                  <div className="absolute inset-0 flex justify-between px-1">
                    {[...Array(11)].map((_, i) => (
                      <div key={i} className="w-0.5 h-4 bg-white/40 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Brightness Controls */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handleBrightnessDown}
                  className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg"
                >
                  <SunDim className="w-6 h-6 text-gray-600" />
                </button>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <MonitorUp className="w-8 h-8 text-white" />
                </div>
                <button
                  onClick={handleBrightnessUp}
                  className="p-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg text-white"
                >
                  <Sun className="w-6 h-6" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 rounded-xl bg-gray-100 text-sm font-medium text-gray-700">
                    <RotateCcw className="w-4 h-4 inline mr-2" />
                    Reset
                  </button>
                  <button className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium text-white">
                    <Zap className="w-4 h-4 inline mr-2" />
                    Auto
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Media Control Card */}
          <div className="group relative lg:col-span-2 xl:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-500 rounded-3xl blur-xl opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Media Control</h3>
                    <p className="text-sm text-gray-500">Playback & media settings</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-xl bg-gray-100 text-gray-600"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {/* Current Track */}
              <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{currentTrack}</p>
                    <p className="text-xs text-gray-500">Now Playing</p>
                  </div>
                </div>
              </div>

              {/* Media Controls */}
              <div className="flex items-center justify-center space-x-4">
                <button className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                  <SkipBack className="w-6 h-6 text-gray-600" />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
                <button className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                  <SkipForward className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full" style={{ width: '45%' }} />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>2:34</span>
                  <span>5:42</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Volume2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Volume</p>
                <p className="text-xl font-bold text-gray-800">{Math.round(volume * 100)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Sun className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Screen Brightness</p>
                <p className="text-xl font-bold text-gray-800">{Math.round(brightness * 100)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Music className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Media Status</p>
                <p className="text-xl font-bold text-gray-800">{isPlaying ? 'Playing' : 'Paused'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultimediaControl;
