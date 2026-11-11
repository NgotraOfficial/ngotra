import { requireAdmin } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminPanel from '@/components/AdminPanel'

export default async function AdminPage() {
  let session
  try {
    session = await requireAdmin()
  } catch {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Admin Panel</span>
          </h1>
          <p className="text-gray-400">Welcome back, {session.user.username}</p>
        </div>
        <AdminPanel user={session.user} />
      </div>
    </div>
  )
}
