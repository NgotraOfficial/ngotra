'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, LogOut, Shield, Activity, Settings }

interface LayoutProps {
  children: React.ReactNode
  user?: { id: string; username: string; email: string; role: string } | null
  siteSettings?: Record<string, string>
}

export default function Layout({ children, user: initialUser, siteSettings }: LayoutProps) {
  const [user, setUser] = useState(initialUser)
  const [loading, setLoading] = useState(!initialUser)
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user ?? null)
        } else {
          setUser(null)
        }
      } catch (e) {
        console.error('Session fetch failed', e)
      } finally {
        setLoading(false)
      }
    }
    fetchSession()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setProfileOpen(false)
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const publicNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/projects', label: 'Projects' },
    { href: '/services', label: 'Services' },
    { href: '/team', label: 'Team' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  const siteName = siteSettings?.site_name || 'ngotra'
  const footerYear = siteSettings?.footer_year || '2024'
  const logoUrl = siteSettings?.site_logo_url

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200`}>
        <nav className={`border-b transition-colors ${scrolled ? 'border-white/10 bg-[#09090b]/80 backdrop-blur-xl' : 'border-white/[0.06]'}`}>
          <div className="px-8 md:px-12 lg:px-20 xl:px-28 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              {logoUrl && (
                <img src={logoUrl} alt={siteName} className="h-10 w-auto object-contain" />
              )}
              <span className="text-lg font-semibold tracking-tight text-white">{siteName}<span className="text-blue-400">.</span></span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {publicNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-[15px] rounded-lg transition-colors ${
                    pathname === link.href
                      ? 'text-white bg-white/10'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 relative" ref={profileRef}>
              {loading ? (
                <div className="w-20 h-9 bg-neutral-800 animate-pulse rounded-lg" />
              ) : user ? (
                <>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="px-4 py-2 text-sm text-neutral-400 hover:text-yellow-400 transition-colors rounded-lg">
                      admin
                    </Link>
                  )}
                  <span className="text-xs text-neutral-700 hidden sm:inline">&middot;</span>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-md hover:bg-white/5 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center">
                      <span className="text-xs text-neutral-400 font-medium">{user.username[0].toUpperCase()}</span>
                    </div>
                    <ChevronDown size={12} className={`text-neutral-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-[#18181b] border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-sm font-medium text-white">{user.username}</p>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Activity size={14} />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard?tab=profile"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Settings size={14} />
                          Settings
                        </Link>
                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-yellow-500/80 hover:text-yellow-400 hover:bg-yellow-400/5 transition-colors"
                          >
                            <Shield size={14} />
                            Admin Panel
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-white/5 py-1">
                        <button
                          onClick={async () => {
                            await fetch('/api/auth/logout', { method: 'POST' })
                            window.location.href = '/'
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-neutral-500 hover:text-red-400 hover:bg-red-400/5 transition-colors"
                        >
                          <LogOut size={14} />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors"
                >
                  Sign in
                </Link>
              )}

              <button
                className="md:hidden p-2 text-neutral-500 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-14 z-40 bg-[#09090b]/95 backdrop-blur-xl border-b border-white/[0.06] md:hidden">
          <div className="px-6 py-6 space-y-1">
            {publicNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-3 text-base font-medium rounded-lg transition-all ${
                  pathname === link.href
                    ? 'text-white bg-white/5'
                    : 'text-neutral-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/dashboard"
                className={`block px-3 py-3 text-base font-medium rounded-lg transition-all ${
                  pathname.startsWith('/dashboard') ? 'text-white bg-white/5' : 'text-neutral-500 hover:text-white hover:bg-white/5'
                }`}
              >
                Dashboard
              </Link>
            )}
            <div className="pt-4 mt-4 border-t border-white/5">
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                      <span className="text-xs text-neutral-400 font-medium">{user.username[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{user.username}</p>
                      <p className="text-xs text-neutral-600">{user.email}</p>
                    </div>
                  </div>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-yellow-400/80 hover:bg-yellow-400/5 rounded-lg"
                    >
                      <Shield size={14} />
                      Admin panel
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' })
                      window.location.href = '/'
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-neutral-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="block w-full text-center px-4 py-3 bg-white/10 rounded-lg text-sm font-medium"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="pt-20 min-h-screen flex flex-col">
        <div className="flex-1">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-auto bg-[#0c0c0f]">
        <div className="px-8 md:px-12 lg:px-20 xl:px-28 py-24">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-6 w-auto object-contain mb-3" />
              ) : null}
              <span className="text-sm font-semibold tracking-tight text-white block mb-3">{siteName}<span className="text-blue-400">.</span></span>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Engineering high-performance web applications, mobile platforms, and custom infrastructure. We transform complex technical challenges into intuitive, production-ready solutions.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                {siteSettings?.social_youtube && (
                  <a href={siteSettings.social_youtube} target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-white transition-colors" title="YouTube">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
                {siteSettings?.social_x && (
                  <a href={siteSettings.social_x} target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-white transition-colors" title="X (Twitter)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
                {siteSettings?.social_instagram && (
                  <a href={siteSettings.social_instagram} target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-white transition-colors" title="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                )}
                {siteSettings?.social_facebook && (
                  <a href={siteSettings.social_facebook} target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-white transition-colors" title="Facebook">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 3.909 10.988 9.218 12.583v-8.902H5.972v-3.681h3.246V9.309c0-3.204 1.902-4.974 4.83-4.974 1.402 0 2.87.25 2.87.25v3.156h-1.617c-1.588 0-2.083.986-2.083 1.995v2.392h3.556l-.569 3.681h-2.987v8.902C20.091 23.061 24 18.063 24 12.073z"/></svg>
                  </a>
                )}
                {siteSettings?.social_tiktok && (
                  <a href={siteSettings.social_tiktok} target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-white transition-colors" title="TikTok">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-.1-.01-.05V13c.18-3.04 2.48-5.57 5.45-5.96v4.04c-.1.08-.12.1-.2.15-1.2.56-1.95 1.92-1.88 3.25.02.62.2 1.23.5 1.78.6.99 1.65 1.46 2.75 1.4 1.44-.05 2.53-1.02 2.83-2.35.02-.09.03-.17.04-.26V0z"/></svg>
                  </a>
                )}
                {siteSettings?.social_discord && (
                  <a href={siteSettings.social_discord} target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-white transition-colors" title="Discord">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.072 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.23 10.23 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/></svg>
                  </a>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Navigate</p>
              <ul className="space-y-2">
                {[['Work','/'],['Services','/services'],['About','/about'],['Contact','/contact']].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Services</p>
              <ul className="space-y-2">
                {['Web apps','Mobile apps','Games','Minecraft'].map((item) => (
                  <li key={item}>
                    <Link href="/services" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Socials</p>
              <ul className="space-y-2">
                {siteSettings?.social_youtube && <li><a href={siteSettings.social_youtube} target="_blank" rel="noreferrer" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">YouTube</a></li>}
                {siteSettings?.social_x && <li><a href={siteSettings.social_x} target="_blank" rel="noreferrer" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">X</a></li>}
                {siteSettings?.social_instagram && <li><a href={siteSettings.social_instagram} target="_blank" rel="noreferrer" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">Instagram</a></li>}
                {siteSettings?.social_facebook && <li><a href={siteSettings.social_facebook} target="_blank" rel="noreferrer" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">Facebook</a></li>}
                {siteSettings?.social_tiktok && <li><a href={siteSettings.social_tiktok} target="_blank" rel="noreferrer" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">TikTok</a></li>}
                {siteSettings?.social_discord && <li><a href={siteSettings.social_discord} target="_blank" rel="noreferrer" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">Discord</a></li>}
              </ul>
            </div>

            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Legal</p>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 my-6" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <p className="text-xs text-neutral-700">&copy; {footerYear} {siteName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function MenuIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  )
}

function XIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
