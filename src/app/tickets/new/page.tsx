'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewTicketPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    priority: 'MEDIUM'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create ticket')
      }

      const data = await res.json()
      router.push(`/tickets/${data.ticket.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#05050a]">
      <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-12 border-b border-white/[0.06]">
        <Link href="/tickets" className="text-sm text-neutral-500 hover:text-white transition-colors">
          ← Back to tickets
        </Link>
      </div>

      <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-semibold text-white mb-2">New Support Ticket</h1>
          <p className="text-neutral-500 mb-8">Describe your issue and we'll respond as soon as possible.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs text-neutral-600 uppercase tracking-wider mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Brief description of your issue"
                className="w-full bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-neutral-600 uppercase tracking-wider mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="General">General</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Billing">Billing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-neutral-600 uppercase tracking-wider mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-600 uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={6}
                placeholder="Describe your issue in detail..."
                className="w-full bg-neutral-900 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full md:w-auto disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}