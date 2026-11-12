export default function About() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-[#09090b] border-b border-white/[0.06]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-20 md:py-28">
          <p className="section-label mb-4">About us</p>
          <h1 className="text-4xl md:text-6xl font-semibold text-white leading-[1.05] max-w-3xl">
            We build software<br />
            <span className="text-neutral-500">that works.</span>
          </h1>
          <p className="mt-7 text-neutral-500 text-base md:text-lg max-w-2xl leading-relaxed">
            Ngotra is a development team focused on delivering reliable, production-ready solutions.
            We don't chase trends — we write code that stands the test of time.
          </p>
        </div>
      </section>

      {/* What we do */}
      <section className="bg-[#0c0c0f]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-16 md:py-20">
          <p className="section-label mb-8">What we do</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              title="Web Development"
              desc="Full-stack web applications built with modern frameworks. Clean architecture, scalable design, production-ready code."
            />
            <ServiceCard
              title="Mobile Apps"
              desc="Cross-platform mobile applications that feel native. iOS and Android from a single codebase."
            />
            <ServiceCard
              title="Game Development"
              desc="Custom games and interactive experiences. From prototypes to full releases."
            />
            <ServiceCard
              title="Minecraft Services"
              desc="Server setup, custom mods, and plugins. We've powered servers with thousands of concurrent players."
            />
            <ServiceCard
              title="DevOps"
              desc="Deployment, monitoring, and infrastructure. We handle the ops so you can focus on the product."
            />
            <ServiceCard
              title="Consulting"
              desc="Technical guidance for your next project. Architecture reviews, tech stack selection, and more."
            />
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="bg-[#09090b] border-t border-white/[0.06]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <p className="section-label mb-4">Our approach</p>
              <div className="space-y-4 text-neutral-400">
                <p>
                  We believe in shipping software that works — not just for demos, but in production,
                  under real load, with real users.
                </p>
                <p>
                  Every project starts with a conversation. We listen to what you need, ask questions
                  about constraints, and propose a solution that fits.
                </p>
                <p>
                  No jargon, no fluff. Just honest engineering and clear communication from start to finish.
                </p>
              </div>
            </div>
            <div>
              <p className="section-label mb-4">Principles</p>
              <ul className="space-y-3">
                <PrincipleItem text="Write code we'd run ourselves" />
                <PrincipleItem text="Ship early, iterate often" />
                <PrincipleItem text="Document as we go" />
                <PrincipleItem text="Test what matters" />
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function ServiceCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card p-6">
      <h3 className="font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
    </div>
  )
}

function PrincipleItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-2" />
      <span className="text-neutral-400">{text}</span>
    </li>
  )
}