'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Message sent</h2>
        <p className="text-neutral-500 text-sm mb-6">
          Thanks for reaching out. We usually reply within a day.
        </p>
        <Link href="/" className="text-sm text-blue-400 hover:underline">
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="input-field w-full"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="input-field w-full"
            placeholder="you@email.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Subject</label>
        <select
          name="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="input-field w-full bg-[#09090b]"
        >
          <option value="">What's this about?</option>
          <option value="web">Web Development</option>
          <option value="app">Mobile App</option>
          <option value="game">Game Development</option>
          <option value="minecraft">Minecraft Services</option>
          <option value="other">Other / General Inquiry</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
          rows={6}
          className="input-field w-full resize-none"
          placeholder="Tell us about your project — scope, timeline, budget..."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full md:w-auto disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
