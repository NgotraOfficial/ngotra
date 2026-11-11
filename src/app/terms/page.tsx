import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — NGOTRA',
  description: 'Terms of Service for NGOTRA development studio.',
}

export default function TermsPage() {
  return (
    <div className="bg-[#09090b] min-h-screen">
      <div className="border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <p className="section-label mb-3">Legal</p>
          <h1 className="text-3xl md:text-5xl font-semibold text-white leading-tight">
            Terms of Service
          </h1>
          <p className="mt-4 text-neutral-500 text-sm">Last updated: November 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 text-neutral-400 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">1. Scope of Work</h2>
          <p>
            NGOTRA provides custom software engineering services including web development, mobile applications, desktop software, custom tooling, and Minecraft infrastructure (server configuration, mods, and plugins). Project scope, timelines, deliverables, and pricing are agreed upon prior to project kickoff.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">2. Intellectual Property</h2>
          <p>
            Upon complete payment for custom deliverables, clients receive ownership of custom-written source code specified in the project contract. Open-source dependencies and third-party libraries remain under their respective licenses.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">3. Payments & Milestones</h2>
          <p>
            Projects follow agreed milestone payments. Initial deposits are required before development begins. Ongoing maintenance and hosting services billed on recurring cycles must be paid on schedule to ensure uninterrupted service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">4. Warranty & Support</h2>
          <p>
            All custom builds include a bug-fix warranty window following delivery to address any defects relative to agreed specifications. Extended SLA support and infrastructure monitoring are available under custom service plans.
          </p>
        </section>

        <section className="space-y-3 pt-6 border-t border-white/5">
          <p>
            Have questions regarding working with us?{' '}
            <Link href="/contact" className="text-blue-400 hover:underline">
              Get in touch
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
