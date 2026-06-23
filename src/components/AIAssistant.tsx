'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          content: '你好，老板！我是良朋社AI助手，你想了解降本工具，还是线下沙龙？',
          isUser: false,
          timestamp: new Date(),
        }
        setMessages([welcomeMessage])
      }, 300)
    }
  }, [isOpen, messages.length])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInputValue('')

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: '收到您的消息，正在为您处理...',
        isUser: false,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-liangpeng-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-liangpeng-primary-dark transition-all duration-200 hover:scale-110 active:scale-95"
      >
        {isOpen ? (
          <X size={24} className="transition-transform duration-200" />
        ) : (
          <MessageCircle size={24} className="transition-transform duration-200" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-40 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
          <div className="bg-gradient-to-r from-liangpeng-primary to-liangpeng-accent px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">良朋社AI助手</h3>
                <p className="text-white/80 text-xs">在线</p>
              </div>
            </div>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.isUser
                      ? 'bg-liangpeng-primary text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.isUser ? 'text-white/70' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-liangpeng-primary/50 transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="w-10 h-10 bg-liangpeng-primary rounded-full flex items-center justify-center text-white hover:bg-liangpeng-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}