import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  ChevronLeft, 
  Loader2,
  Mic,
  Volume2,
  RefreshCcw,
  Heart
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const TherapistScreen: React.FC<{ onBack?: () => void; dashboardData?: any; setActiveTab?: (tab: string) => void; user?: any }> = ({ onBack, dashboardData, setActiveTab }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi there. I'm your AI Budget Buddy. I've taken a look at your dashboard. How are you feeling about your finances today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);

  useEffect(() => {
    const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
    if (apiKey && !aiRef.current) {
      try {
        aiRef.current = new GoogleGenAI({ apiKey });
      } catch (err) {
        console.error("Failed to initialize Gemini AI:", err);
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!aiRef.current) {
        throw new Error('AI service not initialized. Please check your API key.');
      }
      
      const ai = aiRef.current;
      
      // Sanitize dashboardData to remove non-serializable React elements (like icons)
      const sanitizeData = (data: any): any => {
        if (Array.isArray(data)) {
          return data.map(sanitizeData);
        } else if (data !== null && typeof data === 'object') {
          const sanitized: any = {};
          for (const key in data) {
            // Skip React elements or anything that looks like one
            if (key === 'icon' || React.isValidElement(data[key])) {
              continue;
            }
            sanitized[key] = sanitizeData(data[key]);
          }
          return sanitized;
        }
        return data;
      };

      const sanitizedDashboardData = sanitizeData(dashboardData);

      // Prepare system instruction with dashboard data
      const systemInstruction = `You are a warm, empathetic AI Budget Buddy. You have access to the user's full financial dashboard. Your goal is to help them process the emotional side of money. CRITICAL: Analyze their numbers (net worth, goals, emergency fund, savings, budget, bills, subscriptions, loans, credit cards) to provide context-aware support. Keep your responses EXTREMELY short, concise, and to the point (max 1-2 sentences). Always reference specific numbers from their dashboard when relevant to show you are listening. Validate their feelings first, then offer a tiny, actionable nudge based on their specific data. Avoid clinical or corporate language.

Current Financial Dashboard Data:
${JSON.stringify(sanitizedDashboardData, null, 2)}`;

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: systemInstruction,
        },
        history: messages.slice(1).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      });

      const result = await chat.sendMessage(input);
      const text = result.text;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text || "I'm here for you, but I'm having a little trouble thinking right now. Could you say that again?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I hit a little snag. Let's try again in a moment. I'm still here to listen.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-[#FDFCFB] rounded-[32px] overflow-hidden border border-mist-purple/20 shadow-xl">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-mist-purple/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab?.('wallet')}
            className="p-2 bg-white border border-mist-purple rounded-xl text-gray-400 hover:text-clarity-purple transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-soft-lavender rounded-2xl flex items-center justify-center text-clarity-purple shadow-inner">
              <Heart size={20} fill="currentColor" className="opacity-80" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-deep-navy leading-tight">Budget Buddy</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-growth-teal rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Always Listening</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
            <Volume2 size={20} />
          </button>
          <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  message.role === 'user' ? 'bg-clarity-purple text-white' : 'bg-white text-clarity-purple border border-mist-purple/20'
                }`}>
                  {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  message.role === 'user' 
                    ? 'bg-clarity-purple text-white rounded-tr-none' 
                    : 'bg-white text-deep-navy border border-mist-purple/10 rounded-tl-none'
                }`}>
                  {message.content}
                  <div className={`text-[10px] mt-2 opacity-50 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl bg-white border border-mist-purple/20 flex items-center justify-center text-clarity-purple shadow-sm">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-mist-purple/10 p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <Loader2 size={18} className="animate-spin text-clarity-purple" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-mist-purple/10">
        <div className="relative flex items-center gap-3">
          <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-colors">
            <Mic size={20} />
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tell me what's on your mind..."
              className="w-full bg-gray-50 border border-mist-purple/20 rounded-2xl py-3.5 px-5 text-sm focus:ring-2 focus:ring-clarity-purple/20 outline-none transition-all pr-12"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-clarity-purple text-white rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-4 font-medium uppercase tracking-widest">
          Your conversation is private and safe
        </p>
      </div>
    </div>
  );
};
