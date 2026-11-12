'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Save, CheckCircle, Clock, AlertCircle, MessageSquare, Globe, Cloud, Monitor, Server, Palette, Tag, Download, Package, Upload, Image } from 'lucide-react'

interface Service {
  id: string
  name: string
  slug: string
  icon: string
  description: string
  price?: string
  featured: boolean
  sortOrder: number
}

interface Project {
  id: string
  title: string
  slug: string
  description: string
  tags?: string
  link?: string
  image?: string
  featured: boolean
  sortOrder: number
}

interface User {
  id: string
  username: string
  email: string
  role: string
  createdAt: string
}

interface Ticket {
  id: string
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  category: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  userId: string
  user: { username: string; email: string }
  createdAt: string
}

interface SiteSettings {
  [key: string]: string
}

interface Product {
  id: string
  name: string
  slug: string
  serviceId: string
  serviceName?: string
  description: string
  price?: string
  fileUrl?: string
  featured: boolean
  sortOrder: number
}

type Tab = 'services' | 'projects' | 'tickets' | 'users' | 'products' | 'team' | 'plans' | 'settings' | 'content'

const SERVICE_CATEGORIES = ['Web Development', 'Mobile App', 'Desktop App', 'Custom Tools', 'Minecraft Server', 'Minecraft Mod', 'Minecraft Plugin', 'Game Hosting', 'Web Hosting', 'VPS Hosting'] as const

interface TeamMember {
  id: string
  name: string
  slug: string
  logo?: string | null
  bio?: string | null
  socials?: string | null
  services?: string | null
  sortOrder: number
  featured: boolean
}

interface Plan {
  id: string
  serviceSlug: string
  level: string
  title: string
  price: string
  description: string
  features: string
  recommended: boolean
  sortOrder: number
}

export default function AdminPanel({ user }: { user: { username: string; role: string } }) {
  const [activeTab, setActiveTab] = useState<Tab>('services')
  const [services, setServices] = useState<Service[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [settings, setSettings] = useState<SiteSettings>({})
  const [localSettings, setLocalSettings] = useState<SiteSettings>({})

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [teams, setTeams] = useState<TeamMember[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [textBlocks, setTextBlocks] = useState<{ key: string; content: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingTeam, setEditingTeam] = useState<TeamMember | null>(null)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [editingTextBlock, setEditingTextBlock] = useState<{ key: string; content: string } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)
  const [settingsDirty, setSettingsDirty] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<{ id: string; username: string; email: string; role: string } | null>(null)

  useEffect(() => { loadAllData() }, [])

  async function loadAllData() {
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Failed to load data')
      const data = await res.json()
      setServices(data.services || [])
      setProjects(data.projects || [])
      setUsers(data.users || [])
      setSettings(data.settings || {})
      setTickets(data.tickets || [])
      setProducts(data.products || [])
      setTeams(data.teams || [])
      setPlans(data.plans || [])
      setTextBlocks(data.textBlocks || [])
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveTeam(member: TeamMember) {
    try {
      const method = member.id ? 'PUT' : 'POST'
      const res = await fetch('/api/teams', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(member) })
      if (res.ok) { setEditingTeam(null); loadAllData() }
    } catch (err) { console.error('Error saving team member:', err) }
  }

  async function handleDeleteTeam(id: string) {
    try { await fetch(`/api/teams?id=${id}`, { method: 'DELETE' }); loadAllData() }
    catch (err) { console.error('Error deleting team member:', err) }
  }

  async function handleSavePlan(plan: Plan) {
    try {
      const method = plan.id ? 'PUT' : 'POST'
      const res = await fetch('/api/plans', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(plan) })
      if (res.ok) { setEditingPlan(null); loadAllData() }
    } catch (err) { console.error('Error saving plan:', err) }
  }

  async function handleDeletePlan(id: string) {
    try { await fetch(`/api/plans?id=${id}`, { method: 'DELETE' }); loadAllData() }
    catch (err) { console.error('Error deleting plan:', err) }
  }

  async function handleSaveTextBlock(textBlock: { key: string; content: string }) {
    try {
      const res = await fetch('/api/text-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(textBlock),
      })
      if (res.ok) { setEditingTextBlock(null); loadAllData() }
    } catch (err) { console.error('Error saving text block:', err) }
  }

  async function handleDeleteTextBlock(key: string) {
    try { await fetch(`/api/text-blocks?key=${key}`, { method: 'DELETE' }); loadAllData() }
    catch (err) { console.error('Error deleting text block:', err) }
  }

  async function handleSaveService(service: Service) {
    try {
      const method = service.id ? 'PUT' : 'POST'
      const res = await fetch('/api/services', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(service) })
      if (res.ok) { setEditingService(null); loadAllData() }
    } catch (err) { console.error('Error saving service:', err) }
  }

  async function handleDeleteService(id: string) {
    try { await fetch(`/api/services?id=${id}`, { method: 'DELETE' }); loadAllData() }
    catch (err) { console.error('Error deleting service:', err) }
  }

  async function handleSaveUser(user: { id: string; username: string; email: string; role: string }) {
    try {
      const method = user.id ? 'PUT' : 'POST'
      const res = await fetch('/api/users', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(user) })
      if (res.ok) { setEditingUser(null); loadAllData() }
    } catch (err) { console.error('Error saving user:', err) }
  }

  async function handleDeleteUser(id: string) {
    try { await fetch(`/api/users?id=${id}`, { method: 'DELETE' }); loadAllData() }
    catch (err) { console.error('Error deleting user:', err) }
  }

  async function handleSaveProject(project: Project) {
    try {
      const method = project.id ? 'PUT' : 'POST'
      const res = await fetch('/api/projects', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(project) })
      if (res.ok) { setEditingProject(null); loadAllData() }
    } catch (err) { console.error('Error saving project:', err) }
  }

  async function handleDeleteProject(id: string) {
    try { await fetch(`/api/projects?id=${id}`, { method: 'DELETE' }); loadAllData() }
    catch (err) { console.error('Error deleting project:', err) }
  }

  async function handleSaveProduct(product: Product) {
    try {
      const method = product.id ? 'PUT' : 'POST'
      const res = await fetch('/api/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) })
      if (res.ok) { setEditingProduct(null); loadAllData() }
    } catch (err) { console.error('Error saving product:', err) }
  }

  async function handleDeleteProduct(id: string) {
    try { await fetch(`/api/products?id=${id}`, { method: 'DELETE' }); loadAllData() }
    catch (err) { console.error('Error deleting product:', err) }
  }

  async function handleSaveAllSettings() {
    try {
      await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(localSettings) })
      setSettings(localSettings)
      setSettingsDirty(false)
    } catch (err) { console.error('Error saving settings:', err) }
  }

  async function handleSaveSetting(key: string, value: string) {
    try {
      await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [key]: value }) })
      setSettings(prev => ({ ...prev, [key]: value }))
      setLocalSettings(prev => ({ ...prev, [key]: value }))
      setSettingsDirty(true)
    } catch (err) { console.error('Error saving setting:', err) }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, settingKey: string) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(settingKey)
    const formData = new FormData()
    formData.append('file', file)

    // Determine upload type
    let uploadType = 'logo'
    if (settingKey.includes('favicon')) uploadType = 'favicon'
    else if (settingKey.startsWith('team_logo_')) uploadType = 'team-logo'
    else uploadType = 'logo'

    formData.append('type', uploadType)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        // If it's a team logo, update the team member directly
        if (settingKey.startsWith('team_logo_')) {
          const slug = settingKey.replace('team_logo_', '')
          const team = teams.find(t => t.slug === slug)
          if (team) {
            await handleSaveTeam({ ...team, logo: data.url })
          }
        } else {
          await handleSaveSetting(settingKey, data.url)
        }
      }
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(null)
    }
  }

  async function updateTicketStatus(id: string, status: Ticket['status']) {
    try {
      await fetch('/api/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    } catch {}
  }

  async function deleteTicket(id: string) {
    try {
      await fetch(`/api/tickets/${id}`, { method: 'DELETE' })
      setTickets(prev => prev.filter(t => t.id !== id))
    } catch {}
  }

  async function bulkDeleteDemoProjects() {
    if (!confirm('Delete all demo/sample projects? This cannot be undone.')) return
    for (const project of projects) {
      await fetch(`/api/projects?id=${project.id}`, { method: 'DELETE' }).catch(() => {})
    }
    loadAllData()
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'services', label: 'Services' },
    { id: 'projects', label: 'Projects' },
    { id: 'tickets', label: 'Tickets', count: tickets.filter(t => t.status === 'OPEN').length },
    { id: 'users', label: 'Users' },
    { id: 'products', label: 'Downloads' },
    { id: 'team', label: 'Team', count: teams.length },
    { id: 'plans', label: 'Plans', count: plans.length },
    { id: 'content', label: 'Content', count: textBlocks.length },
    { id: 'settings', label: 'Settings' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-neutral-500 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="section-label mb-1">Admin Panel</p>
          <p className="text-sm text-neutral-500">Manage your studio — services, projects, downloads, and settings.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAllData} className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors">
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-neutral-900 rounded-lg w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-semibold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Services Panel */}
      {activeTab === 'services' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div>
              <h2 className="font-medium text-white">Services</h2>
              <p className="text-sm text-neutral-500 mt-0.5">{services.length} services configured</p>
            </div>
            <button
              onClick={() => setEditingService({
                id: '', name: '', slug: '', icon: 'Code2', description: '', featured: false, sortOrder: services.length
              })}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-sm hover:bg-blue-500/20"
            >
              <Plus size={14} /> Add Service
            </button>
          </div>

          {editingService && (
            <ServiceEditor
              service={editingService}
              onSave={handleSaveService}
              onCancel={() => setEditingService(null)}
            />
          )}

          <div className="divide-y divide-white/5">
            {services.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm">No services yet. Click &quot;Add Service&quot; to get started.</div>
            ) : services.map((service) => (
              <div key={service.id} className="p-5 flex items-center justify-between group hover:bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <span className="text-xl text-neutral-400">{getServiceIcon(service.icon)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{service.name}</span>
                      {service.featured && <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded">Featured</span>}
                    </div>
                    <p className="text-sm text-neutral-500 mt-0.5">{service.description}</p>
                    {service.price && <p className="text-xs text-neutral-600 font-mono mt-1">{service.price}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingService(service)} className="p-2 text-neutral-500 hover:text-white transition-colors rounded-md hover:bg-white/5">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteService(service.id)} className="p-2 text-neutral-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-400/5">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Panel */}
      {activeTab === 'projects' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="font-medium text-white">Projects</h2>
                <p className="text-sm text-neutral-500 mt-0.5">{projects.length} projects in portfolio</p>
              </div>
              {demoMode && (
                <button
                  onClick={bulkDeleteDemoProjects}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-sm hover:bg-red-500/20"
                >
                  <Trash2 size={14} /> Delete All Demo
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-neutral-500 cursor-pointer select-none">
                <input type="checkbox" checked={demoMode} onChange={e => setDemoMode(e.target.checked)} className="rounded border-neutral-700 bg-neutral-800" />
                Show demo mode
              </label>
              <button
                onClick={() => setEditingProject({
                  id: '', title: '', slug: '', description: '', tags: '', featured: false, sortOrder: projects.length
                })}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-sm hover:bg-blue-500/20"
              >
                <Plus size={14} /> Add Project
              </button>
            </div>
          </div>

          {editingProject && (
            <ProjectEditor
              project={editingProject}
              onSave={handleSaveProject}
              onCancel={() => setEditingProject(null)}
            />
          )}

          <div className="divide-y divide-white/5">
            {projects.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm">No projects yet. Click &quot;Add Project&quot; to start.</div>
            ) : projects.map((project) => (
              <div key={project.id} className="p-5 flex items-center justify-between group hover:bg-white/[0.02]">
                <div className="flex items-center gap-4 min-w-0">
                  {project.image ? (
                    <img src={project.image} alt={project.title} className="w-10 h-10 rounded object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center shrink-0">
                      <Tag size={14} className="text-neutral-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">{project.title}</span>
                      {project.featured && <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded shrink-0">Featured</span>}
                    </div>
                    <p className="text-sm text-neutral-500 mt-0.5 line-clamp-1">{project.description}</p>
                    {project.tags && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {project.tags.split(',').map((tag) => tag.trim() && (
                          <span key={tag} className="text-xs px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded">{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                    {project.link && <a href={project.link} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline mt-1 inline-block">View project &rarr;</a>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">
                  <button onClick={() => setEditingProject(project)} className="p-2 text-neutral-500 hover:text-white transition-colors rounded-md hover:bg-white/5">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteProject(project.id)} className="p-2 text-neutral-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-400/5">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tickets Panel */}
      {activeTab === 'tickets' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div>
              <h2 className="font-medium text-white">Support Tickets</h2>
              <p className="text-sm text-neutral-500 mt-0.5">{tickets.length} total &middot; {tickets.filter(t => t.status === 'OPEN').length} open</p>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm">No tickets yet.</div>
            ) : tickets.map((ticket) => (
              <div key={ticket.id} className="p-5 group hover:bg-white/[0.02]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    {ticket.status === 'OPEN' && <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />}
                    {ticket.status === 'IN_PROGRESS' && <Clock size={16} className="text-yellow-400 shrink-0 mt-0.5" />}
                    {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && <CheckCircle size={16} className="text-green-400 shrink-0 mt-0.5" />}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium">{ticket.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded border ${getTicketStatusClass(ticket.status)}`}>{ticket.status}</span>
                        <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">{ticket.category} &middot; by @{ticket.user.username} &middot; {new Date(ticket.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{ticket.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                      <>
                        {ticket.status !== 'IN_PROGRESS' && (
                          <button
                            onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS')}
                            title="Mark in progress"
                            className="p-1.5 text-neutral-500 hover:text-yellow-400 rounded-md hover:bg-yellow-400/5"
                          >
                            <Clock size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'RESOLVED')}
                          title="Resolve"
                          className="p-1.5 text-neutral-500 hover:text-green-400 rounded-md hover:bg-green-400/5"
                        >
                          <CheckCircle size={14} />
                        </button>
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'CLOSED')}
                          title="Close"
                          className="p-1.5 text-neutral-500 hover:text-neutral-400 rounded-md hover:bg-white/5"
                        >
                          <XSmall />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteTicket(ticket.id)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 rounded-md hover:bg-red-400/5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Panel */}
      {activeTab === 'users' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div>
              <h2 className="font-medium text-white">Users ({users.length})</h2>
              <p className="text-sm text-neutral-500 mt-0.5">Manage user accounts and roles</p>
            </div>
          </div>

          {editingUser && (
            <UserEditor
              user={editingUser}
              onSave={handleSaveUser}
              onCancel={() => setEditingUser(null)}
            />
          )}

          <div className="divide-y divide-white/5">
            {users.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm">No users yet.</div>
            ) : users.map((u) => (
              <div key={u.id} className="p-5 flex items-center justify-between group hover:bg-white/[0.02]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-neutral-400">{u.username[0].toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-white">{u.username}</div>
                    <p className="text-sm text-neutral-500 truncate">{u.email}</p>
                    <div className="mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        u.role === 'ADMIN' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-neutral-700/50 text-neutral-400'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingUser({ ...u, role: u.role as 'ADMIN' | 'USER' })}
                    className="p-2 text-neutral-500 hover:text-white transition-colors rounded-md hover:bg-white/5"
                    title="Edit user"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u.id)}
                    className="p-2 text-neutral-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-400/5"
                    title="Delete user"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products / Downloads Panel */}
      {activeTab === 'products' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div>
              <h2 className="font-medium text-white">Downloads</h2>
              <p className="text-sm text-neutral-500 mt-0.5">{products.length} downloadable items across all services</p>
            </div>
            <button
              onClick={() => setEditingProduct({
                id: '', name: '', slug: '', serviceId: services[0]?.id || '', description: '', featured: false, sortOrder: products.length
              })}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-sm hover:bg-blue-500/20"
            >
              <Plus size={14} /> Add Download
            </button>
          </div>

          {editingProduct && (
            <ProductEditor
              product={editingProduct}
              services={services}
              onSave={handleSaveProduct}
              onCancel={() => setEditingProduct(null)}
            />
          )}

          <div className="divide-y divide-white/5">
            {products.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm">No downloads yet. Add mod files, plugin JARs, resource packs, etc.</div>
            ) : products.map((product) => (
              <div key={product.id} className="p-5 flex items-center justify-between group hover:bg-white/[0.02]">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center shrink-0">
                    <Download size={16} className="text-neutral-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">{product.name}</span>
                      {product.serviceName && (
                        <span className="text-xs px-2 py-0.5 bg-neutral-800 text-neutral-500 rounded border border-white/5 shrink-0">{product.serviceName}</span>
                      )}
                      {product.featured && <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded shrink-0">Featured</span>}
                    </div>
                    <p className="text-sm text-neutral-500 mt-0.5 line-clamp-1">{product.description}</p>
                    {product.price && <p className="text-xs font-mono text-neutral-600 mt-1">{product.price}</p>}
                    {product.fileUrl && <a href={product.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400/70 hover:underline mt-1 inline-block">Open file URL &rarr;</a>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-4">
                  <button onClick={() => setEditingProduct(product)} className="p-2 text-neutral-500 hover:text-white transition-colors rounded-md hover:bg-white/5">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-neutral-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-400/5">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Panel */}
      {activeTab === 'team' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div>
              <h2 className="font-medium text-white">Team Members</h2>
              <p className="text-sm text-neutral-500 mt-0.5">{teams.length} members configured</p>
            </div>
            <button
              onClick={() => setEditingTeam({
                id: '', name: '', slug: '', logo: null, featured: false, sortOrder: teams.length
              })}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-sm hover:bg-blue-500/20"
            >
              <Plus size={14} /> Add Member
            </button>
          </div>

          {editingTeam && (
            <TeamEditor
              member={editingTeam}
              onSave={handleSaveTeam}
              onCancel={() => setEditingTeam(null)}
              handleFileUpload={handleFileUpload}
              uploading={uploading}
            />
          )}

          <div className="divide-y divide-white/5">
            {teams.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm">No team members yet. Click &quot;Add Member&quot; to get started.</div>
            ) : teams.map((member) => {
              const socials = member.socials ? JSON.parse(member.socials) : {}
              return (
                <div key={member.id} className="p-5 flex items-center justify-between group hover:bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    {member.logo ? (
                      <img src={member.logo} alt={member.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                        <span className="text-xs font-medium text-neutral-400">{member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{member.name}</span>
                        {member.featured && <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">Lead</span>}
                      </div>
                      <p className="text-sm text-neutral-500 mt-0.5">{member.services || 'Team Member'}</p>
                      {(socials.github || socials.linkedin || socials.twitter || socials.instagram || socials.facebook || socials.tiktok || socials.discord || socials.youtube) && (
                        <div className="flex gap-3 mt-1.5 flex-wrap">
                          {socials.github && <span className="text-[10px] text-neutral-600">GitHub</span>}
                          {socials.linkedin && <span className="text-[10px] text-neutral-600">LinkedIn</span>}
                          {socials.twitter && <span className="text-[10px] text-neutral-600">X</span>}
                          {socials.instagram && <span className="text-[10px] text-neutral-600">IG</span>}
                          {socials.facebook && <span className="text-[10px] text-neutral-600">FB</span>}
                          {socials.tiktok && <span className="text-[10px] text-neutral-600">TT</span>}
                          {socials.discord && <span className="text-[10px] text-neutral-600">DIS</span>}
                          {socials.youtube && <span className="text-[10px] text-neutral-600">YT</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => setEditingTeam(member)} className="p-2 text-neutral-500 hover:text-white transition-colors rounded-md hover:bg-white/5">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteTeam(member.id)} className="p-2 text-neutral-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-400/5">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Plans Panel */}
      {activeTab === 'plans' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div>
              <h2 className="font-medium text-white">Pricing Plans</h2>
              <p className="text-sm text-neutral-500 mt-0.5">{plans.length} plans across all services</p>
            </div>
            <button
              onClick={() => setEditingPlan({
                id: '', serviceSlug: '', level: 'REGULAR', title: '', price: '', description: '', features: '', recommended: false, sortOrder: plans.length
              })}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-sm hover:bg-blue-500/20"
            >
              <Plus size={14} /> Add Plan
            </button>
          </div>

          {editingPlan && (
            <PlanEditor
              plan={editingPlan}
              services={services}
              onSave={handleSavePlan}
              onCancel={() => setEditingPlan(null)}
            />
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="pb-3 px-5 text-neutral-500 font-medium">Service</th>
                  <th className="pb-3 px-5 text-neutral-500 font-medium">Level</th>
                  <th className="pb-3 px-5 text-neutral-500 font-medium">Title</th>
                  <th className="pb-3 px-5 text-neutral-500 font-medium">Price</th>
                  <th className="pb-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-neutral-500">No plans yet. Click &quot;Add Plan&quot; to start.</td></tr>
                ) : plans.map((plan) => (
                  <tr key={plan.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-5 py-4 text-neutral-400 font-mono text-xs">{plan.serviceSlug}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        plan.level === 'BIGNESS' ? 'bg-yellow-500/10 text-yellow-400'
                        : plan.level === 'PREMIUM' ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-neutral-700/50 text-neutral-400'
                      }`}>{plan.level}</span>
                    </td>
                    <td className="px-5 py-4 text-white font-medium">{plan.title}</td>
                    <td className="px-5 py-4 text-neutral-400 font-mono">{plan.price}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditingPlan(plan)} className="p-1.5 text-neutral-500 hover:text-white transition-colors rounded-md hover:bg-white/5">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDeletePlan(plan.id)} className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-400/5">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {activeTab === 'settings' && (
        <div className="card space-y-6">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-medium text-white">Site Configuration</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Customize how ngotra appears across the site.</p>
          </div>

          <div className="grid grid-cols-2 gap-6 p-5">
            <div className="space-y-1 col-span-2">
              <label className="text-xs text-neutral-500 uppercase tracking-wider">Brand Identity</label>
            </div>
            {[
              { key: 'site_name', label: 'Site Name', placeholder: 'ngotra', section: 'brand' },
              { key: 'site_tagline', label: 'Tagline', placeholder: 'Engineering bespoke digital experiences with precision and scale.', section: 'brand' },
              { key: 'site_description', label: 'Description', placeholder: '', section: 'brand' },
            ].map((field) => (
              <div key={field.key} className={field.section === 'brand' ? '' : 'col-span-2'}>
                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">{field.label}</label>
                <input
                  type="text"
                  value={localSettings[field.key] || ''}
                  placeholder={field.placeholder}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="input-field"
                />
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 p-5">
            <div className="space-y-1 mb-4">
              <label className="text-xs text-neutral-500 uppercase tracking-wider">Logo & Favicon</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">Site Logo</label>
                {localSettings['site_logo_url'] && (
                  <div className="mb-2 p-2 bg-neutral-800 rounded border border-white/5">
                    <img src={localSettings['site_logo_url']} alt="Logo" className="h-10 w-auto object-contain" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={localSettings['site_logo_url'] || ''}
                    placeholder="https://... or upload below"
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, site_logo_url: e.target.value }))}
                    className="input-field text-sm flex-1"
                  />
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-sm hover:bg-blue-500/20 cursor-pointer transition-colors">
                    <Upload size={14} />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'site_logo_url')}
                      className="hidden"
                      disabled={uploading === 'site_logo_url'}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">Favicon</label>
                {localSettings['site_favicon_url'] && (
                  <div className="mb-2 p-2 bg-neutral-800 rounded border border-white/5">
                    <img src={localSettings['site_favicon_url']} alt="Favicon" className="h-8 w-8 object-contain" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={localSettings['site_favicon_url'] || ''}
                    placeholder="https://... or upload below"
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, site_favicon_url: e.target.value }))}
                    className="input-field text-sm flex-1"
                  />
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-sm hover:bg-blue-500/20 cursor-pointer transition-colors">
                    <Upload size={14} />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'site_favicon_url')}
                      className="hidden"
                      disabled={uploading === 'site_favicon_url'}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 p-5">
            <div className="space-y-1 mb-4">
              <label className="text-xs text-neutral-500 uppercase tracking-wider">Social Links</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'social_youtube', label: 'YouTube URL', placeholder: 'https://youtube.com/@...' },
                { key: 'social_x', label: 'X (Twitter) URL', placeholder: 'https://x.com/...' },
                { key: 'social_instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
                { key: 'social_facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
                { key: 'social_tiktok', label: 'TikTok URL', placeholder: 'https://tiktok.com/@...' },
                { key: 'social_discord', label: 'Discord Invite URL', placeholder: 'https://discord.gg/...' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">{field.label}</label>
                  <input
                    type="text"
                    value={localSettings[field.key] || ''}
                    placeholder={field.placeholder}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="input-field"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">Footer Year</label>
                <input
                  type="text"
                  value={localSettings['footer_year'] || '2024'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, footer_year: e.target.value }))}
                  className="input-field w-32"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1.5">Accent Color</label>
                <select
                  value={localSettings['accent_color'] || 'blue'}
                  onChange={(e) => setLocalSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                  className="input-field"
                >
                  <option value="blue">Blue</option>
                  <option value="indigo">Indigo</option>
                  <option value="violet">Violet</option>
                  <option value="emerald">Emerald</option>
                  <option value="amber">Amber</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 p-5">
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <Palette size={12} />
              <span>Visual theme changes require a rebuild or CSS variable override to take full effect.</span>
            </div>
          </div>

          <div className="p-5 border-t border-white/5 flex justify-end gap-3">
            <button onClick={() => setLocalSettings(settings)} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">
              Reset
            </button>
            <button
              onClick={handleSaveAllSettings}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500 transition-colors"
            >
              <Save size={16} /> Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Content / Text Blocks Panel */}
      {activeTab === 'content' && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div>
              <h2 className="font-medium text-white">Site Content</h2>
              <p className="text-sm text-neutral-500 mt-0.5">{textBlocks.length} text blocks configured</p>
            </div>
            <button
              onClick={() => setEditingTextBlock({ key: '', content: '' })}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-sm hover:bg-blue-500/20"
            >
              <Plus size={14} /> Add Text Block
            </button>
          </div>

          {editingTextBlock && (
            <TextBlockEditor
              textBlock={editingTextBlock}
              onSave={handleSaveTextBlock}
              onCancel={() => setEditingTextBlock(null)}
            />
          )}

          <div className="divide-y divide-white/5">
            {textBlocks.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-sm">No text blocks yet. Add hero text, taglines, or other content.</div>
            ) : textBlocks.map((block) => (
              <div key={block.key} className="p-5 flex items-center justify-between group hover:bg-white/[0.02]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{block.key}</span>
                  </div>
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-1">{block.content}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingTextBlock(block)} className="p-2 text-neutral-500 hover:text-white transition-colors rounded-md hover:bg-white/5">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteTextBlock(block.key)} className="p-2 text-neutral-500 hover:text-red-400 transition-colors rounded-md hover:bg-red-400/5">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TextBlockEditor({
  textBlock,
  onSave,
  onCancel,
}: {
  textBlock: { key: string; content: string }
  onSave: (t: { key: string; content: string }) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(textBlock)
  return (
    <div className="p-5 bg-neutral-900 border-b border-white/5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={draft.key}
          onChange={(e) => setDraft(prev => ({ ...prev, key: e.target.value }))}
          placeholder="Block key (e.g. hero_title, site_tagline)"
          className="input-field text-sm"
        />
        <input
          type="text"
          value={draft.content}
          onChange={(e) => setDraft(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Content text"
          className="input-field text-sm"
        />
      </div>
      <textarea
        value={draft.content}
        onChange={(e) => setDraft(prev => ({ ...prev, content: e.target.value }))}
        placeholder="Full content (for longer text blocks)"
        rows={4}
        className="input-field resize-none text-sm"
      />
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors">Cancel</button>
        <button
          onClick={() => onSave(draft)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500"
        >
          <Save size={14} /> Save Text Block
        </button>
      </div>
    </div>
  )
}

function UserEditor({
  user,
  onSave,
  onCancel,
}: {
  user: { id: string; username: string; email: string; role: string }
  onSave: (u: { id: string; username: string; email: string; role: string }) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(user)
  return (
    <div className="p-5 bg-neutral-900 border-b border-white/5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={draft.username}
          onChange={(e) => setDraft(prev => ({ ...prev, username: e.target.value }))}
          placeholder="Username"
          className="input-field text-sm"
        />
        <input
          type="email"
          value={draft.email}
          onChange={(e) => setDraft(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Email"
          className="input-field text-sm"
        />
      </div>
      <select
        value={draft.role}
        onChange={(e) => setDraft(prev => ({ ...prev, role: e.target.value }))}
        className="input-field text-sm"
      >
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors">Cancel</button>
        <button
          onClick={() => onSave(draft)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500"
        >
          <Save size={14} /> Save User
        </button>
      </div>
    </div>
  )
}

function getServiceIcon(name: string) {
  switch (name) {
    case 'Globe': return <Globe size={20} />
    case 'Cloud': return <Cloud size={20} />
    case 'Monitor': return <Monitor size={20} />
    case 'Server': return <Server size={20} />
    case 'Palette': return <Palette size={20} />
    default: return <MessageSquare size={20} />
  }
}

function getTicketStatusClass(status: string) {
  switch (status) {
    case 'OPEN': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    case 'IN_PROGRESS': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    case 'RESOLVED': return 'text-green-400 bg-green-400/10 border-green-400/20'
    case 'CLOSED': return 'text-neutral-500 bg-neutral-800 border-neutral-700'
    default: return 'text-neutral-400 bg-neutral-800'
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'URGENT': return 'text-red-400'
    case 'HIGH': return 'text-orange-400'
    case 'MEDIUM': return 'text-yellow-400'
    case 'LOW': return 'text-neutral-500'
    default: return 'text-neutral-400'
  }
}

function XSmall() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function ServiceEditor({
  service,
  onSave,
  onCancel,
}: {
  service: Service
  onSave: (s: Service) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(service)
  return (
    <div className="p-5 bg-neutral-900 border-b border-white/5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Service name (e.g. Minecraft Mod Development)"
          className="input-field text-sm"
        />
        <input
          type="text"
          value={draft.slug}
          onChange={(e) => setDraft(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
          placeholder="Slug (e.g. minecraft-mod)"
          className="input-field text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <textarea
          value={draft.description}
          onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of this service"
          rows={2}
          className="input-field resize-none text-sm"
        />
        <div className="space-y-2">
          <input
            type="text"
            value={draft.price || ''}
            onChange={(e) => setDraft(prev => ({ ...prev, price: e.target.value }))}
            placeholder="Price (optional, e.g. $299)"
            className="input-field text-sm"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => setDraft(prev => ({ ...prev, featured: e.target.checked }))}
              id="featured-toggle"
              className="rounded border-neutral-700 bg-neutral-800"
            />
            <label htmlFor="featured-toggle" className="text-sm text-neutral-400">Featured on services page</label>
          </div>
          <div className="flex gap-2 flex-wrap mt-2">
            {SERVICE_CATEGORIES.map(cat => (
              <span key={cat} className="text-[10px] px-2 py-1 bg-neutral-800 text-neutral-500 rounded">{cat}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors">Cancel</button>
        <button
          onClick={() => onSave(draft)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500"
        >
          <Save size={14} /> Save Service
        </button>
      </div>
    </div>
  )
}

function ProjectEditor({
  project,
  onSave,
  onCancel,
}: {
  project: Project
  onSave: (p: Project) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(project)
  return (
    <div className="p-5 bg-neutral-900 border-b border-white/5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={draft.title}
          onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Project title"
          className="input-field text-sm"
        />
        <input
          type="text"
          value={draft.slug}
          onChange={(e) => setDraft(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
          placeholder="Slug"
          className="input-field text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <textarea
          value={draft.description}
          onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Project description"
          rows={3}
          className="input-field resize-none text-sm"
        />
        <div className="space-y-2">
          <input
            type="text"
            value={draft.tags || ''}
            onChange={(e) => setDraft(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="Tags (comma-separated, first = category)"
            className="input-field text-sm"
          />
          <input
            type="text"
            value={draft.image || ''}
            onChange={(e) => setDraft(prev => ({ ...prev, image: e.target.value }))}
            placeholder="Image URL (optional)"
            className="input-field text-sm"
          />
          <input
            type="text"
            value={draft.link || ''}
            onChange={(e) => setDraft(prev => ({ ...prev, link: e.target.value }))}
            placeholder="Live URL (optional)"
            className="input-field text-sm"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => setDraft(prev => ({ ...prev, featured: e.target.checked }))}
              id="proj-featured"
              className="rounded border-neutral-700 bg-neutral-800"
            />
            <label htmlFor="proj-featured" className="text-sm text-neutral-400">Show on homepage</label>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors">Cancel</button>
        <button
          onClick={() => onSave(draft)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500"
        >
          <Save size={14} /> Save Project
        </button>
      </div>
    </div>
  )
}

function ProductEditor({
  product,
  services,
  onSave,
  onCancel,
}: {
  product: Product
  services: Service[]
  onSave: (p: Product) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(product)
  return (
    <div className="p-5 bg-neutral-900 border-b border-white/5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Item name (e.g. Custom Survival Mod v1.2)"
          className="input-field text-sm"
        />
        <input
          type="text"
          value={draft.slug}
          onChange={(e) => setDraft(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
          placeholder="Slug"
          className="input-field text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select
          value={draft.serviceId}
          onChange={(e) => setDraft(prev => ({ ...prev, serviceId: e.target.value }))}
          className="input-field text-sm"
        >
          <option value="">Select service...</option>
          {services.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          type="text"
          value={draft.price || ''}
          onChange={(e) => setDraft(prev => ({ ...prev, price: e.target.value }))}
          placeholder="Price (optional, e.g. Free or $49)"
          className="input-field text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <textarea
          value={draft.description}
          onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))}
          placeholder="What&apos;s included in this download"
          rows={3}
          className="input-field resize-none text-sm"
        />
        <input
          type="text"
          value={draft.fileUrl || ''}
          onChange={(e) => setDraft(prev => ({ ...prev, fileUrl: e.target.value }))}
          placeholder="File URL (Google Drive, Dropbox, CDN link...)"
          className="input-field text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.featured}
          onChange={(e) => setDraft(prev => ({ ...prev, featured: e.target.checked }))}
          id="prod-featured"
          className="rounded border-neutral-700 bg-neutral-800"
        />
        <label htmlFor="prod-featured" className="text-sm text-neutral-400">Featured on service page</label>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors">Cancel</button>
        <button
          onClick={() => onSave(draft)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500"
        >
          <Save size={14} /> Save Download
        </button>
      </div>
    </div>
  )
}

function TeamEditor({
  member,
  onSave,
  onCancel,
  handleFileUpload,
  uploading,
}: {
  member: TeamMember
  onSave: (m: TeamMember) => void
  onCancel: () => void
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, settingKey: string) => void
  uploading: string | null
}) {
  const [draft, setDraft] = useState(member)
  const [socials, setSocials] = useState<{
    github?: string; linkedin?: string; twitter?: string;
    instagram?: string; facebook?: string; tiktok?: string;
    discord?: string; youtube?: string;
  }>(() => {
    try { return member.socials ? JSON.parse(member.socials) : {} } catch { return {} }
  })

  return (
    <div className="p-5 bg-neutral-900 border-b border-white/5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Full name"
          className="input-field text-sm"
        />
        <input
          type="text"
          value={draft.services || ''}
          onChange={(e) => setDraft(prev => ({ ...prev, services: e.target.value }))}
          placeholder="Role / Specialization"
          className="input-field text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={draft.slug}
          onChange={(e) => setDraft(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
          placeholder="Slug (e.g. john-doe)"
          className="input-field text-sm"
        />
        <input
          type="text"
          value={draft.services || ''}
          onChange={(e) => setDraft(prev => ({ ...prev, services: e.target.value }))}
          placeholder="Specialization (e.g. Backend, Minecraft)"
          className="input-field text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <textarea
          value={draft.bio || ''}
          onChange={(e) => setDraft(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Short bio (2-3 sentences)"
          rows={3}
          className="input-field resize-none text-sm"
        />
        <div className="space-y-2">
          {draft.logo && (
            <div className="p-2 bg-neutral-800 rounded border border-white/5">
              <img src={draft.logo} alt="Logo" className="h-12 w-12 rounded-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={draft.logo || ''}
              onChange={(e) => setDraft(prev => ({ ...prev, logo: e.target.value }))}
              placeholder="Logo URL (optional)"
              className="input-field text-sm flex-1"
            />
            <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-sm hover:bg-blue-500/20 cursor-pointer transition-colors">
              <Upload size={14} />
              <span>Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, `team_logo_${member.slug || 'unnamed'}`)}
                className="hidden"
                disabled={uploading === `team_logo_${member.slug || 'unnamed'}`}
              />
            </label>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs text-neutral-500 uppercase tracking-wider">Social Links</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="url"
            value={socials.github || ''}
            onChange={(e) => { const next = { ...socials, github: e.target.value }; setDraft(prev => ({ ...prev, socials: JSON.stringify(next) })); setSocials(next) }}
            placeholder="GitHub URL"
            className="input-field text-sm"
          />
          <input
            type="url"
            value={socials.linkedin || ''}
            onChange={(e) => { const next = { ...socials, linkedin: e.target.value }; setDraft(prev => ({ ...prev, socials: JSON.stringify(next) })); setSocials(next) }}
            placeholder="LinkedIn URL"
            className="input-field text-sm"
          />
          <input
            type="url"
            value={socials.twitter || ''}
            onChange={(e) => { const next = { ...socials, twitter: e.target.value }; setDraft(prev => ({ ...prev, socials: JSON.stringify(next) })); setSocials(next) }}
            placeholder="X / Twitter URL"
            className="input-field text-sm"
          />
          <input
            type="url"
            value={socials.instagram || ''}
            onChange={(e) => { const next = { ...socials, instagram: e.target.value }; setDraft(prev => ({ ...prev, socials: JSON.stringify(next) })); setSocials(next) }}
            placeholder="Instagram URL"
            className="input-field text-sm"
          />
          <input
            type="url"
            value={socials.facebook || ''}
            onChange={(e) => { const next = { ...socials, facebook: e.target.value }; setDraft(prev => ({ ...prev, socials: JSON.stringify(next) })); setSocials(next) }}
            placeholder="Facebook URL"
            className="input-field text-sm"
          />
          <input
            type="url"
            value={socials.tiktok || ''}
            onChange={(e) => { const next = { ...socials, tiktok: e.target.value }; setDraft(prev => ({ ...prev, socials: JSON.stringify(next) })); setSocials(next) }}
            placeholder="TikTok URL"
            className="input-field text-sm"
          />
          <input
            type="url"
            value={socials.discord || ''}
            onChange={(e) => { const next = { ...socials, discord: e.target.value }; setDraft(prev => ({ ...prev, socials: JSON.stringify(next) })); setSocials(next) }}
            placeholder="Discord URL"
            className="input-field text-sm"
          />
          <input
            type="url"
            value={socials.youtube || ''}
            onChange={(e) => { const next = { ...socials, youtube: e.target.value }; setDraft(prev => ({ ...prev, socials: JSON.stringify(next) })); setSocials(next) }}
            placeholder="YouTube URL"
            className="input-field text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.featured}
          onChange={(e) => setDraft(prev => ({ ...prev, featured: e.target.checked }))}
          id="team-featured"
          className="rounded border-neutral-700 bg-neutral-800"
        />
        <label htmlFor="team-featured" className="text-sm text-neutral-400">Featured (Lead member)</label>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors">Cancel</button>
        <button
          onClick={() => onSave(draft)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500"
        >
          <Save size={14} /> Save Member
        </button>
      </div>
    </div>
  )
}

function PlanEditor({
  plan,
  services,
  onSave,
  onCancel,
}: {
  plan: Plan
  services: Service[]
  onSave: (p: Plan) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState(plan)
  return (
    <div className="p-5 bg-neutral-900 border-b border-white/5 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <select
          value={draft.serviceSlug}
          onChange={(e) => setDraft(prev => ({ ...prev, serviceSlug: e.target.value }))}
          className="input-field text-sm"
        >
          <option value="">Select service...</option>
          {services.map(s => (
            <option key={s.id} value={s.slug}>{s.name}</option>
          ))}
        </select>
        <select
          value={draft.level}
          onChange={(e) => setDraft(prev => ({ ...prev, level: e.target.value }))}
          className="input-field text-sm"
        >
          <option value="REGULAR">Regular</option>
          <option value="PREMIUM">Premium</option>
          <option value="BIGNESS">Bigness</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={draft.title}
          onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Plan title (e.g. Starter, Pro, Enterprise)"
          className="input-field text-sm"
        />
        <input
          type="text"
          value={draft.price}
          onChange={(e) => setDraft(prev => ({ ...prev, price: e.target.value }))}
          placeholder="Price (e.g. $299 or $49/mo)"
          className="input-field text-sm"
        />
      </div>
      <textarea
        value={draft.description}
        onChange={(e) => setDraft(prev => ({ ...prev, description: e.target.value }))}
        placeholder="Short description of what's included"
        rows={2}
        className="input-field resize-none text-sm"
      />
      <div>
        <label className="text-xs text-neutral-500 block mb-1.5">Features (one per line)</label>
        <textarea
          value={draft.features}
          onChange={(e) => setDraft(prev => ({ ...prev, features: e.target.value }))}
          placeholder="5+ core features&#10;Custom integrations&#10;24/7 support"
          rows={4}
          className="input-field resize-none text-sm font-mono"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.recommended}
          onChange={(e) => setDraft(prev => ({ ...prev, recommended: e.target.checked }))}
          id="plan-recommended"
          className="rounded border-neutral-700 bg-neutral-800"
        />
        <label htmlFor="plan-recommended" className="text-sm text-neutral-400">Mark as recommended</label>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors">Cancel</button>
        <button
          onClick={() => onSave(draft)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-500"
        >
          <Save size={14} /> Save Plan
        </button>
      </div>
    </div>
  )
}
