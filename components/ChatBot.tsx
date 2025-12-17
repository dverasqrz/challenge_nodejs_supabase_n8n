'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatBotProps {
  userIdentifier: string
  onTaskCreated?: () => void
}

interface ChatResponse {
  reply: string
  taskCreated: boolean
  enhanced_title?: string | null
  steps?: string[] | null
  error?: string
}

export default function ChatBot({ userIdentifier, onTaskCreated }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I can help you create tasks. Use #to-do list in your message to create a task. For example: "I need to #to-do list buy groceries"',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading || !userIdentifier.trim()) {
      return
    }

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          user_identifier: userIdentifier,
        }),
      })

      const data: ChatResponse = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply || 'Sorry, I encountered an error.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // If task was created, handle it
      if (data.taskCreated && data.enhanced_title) {
        await createTaskFromChat(data.enhanced_title, data.steps)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const createTaskFromChat = async (title: string, steps?: string[] | null) => {
    try {
      const description = steps && steps.length > 0 ? steps.join('\n') : null

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_identifier: userIdentifier,
          title,
          description,
          completed: false,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      // Notify parent to refresh task list
      if (onTaskCreated) {
        onTaskCreated()
      }
    } catch (error) {
      console.error('Error creating task from chat:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Task was processed, but I had trouble saving it. Please check your task list.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isDisabled = !userIdentifier.trim() || isLoading

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Chat Assistant</h2>
      
      {!userIdentifier.trim() && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
          Please enter a user identifier above to use the chat.
        </div>
      )}

      {/* Messages */}
      <div className="mb-4 h-64 overflow-y-auto border border-gray-200 rounded-md p-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left mb-4">
            <div className="inline-block bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            isDisabled
              ? 'Enter a user identifier above to chat'
              : 'Type your message... (Use #to-do list to create a task)'
          }
          disabled={isDisabled}
          rows={2}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={isDisabled || !input.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )
}

