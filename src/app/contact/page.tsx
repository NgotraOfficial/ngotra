import { Mail, Clock, MessageSquare } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ContactForm from './ContactForm'

async function getSettings() {
  'use cache'
  const settingsRaw = await prisma.siteSetting.findMany({
    where: {
      key: { in: ['social_discord'] }
    }
  })
  return Object.fromEntries(settingsRaw.map(s => [s.key, s.value]))
}

export default async function ContactPage() {
  const settings = await getSettings()
  const discordLink = settings.social_discord

  return (
    <div className="bg-[#09090b]">
      <div className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <p className="section-label mb-4">Contact</p>
          <h1 className="text-3xl md:text-5xl font-semibold text-white leading-tight">
            Let's talk<br />about yours.
          </h1>
          <p className="mt-6 text-neutral-500 text-lg max-w-lg leading-relaxed">
            Describe what you need — roughly is fine. We'll follow up with questions,
            a timeframe, and a no-pressure estimate.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          {/* Form */}
          <div>
            <ContactForm />
          </div>

          {/* Sidebar */}
          <div className="space-y-6 pt-2">
            <SidebarItem
              icon={<Mail size={16} />}
              label="Email"
              value="contact@ngotra.site"
              link="mailto:contact@ngotra.site"
            />
            {discordLink && (
              <SidebarItem
                icon={<MessageSquare size={16} />}
                label="Discord"
                value="Join our server"
                link={discordLink}
              />
            )}
            <SidebarItem
              icon={<Clock size={16} />}
              label="Response time"
              value="Within 24 hours"
            />
            <SidebarItem
              icon={null}
              label="Preferred channel"
              value="Email or Discord"
            />

            <div className="card p-5 mt-8">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-4">What happens next</p>
              <ol className="space-y-3 text-sm text-neutral-400">
                {[
                  'You fill out the form above',
                  'We read it and respond within a day',
                  'Brief call to clarify scope and requirements',
                  'Written proposal with timeline & estimate',
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-xs font-mono text-blue-500 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, value, link }: { icon: React.ReactNode | null; label: string; value: string; link?: string }) {
  const content = (
    <div className="flex items-start gap-3">
      {icon && <span className="text-neutral-600 mt-0.5">{icon}</span>}
      <div>
        <p className="text-xs text-neutral-600 uppercase tracking-wider">{label}</p>
        <p className={`text-sm mt-0.5 ${link ? 'text-blue-400 hover:text-blue-300 transition-colors' : 'text-white'}`}>{value}</p>
      </div>
    </div>
  )

  if (link) {
    return (
      <a href={link} target={link.startsWith('http') ? '_blank' : undefined} rel={link.startsWith('http') ? 'noreferrer' : undefined} className="block group">
        {content}
      </a>
    )
  }

  return content
}
