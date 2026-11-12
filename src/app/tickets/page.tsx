import Link from 'next/link'

export default function TicketsPage() {
  return (
    <div className="min-h-screen bg-[#05050a]">
      <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28 bg-[#09090b] border-b border-white/[0.06]">
        <p className="section-label mb-4">Support</p>
        <h1 className="text-4xl md:text-6xl font-semibold text-white leading-[1.05] max-w-3xl">
          Your tickets<br /><span className="text-neutral-500">and conversations.</span>
        </h1>
        <p className="mt-7 text-neutral-500 text-base md:text-lg max-w-xl leading-relaxed">
          Track your support requests and chat with our team in real-time.
        </p>
      </div>

      <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-16 md:py-20 bg-[#0c0c0f]">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/tickets/new"
            className="btn-primary inline-flex items-center gap-2 mb-8"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Ticket
          </Link>
          <div className="card p-8 text-center text-neutral-500">
            Sign in to view your tickets and start a conversation.
          </div>
        </div>
      </div>
    </div>
  )
}