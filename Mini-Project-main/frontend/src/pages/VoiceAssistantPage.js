import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  HelpCircle,
  MessageCircle,
  Send,
  Bot,
  User,
  Loader2
} from 'lucide-react';

const VoiceAssistantPage = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m your e-Gram Panchayat AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition and synthesis
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceInput(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }

    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVoiceInput = async (transcript) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: transcript,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(transcript);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // Speak the response if not muted
      if (!isMuted && speechSynthesis) {
        speakText(botResponse);
      }
    }, 1500);
  };

  const generateBotResponse = (input) => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('water') || lowerInput.includes('पानी')) {
      return 'For water connection issues, you can apply online through our portal or visit the Water Supply Department. The application process takes 7-10 working days.';
    } else if (lowerInput.includes('tax') || lowerInput.includes('कर')) {
      return 'Property tax payments can be made online through our portal. The current tax rates and due dates are available on our website.';
    } else if (lowerInput.includes('scheme') || lowerInput.includes('योजना')) {
      return 'We have various government schemes available. You can check the Schemes section on our website for detailed information and eligibility criteria.';
    } else if (lowerInput.includes('complaint') || lowerInput.includes('शिकायत')) {
      return 'You can submit grievances online through our portal. We aim to resolve complaints within 15 working days.';
    } else if (lowerInput.includes('certificate') || lowerInput.includes('प्रमाण पत्र')) {
      return 'For birth and death certificates, you can apply online. Required documents include identity proof and address proof.';
    } else if (lowerInput.includes('road') || lowerInput.includes('सड़क')) {
      return 'For road maintenance issues, please submit a grievance with specific location details. We will address it within 7 working days.';
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('नमस्ते')) {
      return 'Hello! I\'m here to help you with information about our panchayat services. What would you like to know?';
    } else if (lowerInput.includes('help') || lowerInput.includes('मदद')) {
      return 'I can help you with information about water connections, property tax, government schemes, certificates, and grievances. Just ask me anything!';
    } else {
      return 'I understand you\'re asking about "' + input + '". For detailed information, please visit our Services section or contact our support team.';
    }
  };

  const speakText = (text) => {
    if (speechSynthesis && !isMuted) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const handleTextInput = (e) => {
    if (e.key === 'Enter' && currentMessage.trim()) {
      handleVoiceInput(currentMessage);
      setCurrentMessage('');
    }
  };

  const sendMessage = () => {
    if (currentMessage.trim()) {
      handleVoiceInput(currentMessage);
      setCurrentMessage('');
    }
  };

  const quickQuestions = [
    'How to apply for water connection?',
    'Property tax payment process',
    'Available government schemes',
    'Birth certificate application',
    'Road maintenance complaint'
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">e-Gram Panchayat AI</h1>
                  <p className="text-gray-600 dark:text-gray-400">Voice Assistant</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-lg transition-colors ${
                  isMuted 
                    ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Voice Interface */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Voice Assistant</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Tap the microphone to ask a question. Our AI assistant will listen and respond aloud.
            </p>
            
            <div className="flex justify-center mb-6">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`relative flex items-center justify-center h-32 w-32 rounded-full text-white transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 animate-pulse' 
                    : isSpeaking 
                      ? 'bg-green-500' 
                      : 'bg-primary hover:bg-primary/90'
                } ${isListening ? 'mic-glow' : ''}`}
              >
                {isListening ? (
                  <MicOff className="w-12 h-12" />
                ) : isSpeaking ? (
                  <Volume2 className="w-12 h-12" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="font-semibold text-xl text-gray-800 dark:text-gray-200 mb-2">
                {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Tap to Speak'}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Make sure your device audio is on.
              </p>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Questions</h3>
            <div className="flex flex-wrap gap-3">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleVoiceInput(question)}
                  className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-96 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-xs lg:max-w-md ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <div className={`p-2 rounded-full ${
                      message.type === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.type === 'user'
                          ? 'text-primary-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center gap-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Text Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleTextInput}
                  placeholder="Type your question here..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  How to use the Voice Assistant
                </h3>
                <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Click the microphone button and speak your question clearly</li>
                  <li>• You can ask about services, schemes, applications, and grievances</li>
                  <li>• The assistant supports both English and Hindi</li>
                  <li>• Use the mute button to disable voice responses</li>
                  <li>• Type your questions in the chat box if you prefer text</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Powered by Digital India Initiative
          </p>
        </div>
      </footer>

      <style jsx>{`
        .mic-glow {
          box-shadow: 0 0 0 0 rgba(17, 115, 212, 0.7);
          animation: mic-pulse 2s infinite;
        }
        
        @keyframes mic-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(17, 115, 212, 0.7);
          }
          70% {
            box-shadow: 0 0 0 30px rgba(17, 115, 212, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(17, 115, 212, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceAssistantPage;