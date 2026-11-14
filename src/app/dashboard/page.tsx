'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, MessageSquare, CheckCircle, Clock, AlertCircle, Shield, ChevronRight, Loader2 } from 'lucide-react'

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

  // Ticket form state
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [ticketTitle, setTicketTitle] = useState('')
  const [ticketDesc, setTicketDesc] = useState('')
  const [ticketCat, setTicketCat] = useState('General')
  const [ticketPri, setTicketPri] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

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
      setTickets(data)
    } catch {}
  }, [])

  useEffect(() => { fetchSession() }, [fetchSession])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        const [st, tk] = await Promise.all([
          fetch('/api/admin/stats').then(r => r.json()).catch(() => null),
          fetch('/api/tickets').then(r => r.json()).catch(() => []),
        ])
        setStats(st)
        setTickets(tk)
      } finally { setLoading(false) }
    })()
  }, [user])

  const openNewTicket = () => {
    setShowNewTicket(true)
    setActiveTab('tickets')
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
      setTickets(prev => [ticket, ...prev])
      setShowNewTicket(false)
      setTicketTitle('')
      setTicketDesc('')
      setTicketCat('General')
      setTicketPri('MEDIUM')
    } catch {
      setCreateError('Could not create ticket. Try again.')
    } finally { setCreating(false) }
  }

  const updateTicketStatus = async (id: string, status: Ticket['status']) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : undefined }),
      })
      if (res.ok) {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status, resolvedAt: t.resolvedAt || status === 'RESOLVED' ? new Date().toISOString() : undefined } : t))
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
            onClick={openNewTicket}
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

            {/* Open Tickets Preview */}
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

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            {showNewTicket && (
              <div className="card p-5">
                <h3 className="font-medium text-white mb-4">Create New Ticket</h3>
                {createError && <p className="text-sm text-red-400 mb-3">{createError}</p>}
                <form onSubmit={createTicket} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                    <div>
                      <label className="text-sm text-neutral-400 mb-1 block">Category</label>
                      <select value={ticketCat} onChange={e => setTicketCat(e.target.value)} className="input-field w-full">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-400 mb-1 block">Priority</label>
                    <div className="flex gap-2">
                      {PRIORITIES.map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setTicketPri(p)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                            ticketPri === p ? `${priorityColor(p)} border-current bg-white/5` : 'text-neutral-500 border-neutral-700 hover:border-neutral-500'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
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
            )}

            {tickets.length === 0 ? (
              <div className="card p-12 text-center">
                <MessageSquare className="mx-auto text-neutral-700 mb-3" size={32} />
                <p className="text-neutral-400 mb-4">No tickets yet</p>
                <button onClick={openNewTicket} className="btn-primary">Create your first ticket</button>
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {ticket.status === 'OPEN' && <AlertCircle size={16} className="text-blue-400 shrink-0" />}
                      {ticket.status === 'IN_PROGRESS' && <Clock size={16} className="text-yellow-400 shrink-0" />}
                      {ticket.status === 'RESOLVED' && <CheckCircle size={16} className="text-green-400 shrink-0" />}
                      {ticket.status === 'CLOSED' && <span className="text-neutral-500 shrink-0"><CheckCircle size={16} /></span>}
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{ticket.title}</p>
                        <p className="text-sm text-neutral-500 mt-0.5">{ticket.category} &middot; {new Date(ticket.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-xs border ${statusColor(ticket.status)}`}>{ticket.status}</span>
                      <span className={`text-xs font-medium ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
                      {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'RESOLVED')}
                          className="ml-2 text-xs text-green-400 hover:text-green-300 underline"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-400 mt-3 line-clamp-2">{ticket.description}</p>
                </div>
              ))
            )}
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
    </div>
  )
}
