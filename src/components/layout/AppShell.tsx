import { Outlet, useLocation } from 'react-router-dom'
import Wordmark from './Wordmark'
import BottomNav from './BottomNav'

// Routes that get the full shell (wordmark + bottom nav)
const SHELL_ROUTES = [
  '/discover', '/browse', '/requests', '/my-requests',
  '/messages', '/account', '/bookings',
  '/dashboard', '/provider/requests', '/listing', '/earnings', '/verification',
]

function useShouldShowShell() {
  const { pathname } = useLocation()
  return SHELL_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

export default function AppShell() {
  const showShell = useShouldShowShell()

  return (
    <>
      {showShell && <Wordmark />}
      <main style={{ paddingBottom: showShell ? 72 : 0 }}>
        <Outlet />
      </main>
      {showShell && <BottomNav />}
    </>
  )
}
