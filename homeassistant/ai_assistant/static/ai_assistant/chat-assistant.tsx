import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Plus, Search, Menu, X, Copy, Quote, Wifi, ArrowLeft, User, Bot, MoreVertical, Trash2 } from 'lucide-react';

interface Message {
  message_id: string;
  role: 'user' | 'assistant';
  text: string;
  text_format: 'html' | 'text';
  created_at: string;
  metadata?: any;
}

interface Conversation {
  conversation_id: string;
  title: string;
  created_at: string;
}

interface UIButton {
  label: string;
  command?: string;
  assistant_request?: string;
}

interface Card {
  title: string;
  subtitle?: string;
  text: string;
}

interface NavigationCard {
  title: string;
  description?: string;
  buttons: UIButton[];
}

// API Class for handling backend communication
class ChatAPI {
  private baseUrl = '/ai-assistant/api';

  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${this.baseUrl}/conversations/`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async createConversation(): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/conversations/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `Новый чат ${Date.now()}` })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/messages/`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async sendMessage(messageData: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/messages/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  }
}

const ChatAssistant: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const api = useRef(new ChatAPI());

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const convos = await api.current.getConversations();
      setConversations(convos);
    } catch (err: any) {
      setError(`Не удалось загрузить чаты: ${err.message}`);
    }
  };

  const selectConversation = async (conversationId: string) => {
    setCurrentConversation(conversationId);
    setIsSidebarOpen(false);
    
    try {
      const msgs = await api.current.getMessages(conversationId);
      setMessages(msgs);
    } catch (err: any) {
      setError(`Не удалось загрузить сообщения: ${err.message}`);
    }
  };

  const createNewChat = async () => {
    try {
      const newConvo = await api.current.createConversation();
      setConversations(prev => [newConvo, ...prev]);
      setCurrentConversation(newConvo.conversation_id);
      setMessages([]);
      setIsSidebarOpen(false);
    } catch (err: any) {
      setError(`Не удалось создать новый чат: ${err.message}`);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !currentConversation || isLoading) return;

    const userMessage: Message = {
      message_id: `temp-user-${Date.now()}`,
      role: 'user',
      text: inputValue,
      text_format: 'html',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await api.current.sendMessage({
        role: 'user',
        text: inputValue,
        text_format: 'html',
        conversation_id: currentConversation
      });

      const assistantMessage: Message = {
        message_id: result.message_id || `temp-assistant-${Date.now()}`,
        role: 'assistant',
        text: result.text,
        text_format: result.text_format,
        created_at: result.created_at || new Date().toISOString(),
        metadata: result.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(`Не удалось отправить сообщение: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const executeCommand = async (command: string, assistantRequest?: string) => {
    if (!currentConversation) return;

    const messageText = assistantRequest || command;
    setIsLoading(true);

    try {
      const result = await api.current.sendMessage({
        role: 'user',
        text: messageText,
        text_format: 'html',
        conversation_id: currentConversation
      });

      const assistantMessage: Message = {
        message_id: result.message_id || `temp-assistant-${Date.now()}`,
        role: 'assistant',
        text: result.text,
        text_format: result.text_format,
        created_at: result.created_at || new Date().toISOString(),
        metadata: result.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(`Ошибка выполнения команды: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await api.current.deleteConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv.conversation_id !== conversationId));
      
      // Если удаляем текущий чат, сбрасываем выбор
      if (currentConversation === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      
      setDeleteConfirmId(null);
      setOpenMenuId(null);
    } catch (err: any) {
      setError(`Не удалось удалить чат: ${err.message}`);
    }
  };

  const testAPI = async () => {
    try {
      const convos = await api.current.getConversations();
      alert(`✅ API работает! Найдено ${convos.length} чатов.`);
    } catch (err: any) {
      alert(`❌ Ошибка API: ${err.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';
    
    return (
      <div key={message.message_id} className={`mb-6 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
          <div className={`backdrop-blur-lg rounded-3xl p-6 border shadow-2xl relative group ${
            isUser 
              ? 'bg-gradient-to-r from-slate-600 to-slate-700 border-slate-500/30 text-white' 
              : 'bg-white/10 border-white/20 text-white'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {isUser ? (
                <User className="w-5 h-5 opacity-80" />
              ) : (
                <Bot className="w-5 h-5 opacity-80" />
              )}
              <span className="text-sm opacity-70">
                {isUser ? 'Вы' : 'Archie'}
              </span>
              <span className="text-xs opacity-50 ml-auto">
                {formatTime(message.created_at)}
              </span>
            </div>
            
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: message.text }}
            />
            
            <button
              onClick={() => copyToClipboard(message.text)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          
          {/* Render metadata cards */}
          {message.metadata && renderMetadata(message.metadata)}
        </div>
      </div>
    );
  };

  const renderMetadata = (metadata: any) => {
    if (!metadata) return null;

    return (
      <div className="mt-4 space-y-4">
        {/* UI Buttons */}
        {metadata.ui_elements?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {metadata.ui_elements.map((button: UIButton, index: number) => (
              <button
                key={index}
                onClick={() => executeCommand(button.command || button.label, button.assistant_request)}
                className="px-4 py-2 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {button.label}
              </button>
            ))}
          </div>
        )}

        {/* Cards */}
        {metadata.cards?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metadata.cards.map((card: Card, index: number) => (
              <div
                key={index}
                className="backdrop-blur-lg bg-white/10 rounded-2xl p-4 border border-white/20 shadow-xl hover:shadow-slate-500/30 transition-all duration-300 hover:scale-105"
              >
                <h3 className="font-semibold text-white mb-2">{card.title}</h3>
                {card.subtitle && (
                  <p className="text-sm text-white/70 mb-2">{card.subtitle}</p>
                )}
                <div 
                  className="text-white/80 text-sm"
                  dangerouslySetInnerHTML={{ __html: card.text }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Navigation Card */}
        {metadata.navigation_card && (
          <div className="backdrop-blur-lg bg-amber-600/20 rounded-2xl p-4 border border-amber-600/30">
            <h3 className="font-semibold text-amber-200 mb-2">
              {metadata.navigation_card.title}
            </h3>
            {metadata.navigation_card.description && (
              <p className="text-white/80 mb-3">{metadata.navigation_card.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {metadata.navigation_card.buttons?.map((button: UIButton, index: number) => (
                <button
                  key={index}
                  onClick={() => executeCommand(button.command || button.label, button.assistant_request)}
                  className="px-3 py-2 rounded-full backdrop-blur-md bg-amber-600/20 border border-amber-600/30 text-amber-200 hover:bg-amber-600/40 transition-all duration-300 hover:scale-105"
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-neutral-950 flex flex-col">
      {/* Header */}
      <header className="backdrop-blur-md bg-white/10 border-b border-white/20 p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 transition-all duration-300 hover:scale-110 shadow-lg active:scale-95"
            >
              <Menu className="text-white" size={20} />
            </button>
            <h1 className="text-2xl font-bold text-white">Archie AI</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={testAPI}
              className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Wifi size={16} />
              Тест API
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Главная
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:relative md:inset-auto">
            <div className="w-80 backdrop-blur-md bg-white/10 border-r border-white/20 shadow-2xl flex flex-col">
              <div className="p-4 border-b border-white/20">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Чаты</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all md:hidden"
                  >
                    <X className="text-white" size={20} />
                  </button>
                </div>
                
                <button
                  onClick={createNewChat}
                  className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Новый чат
                </button>
                
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-white/60" size={20} />
                  <input
                    type="text"
                    placeholder="Поиск по чатам..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.conversation_id}
                    className={`relative w-full mb-2 rounded-2xl transition-all duration-300 hover:scale-105 ${
                      currentConversation === conversation.conversation_id
                        ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white'
                    }`}
                  >
                    <button
                      onClick={() => selectConversation(conversation.conversation_id)}
                      className="w-full p-4 text-left rounded-2xl"
                    >
                      <div className="font-medium truncate pr-10">{conversation.title}</div>
                      <div className="text-sm opacity-60 mt-1">
                        {new Date(conversation.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </button>
                    
                    {/* Меню из трех точек */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === conversation.conversation_id ? null : conversation.conversation_id);
                        }}
                        className="p-1 rounded-full hover:bg-white/20 transition-all"
                      >
                        <MoreVertical className="text-white/60 hover:text-white" size={16} />
                      </button>
                      
                      {/* Dropdown меню */}
                      {openMenuId === conversation.conversation_id && (
                        <div className="absolute right-0 top-8 z-50 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg shadow-xl min-w-[120px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(conversation.conversation_id);
                            }}
                            className="w-full px-4 py-2 text-left text-red-300 hover:bg-red-600/20 rounded-lg transition-all flex items-center gap-2"
                          >
                            <Trash2 size={14} />
                            Удалить
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div
              className="flex-1 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentConversation ? (
            <>
              <div className="flex-1 overflow-y-auto p-6">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-white/60">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg">Начните разговор с Archie</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {messages.map(renderMessage)}
                    {isLoading && (
                      <div className="flex justify-start mb-6">
                        <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-6 border border-white/20">
                          <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5 opacity-80" />
                            <span className="text-sm opacity-70">Archie печатает</span>
                          </div>
                          <div className="flex gap-1 mt-3">
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Input Area */}
              <div className="p-4 border-t border-white/20 backdrop-blur-md bg-white/5">
                <div className="flex gap-3 max-w-4xl mx-auto">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Напишите сообщение..."
                      disabled={isLoading}
                      className="w-full px-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
                    />
                  </div>
                  
                  <button
                    onClick={() => {/* Quote functionality */}}
                    disabled={!currentConversation}
                    className="p-4 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:opacity-50 text-white transition-all duration-300 hover:scale-110 active:scale-95"
                  >
                    <Quote size={20} />
                  </button>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isLoading || !currentConversation}
                    className="p-4 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 disabled:from-slate-700 disabled:to-slate-800 disabled:opacity-50 text-white transition-all duration-300 hover:scale-110 active:scale-95"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white/60">
                <MessageCircle className="w-20 h-20 mx-auto mb-6 opacity-30" />
                <h2 className="text-2xl font-bold mb-2">Добро пожаловать в Archie</h2>
                <p className="text-lg mb-6">Выберите чат или создайте новый для начала разговора</p>
                <button
                  onClick={createNewChat}
                  className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 flex items-center gap-2 mx-auto"
                >
                  <Plus size={20} />
                  Создать новый чат
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно подтверждения удаления */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Удалить чат?</h3>
              <p className="text-white/70 mb-6">
                Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirmId(null);
                    setOpenMenuId(null);
                  }}
                  className="flex-1 py-3 px-6 backdrop-blur-md bg-white/10 border border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Отмена
                </button>
                <button
                  onClick={() => deleteConversation(deleteConfirmId)}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full font-semibold hover:from-red-500 hover:to-red-600 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-3 text-white/80 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;
