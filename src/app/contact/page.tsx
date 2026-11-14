import { Mail, Clock, MessageSquare, Shield, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ContactForm from './ContactForm'

async function getSettings() {
  const settingsRaw = await prisma.siteSetting.findMany({
    where: { key: { in: ['social_discord'] } }
  })
  return Object.fromEntries(settingsRaw.map((s: { key: string; value: string }) => [s.key, s.value]))
}

export default async function ContactPage() {
  const settings = await getSettings()
  const discordLink = settings.social_discord

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-[#09090b] border-b border-white/[0.06]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28">
          <p className="section-label mb-4">Get in touch</p>
          <h1 className="text-4xl md:text-6xl font-semibold text-white leading-[1.05] max-w-3xl">
            Let's build<br /><span className="text-neutral-500">something great.</span>
          </h1>
          <p className="mt-7 text-neutral-500 text-base md:text-lg max-w-xl leading-relaxed">
            Tell us about your project. We'll respond within 24 hours with questions, scope, and an estimate.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="bg-[#0c0c0f]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16">
            {/* Form side */}
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2">Send us a message</h2>
                <p className="text-neutral-500">Fill out the form and we'll get back to you shortly.</p>
              </div>
              <ContactForm />
            </div>

            {/* Info side */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-medium text-white mb-4">Contact info</h3>
                <div className="space-y-4">
                  <SidebarItem
                    icon={<Mail size={16} className="text-blue-400" />}
                    label="Email"
                    value="contact@ngotra.site"
                    link="mailto:contact@ngotra.site"
                  />
                  {discordLink && (
                    <SidebarItem
                      icon={<MessageSquare size={16} className="text-purple-400" />}
                      label="Discord"
                      value="Join our server"
                      link={discordLink}
                    />
                  )}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-medium text-white mb-4">What to expect</h3>
                <div className="space-y-4">
                  <InfoItem
                    step="01"
                    title="Quick response"
                    desc="We reply within 24 hours"
                  />
                  <InfoItem
                    step="02"
                    title="Clarify scope"
                    desc="Brief call or chat to understand needs"
                  />
                  <InfoItem
                    step="03"
                    title="Proposal"
                    desc="Written estimate with timeline"
                  />
                </div>
              </div>

              <div className="card p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white text-sm">No obligation required</p>
                    <p className="text-sm text-neutral-500 mt-1">
                      This is just a conversation. No pressure, no sales pitch — just honest feedback on feasibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function SidebarItem({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link?: string }) {
  const content = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span>{icon}</span>
        <div>
          <p className="text-xs text-neutral-600 uppercase tracking-wider">{label}</p>
          <p className={`text-sm mt-0.5 ${link ? 'text-blue-400 hover:text-blue-300 transition-colors cursor-pointer' : 'text-white'}`}>{value}</p>
        </div>
      </div>
      {link && <ArrowRight size={14} className="text-neutral-700" />}
    </div>
  )

  if (link) {
    return (
      <a href={link} target={link.startsWith('http') ? '_blank' : undefined} rel={link.startsWith('http') ? 'noreferrer' : undefined}>
        {content}
      </a>
    )
  }

  return content
}

function InfoItem({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-xs font-mono text-blue-500 shrink-0 pt-0.5">{step}</span>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
