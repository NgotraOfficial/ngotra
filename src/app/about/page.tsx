import { CheckCircle2 } from 'lucide-react'

const values = [
  { text: 'We write code we\'re comfortable running in production ourselves.' },
  { text: 'Communication happens in the open — shared docs, not private DMs.' },
  { text: 'Clear scope before we start. Scope changes are conversations, not surprises.' },
  { text: 'Remote-first doesn\'t mean async-only. We hop on calls when it matters.' },
]

const timeline = [
  { year: '2024', event: 'Started as a one-person operation building Minecraft servers for community projects.' },
  { year: '2024 Q3', event: 'First web client — a small SaaS dashboard. Realized we enjoyed the full-stack work more than expected.' },
  { year: '2025', event: 'Grew to three engineers. Took on mobile and game development contracts. CraftHaven MC server hit 12k members.' },
  { year: 'Today', event: 'Six people across two timezones. Web, mobile, games, infrastructure — same straightforward approach.' },
]

export default function About() {
  return (
    <div className="bg-[#09090b]">
      <div className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <p className="section-label mb-4">About us</p>
          <h1 className="text-3xl md:text-5xl font-semibold text-white leading-tight max-w-2xl">
            Small team.<br />
            <span className="text-neutral-500">Serious about shipping.</span>
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 py-16">
          {/* Left: Story */}
          <div className="space-y-6 text-neutral-400 leading-relaxed">
            <p>
              Ngotra started in 2024 as a solo project — setting up Minecraft servers for friends
              and small communities. It was weekend work, but the feedback kept coming:{" "}
              <span className="text-neutral-300">"Can you also build this website?"</span>,
              {" "}<span className="text-neutral-300">"Do you know anyone who can make an app?"</span>.
            </p>
            <p>
              Those requests turned into a proper studio. Two years later we're six engineers working
              across web, mobile, games, and infrastructure. We still take on projects the way we did
              back then: honest conversation first, clear scope second, ship third.
            </p>
            <p>
              We're not a agency that pivots every quarter. We're a small team that does a few things
              well and gets paid to do them again.
            </p>
          </div>

          {/* Right: Values + Timeline */}
          <div className="space-y-12">
            <div>
              <p className="section-label mb-5">How we work</p>
              <ul className="space-y-3">
                {values.map((v, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-neutral-400">
                    <CheckCircle2 size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                    {v.text}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="section-label mb-5">Timeline</p>
              <div className="space-y-4">
                {timeline.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-xs font-mono text-neutral-600 w-20 pt-0.5 shrink-0">{item.year}</span>
                    <p className="text-sm text-neutral-400 leading-relaxed">{item.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
