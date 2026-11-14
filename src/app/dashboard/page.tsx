'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, MessageSquare, CheckCircle, Clock, AlertCircle, Shield, ChevronRight, Loader2, Send, Paperclip, MoreHorizontal, Search } from 'lucide-react'

interface TicketMessage {
  id: string
  content: string
  role: 'CUSTOMER' | 'ADMIN'
  createdAt: string
  sender: { username: string; role: string }
}

interface Ticket {
  id: string
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  category: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  lastMessage?: string
  lastMessageTime?: string
  messages?: TicketMessage[]
}

const CATEGORIES = ['General', 'Web Development', 'App Development', 'Game Development', 'Minecraft Server', 'Minecraft Plugin', 'Minecraft Mod', 'Resource Pack', 'Shader Pack', 'Cloud Solutions', 'Other']
const PRIORITIES: ('LOW' | 'MEDIUM' | 'HIGH' | 'URGENT')[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'profile'>(() => {
    const tab = searchParams.get('tab')
    if (tab === 'tickets' || tab === 'profile') return tab
    return 'overview'
  })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])

  // Chat state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null>
  const chatListRef = useRef<HTMLDivElement>(null)

  // Ticket form state
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [ticketTitle, setTicketTitle] = useState('')
  const [ticketDesc, setTicketDesc] = useState('')
  const [ticketCat, setTicketCat] = useState('General')
  const [ticketPri, setTicketPri] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      if (data.user) setUser(data.user)
      else router.push('/auth/login')
    } catch {
      router.push('/auth/login')
    }
  }, [router])

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch('/api/tickets')
      const data = await res.json()
      setTickets(Array.isArray(data) ? data : (data?.tickets ?? []))
    } catch {}
  }, [])

  useEffect(() => { fetchSession() }, [fetchSession])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        const [st, tk] = await Promise.all([
          fetch('/api/admin/stats').then(r => r.json()).catch(() => null),
          fetch('/api/tickets').then(r => r.json()).then(d => Array.isArray(d) ? d : (d?.tickets ?? [])).catch(() => []),
        ])
        setStats(st)
        setTickets(tk)
      } finally { setLoading(false) }
    })()
  }, [user])

  const loadTicketChat = useCallback(async (ticketId: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}/messages`)
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setMessages(data.messages ?? [])
      setSelectedTicketId(ticketId)
    } catch {}
  }, [])

  useEffect(() => {
    if (activeTab === 'tickets' && selectedTicketId) {
      loadTicketChat(selectedTicketId)
    }
  }, [activeTab, selectedTicketId, loadTicketChat])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || sending || !selectedTicketId) return
    setSending(true)
    try {
      const res = await fetch(`/api/tickets/${selectedTicketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageInput.trim() }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setMessages(prev => [...prev, data.message])
      setMessageInput('')
      scrollToBottom()
      fetchTickets()
    } catch {} finally { setSending(false) }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    if (!ticketTitle.trim()) { setCreateError('Title is required'); return }
    if (!ticketDesc.trim()) { setCreateError('Description is required'); return }
    setCreating(true)
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: ticketTitle, description: ticketDesc, category: ticketCat, priority: ticketPri }),
      })
      if (!res.ok) throw new Error('Failed')
      const ticket = await res.json()
      setTickets(prev => [ticket.ticket, ...prev])
      setShowNewTicket(false)
      setTicketTitle('')
      setTicketDesc('')
      setTicketCat('General')
      setTicketPri('MEDIUM')
      loadTicketChat(ticket.ticket.id)
    } catch {
      setCreateError('Could not create ticket. Try again.')
    } finally { setCreating(false) }
  }

  const updateTicketStatus = async (id: string, status: Ticket['status']) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t))
        if (selectedTicketId === id) loadTicketChat(id)
      }
    } catch {}
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMsg('')
    setSavingProfile(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: profileName, email: profileEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setProfileMsg('Profile updated successfully')
      setEditingProfile(false)
      fetchSession()
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update')
    } finally { setSavingProfile(false) }
  }

  const statsFromDb = stats ?? { services: [], projects: [], users: [], settings: {} }
  const serviceCount = statsFromDb.services?.length ?? 0
  const projectCount = statsFromDb.projects?.filter((p: any) => p.featured).length ?? 0
  const openTicketCount = tickets.filter(t => t.status === 'OPEN').length
  const resolvedTicketCount = tickets.filter(t => t.status === 'RESOLVED').length

  const filteredTickets = tickets.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statusColor = (s: string) => {
    switch (s) {
      case 'OPEN': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'IN_PROGRESS': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'RESOLVED': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'CLOSED': return 'text-neutral-500 bg-neutral-800 border-neutral-700'
      default: return 'text-neutral-400 bg-neutral-800'
    }
  }

  const priorityColor = (p: string) => {
    switch (p) {
      case 'URGENT': return 'text-red-400'
      case 'HIGH': return 'text-orange-400'
      case 'MEDIUM': return 'text-yellow-400'
      case 'LOW': return 'text-neutral-500'
      default: return 'text-neutral-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertCircle size={16} className="text-blue-400 shrink-0" />
      case 'IN_PROGRESS': return <Clock size={16} className="text-yellow-400 shrink-0" />
      case 'RESOLVED': return <CheckCircle size={16} className="text-green-400 shrink-0" />
      default: return <CheckCircle size={16} className="text-neutral-500 shrink-0" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="animate-spin text-neutral-600" size={24} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-[1400px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="section-label mb-2">Dashboard</p>
            <h1 className="text-2xl font-semibold text-white">Welcome back, {user?.username}</h1>
          </div>
          <button
            onClick={() => { setShowNewTicket(true); setActiveTab('tickets') }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={14} />
            New Ticket
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 mb-8 -mx-6 px-6">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'tickets', label: 'Tickets' },
            { key: 'profile', label: 'Profile' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key as any); router.replace(`?tab=${tab.key}`) }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-400 text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4">
                <p className="text-2xl font-semibold text-white">{serviceCount}</p>
                <p className="text-sm text-neutral-500">Services</p>
              </div>
              <div className="card p-4">
                <p className="text-2xl font-semibold text-white">{projectCount}</p>
                <p className="text-sm text-neutral-500">Featured Projects</p>
              </div>
              <div className="card p-4">
                <p className="text-2xl font-semibold text-blue-400">{openTicketCount}</p>
                <p className="text-sm text-neutral-500">Open Tickets</p>
              </div>
              <div className="card p-4">
                <p className="text-2xl font-semibold text-green-400">{resolvedTicketCount}</p>
                <p className="text-sm text-neutral-500">Resolved</p>
              </div>
            </div>

            {tickets.length > 0 && (
              <div className="card">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <h2 className="font-medium text-white">Your Tickets</h2>
                  <button onClick={() => { setActiveTab('tickets'); router.replace('?tab=tickets') }} className="text-sm text-blue-400 hover:underline flex items-center gap-1">
                    View all <ChevronRight size={14} />
                  </button>
                </div>
                <div className="divide-y divide-white/5">
                  {tickets.slice(0, 5).map(ticket => (
                    <div key={ticket.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`px-2 py-0.5 rounded text-xs border ${statusColor(ticket.status)}`}>{ticket.status}</span>
                        <span className={`text-xs font-medium ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
                        <p className="text-sm text-neutral-300 truncate">{ticket.title}</p>
                      </div>
                      <p className="text-xs text-neutral-600 shrink-0 ml-4">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Link href="/services" className="btn-primary">Browse Services</Link>
              <Link href="/contact" className="btn-secondary">Request a Project</Link>
            </div>
          </div>
        )}

        {/* Tickets Tab — Chat Interface */}
        {activeTab === 'tickets' && (
          <div className="flex gap-4 h-[calc(100vh-220px)]" style={{ minHeight: '500px' }}>
            {/* Left: Ticket List */}
            <div className="w-80 shrink-0 flex flex-col card">
              <div className="p-4 border-b border-white/5">
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search tickets..."
                    className="input-field w-full pl-9 text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowNewTicket(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={14} />
                  New Ticket
                </button>
              </div>

              <div ref={chatListRef} className="flex-1 overflow-y-auto space-y-1 p-2">
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    <MessageSquare className="mx-auto mb-2 opacity-30" size={24} />
                    No tickets yet
                  </div>
                ) : filteredTickets.map(ticket => (
                  <button
                    key={ticket.id}
                    onClick={() => loadTicketChat(ticket.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTicketId === ticket.id
                        ? 'bg-blue-500/10 border border-blue-500/20'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-white truncate flex-1">{ticket.title}</p>
                      <span className={`px-1.5 py-0.5 rounded text-xs border shrink-0 ${statusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>{ticket.category}</span>
                      <span>&middot;</span>
                      <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Chat Area */}
            <div className="flex-1 flex flex-col card">
              {!selectedTicketId ? (
                <div className="flex-1 flex items-center justify-center text-neutral-500">
                  <div className="text-center">
                    <MessageSquare className="mx-auto mb-3 opacity-30" size={40} />
                    <p className="text-sm">Select a ticket to start chatting</p>
                  </div>
                </div>
              ) : (() => {
                const selected = tickets.find(t => t.id === selectedTicketId)
                if (!selected) return null
                return (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        {getStatusIcon(selected.status)}
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{selected.title}</p>
                          <p className="text-xs text-neutral-500">{selected.category} &middot; <span className={priorityColor(selected.priority)}>{selected.priority}</span> &middot; Updated {new Date(selected.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={selected.status}
                          onChange={e => updateTicketStatus(selected.id, e.target.value as Ticket['status'])}
                          className="text-xs bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-neutral-400 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-neutral-500 py-12">
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${msg.role === 'CUSTOMER' ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            msg.role === 'CUSTOMER'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            <span className="text-xs font-medium">{msg.sender.username[0].toUpperCase()}</span>
                          </div>
                          <div className={`flex-1 max-w-xl ${msg.role === 'CUSTOMER' ? '' : 'flex justify-end'}`}>
                            <div className={`inline-block p-3 rounded-2xl ${
                              msg.role === 'CUSTOMER'
                                ? 'bg-neutral-900 border border-white/10 rounded-tl-none'
                                : 'bg-blue-500/10 border border-blue-500/20 rounded-tr-none'
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-white">{msg.sender.username}</span>
                                {msg.role === 'ADMIN' && (
                                  <span className="px-1.5 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400 text-[10px]">Staff</span>
                                )}
                                <span className="text-xs text-neutral-600">
                                  {new Date(msg.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-neutral-300 whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/5">
                      <form onSubmit={sendMessage} className="flex gap-3">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={e => setMessageInput(e.target.value)}
                          placeholder={selected.status === 'CLOSED' ? "Ticket is closed" : "Type your message..."}
                          disabled={selected.status === 'CLOSED' || sending}
                          className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none disabled:opacity-50 text-sm"
                        />
                        <button
                          type="submit"
                          disabled={!messageInput.trim() || sending || selected.status === 'CLOSED'}
                          className="btn-primary disabled:opacity-50 flex items-center gap-2 px-4"
                        >
                          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          Send
                        </button>
                      </form>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-lg">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-medium text-white">Profile Information</h2>
                {!editingProfile && (
                  <button onClick={() => { setEditingProfile(true); setProfileName(user?.username ?? ''); setProfileEmail(user?.email ?? '') }} className="text-sm text-blue-400 hover:underline">
                    Edit
                  </button>
                )}
              </div>

              {profileMsg && (
                <div className={`mb-4 px-4 py-2 rounded text-sm ${profileMsg.includes('successfully') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {profileMsg}
                </div>
              )}

              {editingProfile ? (
                <form onSubmit={saveProfile} className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-400 mb-1 block">Username</label>
                    <input value={profileName} onChange={e => setProfileName(e.target.value)} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 mb-1 block">Email</label>
                    <input value={profileEmail} onChange={e => setProfileEmail(e.target.value)} type="email" className="input-field w-full" />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => { setEditingProfile(false); setProfileMsg('') }} className="btn-secondary">Cancel</button>
                    <button type="submit" disabled={savingProfile} className="btn-primary flex items-center gap-2">
                      {savingProfile && <Loader2 size={14} className="animate-spin" />}
                      Save changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Username</span>
                    <span className="text-white">{user?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Email</span>
                    <span className="text-white">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Role</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${user?.role === 'ADMIN' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-neutral-700 text-neutral-400'}`}>
                      {user?.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Member since</span>
                    <span className="text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>

            {user?.role === 'ADMIN' && (
              <div className="card p-5 border-yellow-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="text-yellow-400" size={18} />
                  <h2 className="font-medium text-white">Admin Access</h2>
                </div>
                <p className="text-sm text-neutral-500 mb-4">You have administrator privileges. Manage services, projects, and site settings.</p>
                <Link href="/admin" className="btn-secondary border-yellow-500/30 text-yellow-400 hover:border-yellow-500/50 inline-flex">
                  Go to Admin Panel
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-medium text-white">Create New Ticket</h3>
              <button onClick={() => setShowNewTicket(false)} className="text-neutral-500 hover:text-white transition-colors">&times;</button>
            </div>
            {createError && <p className="text-sm text-red-400 mb-3">{createError}</p>}
            <form onSubmit={createTicket} className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400 mb-1 block">Title</label>
                <input
                  value={ticketTitle}
                  onChange={e => setTicketTitle(e.target.value)}
                  placeholder="Brief description of your issue"
                  className="input-field w-full"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-400 mb-1 block">Category</label>
                  <select value={ticketCat} onChange={e => setTicketCat(e.target.value)} className="input-field w-full">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-neutral-400 mb-1 block">Priority</label>
                  <select value={ticketPri} onChange={e => setTicketPri(e.target.value as any)} className="input-field w-full">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-1 block">Description</label>
                <textarea
                  value={ticketDesc}
                  onChange={e => setTicketDesc(e.target.value)}
                  rows={4}
                  placeholder="Describe your issue or request in detail..."
                  className="input-field w-full resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowNewTicket(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2">
                  {creating && <Loader2 size={14} className="animate-spin" />}
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
