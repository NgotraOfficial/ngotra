import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — NGOTRA',
  description: 'Privacy Policy for NGOTRA development studio.',
}

export default function PrivacyPage() {
  return (
    <div className="bg-[#09090b] min-h-screen">
      <div className="border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <p className="section-label mb-3">Legal</p>
          <h1 className="text-3xl md:text-5xl font-semibold text-white leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-neutral-500 text-sm">Last updated: November 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 text-neutral-400 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">1. Information We Collect</h2>
          <p>
            When you interact with NGOTRA — whether inquiring about a project, using our contact form, or ordering services — we collect only essential information required to deliver our services. This includes your name, email address, communication history, and technical specifications related to your project.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">2. How We Use Information</h2>
          <p>
            We use your data solely to communicate regarding project inquiries, deliver tailored software solutions, manage user authentication, and provide ongoing support. We never sell or lease your personal information to third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">3. Data Security & Retention</h2>
          <p>
            All data is encrypted in transit and stored using industry-standard database protocols. We retain project files and client records only for the duration of the engagement plus active support agreements unless requested otherwise.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-white">4. Your Rights</h2>
          <p>
            You have the right to request access to, correction of, or deletion of your personal data held by NGOTRA at any time by contacting us directly.
          </p>
        </section>

        <section className="space-y-3 pt-6 border-t border-white/5">
          <p>
            Questions about our privacy practices?{' '}
            <Link href="/contact" className="text-blue-400 hover:underline">
              Contact our team
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
