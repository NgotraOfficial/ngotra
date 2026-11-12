'use client'

import { use, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Message {
  id: string
  content: string
  role: 'CUSTOMER' | 'ADMIN'
  createdAt: string
  sender: {
    id: string
    username: string
    role: string
  }
}

interface Ticket {
  id: string
  title: string
  status: string
  priority: string
  category: string
  createdAt: string
  user: {
    username: string
    email: string
  }
  messages: Message[]
}

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchTicket()
    const interval = setInterval(fetchTicket, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [id])

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${id}/messages`)
      if (!res.ok) throw new Error('Failed to load ticket')
      const data = await res.json()
      setTicket(data.ticket)
      setMessages(data.messages)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket')
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const res = await fetch(`/api/tickets/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      const data = await res.json()
      setMessages(prev => [...prev, data.message])
      setNewMessage('')

      // Refresh ticket to get updated status
      fetchTicket()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    )
  }

  if (error && !ticket) {
    return (
      <div className="min-h-screen bg-[#05050a]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-12 border-b border-white/[0.06]">
          <Link href="/tickets" className="text-sm text-neutral-500 hover:text-white transition-colors">
            ← Back to tickets
          </Link>
        </div>
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-12">
          <div className="max-w-2xl mx-auto text-center text-red-400">{error}</div>
        </div>
      </div>
    )
  }

  if (!ticket) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'IN_PROGRESS': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'RESOLVED': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'CLOSED': return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
      default: return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-400'
      case 'HIGH': return 'text-orange-400'
      case 'MEDIUM': return 'text-yellow-400'
      case 'LOW': return 'text-neutral-400'
      default: return 'text-neutral-400'
    }
  }

  return (
    <div className="min-h-screen bg-[#05050a]">
      {/* Header */}
      <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-8 border-b border-white/[0.06]">
        <Link href="/tickets" className="text-sm text-neutral-500 hover:text-white transition-colors inline-block mb-4">
          ← Back to tickets
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-2">{ticket.title}</h1>
            <div className="flex items-center gap-2 flex-wrap text-sm">
              <span className={`px-2 py-0.5 rounded border ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className={`font-medium ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
              <span className="text-neutral-500">{ticket.category}</span>
              <span className="text-neutral-600">
                Created {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-neutral-500 py-12">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'CUSTOMER' ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'CUSTOMER'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-purple-500/20 text-purple-400'
                }`}>
                  <span className="text-sm font-medium">
                    {msg.sender.username[0].toUpperCase()}
                  </span>
                </div>
                <div className={`flex-1 max-w-2xl ${msg.role === 'CUSTOMER' ? '' : 'flex justify-end'}`}>
                  <div className={`inline-block p-4 rounded-2xl ${
                    msg.role === 'CUSTOMER'
                      ? 'bg-neutral-900 border border-white/10 rounded-tl-none'
                      : 'bg-blue-500/10 border border-blue-500/20 rounded-tr-none'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {msg.sender.username}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-neutral-300 whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-6 border-t border-white/[0.06]">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={ticket.status === 'CLOSED' ? "Ticket is closed" : "Type your message..."}
              disabled={ticket.status === 'CLOSED' || sending}
              className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending || ticket.status === 'CLOSED'}
              className="btn-primary disabled:opacity-50 whitespace-nowrap"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}