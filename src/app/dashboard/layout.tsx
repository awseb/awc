import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import DashboardShell from '@/components/DashboardShell'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <DashboardShell initialSession={session}>
      {children}
    </DashboardShell>
  )
}
