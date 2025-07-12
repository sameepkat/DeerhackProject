import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageSquare, 
  Smartphone, 
  User, 
  Clock,
  Copy,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { useDevices } from '../contexts/DeviceContext';

const Messages = () => {
  const { devices, selectedDevice } = useDevices();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [targetDevice, setTargetDevice] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Listen for incoming messages
    const handleMessageReceived = (event, message) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: message.text,
        sender: message.sender,
        timestamp: new Date(),
        type: 'received'
      }]);
    };

    window.electronAPI.onMessageReceived(handleMessageReceived);

    return () => {
      window.electronAPI.removeAllListeners('message-received');
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !targetDevice) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'You',
      timestamp: new Date(),
      type: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    try {
      await window.electronAPI.sendMessage(targetDevice.id, newMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const deleteMessage = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === new Date(today.getTime() - 24*60*60*1000).toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm sm:text-base text-gray-600">Send and receive messages between devices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Device Selection */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Select Device</h2>
          
          {devices.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => setTargetDevice(device)}
                  className={`w-full p-2 sm:p-3 rounded-lg border transition-colors ${
                    targetDevice?.id === device.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-3 h-3 sm:w-5 sm:h-5 text-primary-600" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{device.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{device.ip}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <Smartphone className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-600">No devices available</p>
              <p className="text-xs sm:text-sm text-gray-500">Connect to a device to send messages</p>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="lg:col-span-2">
          <div className="card h-[400px] sm:h-[500px] lg:h-[600px] flex flex-col">
            {/* Messages Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {targetDevice ? `Chat with ${targetDevice.name}` : 'Select a device to start chatting'}
                </h2>
                {targetDevice && (
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{targetDevice.ip}</p>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {targetDevice ? (
                Object.keys(groupedMessages).length > 0 ? (
                  Object.entries(groupedMessages).map(([date, dayMessages]) => (
                    <div key={date}>
                      <div className="text-center mb-3 sm:mb-4">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {date}
                        </span>
                      </div>
                      
                      {dayMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] sm:max-w-xs lg:max-w-md p-2 sm:p-3 rounded-lg ${
                            message.type === 'sent'
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <div className="flex items-start justify-between space-x-2">
                              <p className="text-xs sm:text-sm break-words">{message.text}</p>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                <button
                                  onClick={() => copyMessage(message.text)}
                                  className="text-xs hover:opacity-80"
                                  title="Copy message"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => deleteMessage(message.id)}
                                  className="text-xs hover:opacity-80"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <p className={`text-xs mt-1 ${
                              message.type === 'sent' ? 'text-primary-100' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-gray-600">No messages yet</p>
                    <p className="text-xs sm:text-sm text-gray-500">Start a conversation with {targetDevice.name}</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-600">Select a device to start chatting</p>
                  <p className="text-xs sm:text-sm text-gray-500">Choose a device from the list to begin messaging</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {targetDevice && (
              <div className="p-3 sm:p-4 border-t border-gray-200">
                <div className="flex items-end space-x-2 sm:space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      rows="2"
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed p-2 sm:p-3"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages; 