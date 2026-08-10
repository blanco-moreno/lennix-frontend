import { Box, Flex, useMediaQuery } from '@chakra-ui/react'
import {
  Building2,
  BarChart3,
  CheckSquare,
  CheckCheck,
  FileClock,
  Settings,
  Trash2,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { Outlet, useNavigate } from 'react-router'

import { PATHS } from '@/constants'
import { usePermission, usePendingApprovalsCount } from '@/hooks'
import { useAuth, useAuthActions } from '@/stores/hooks'

import { Sidebar, type NavigationGroup } from '../sidebar'
import { Topbar } from '../topbar'

import { navMessages } from './protected-route-layout-messages'

interface NavigationItemSpec {
  id: keyof typeof navMessages
  icon: LucideIcon
  path: string
}

/**
 * The menu is grouped by mode of work, not by module: Works (what I
 * supervise), Schedules (what I am preparing) and Management (what I
 * administer). Import and Drafts are first-class entries: the hero flow and
 * its resumable home do not hang off a button and a self-hiding nudge.
 */
const GROUPS: {
  id: keyof typeof navMessages
  items: NavigationItemSpec[]
}[] = [
  {
    id: 'groupWorks',
    items: [
      { id: 'dashboard', icon: BarChart3, path: PATHS.DASHBOARD },
      { id: 'projects', icon: Building2, path: PATHS.PROJECTS },
      { id: 'tasks', icon: CheckSquare, path: PATHS.TASKS },
    ],
  },
  {
    id: 'groupSchedules',
    items: [
      { id: 'import', icon: Upload, path: PATHS.PROJECT_IMPORT },
      { id: 'drafts', icon: FileClock, path: PATHS.DRAFTS },
    ],
  },
  {
    id: 'groupManagement',
    items: [
      { id: 'approvals', icon: CheckCheck, path: PATHS.APPROVALS },
      { id: 'team', icon: Users, path: PATHS.TEAM_MANAGEMENT },
      { id: 'trash', icon: Trash2, path: PATHS.TRASH },
    ],
  },
  {
    id: 'groupAccount',
    items: [{ id: 'settings', icon: Settings, path: PATHS.SETTINGS }],
  },
]

/**
 * Protected route layout with sidebar navigation for authenticated users
 * Provides consistent layout structure and navigation for all protected routes
 */
export function ProtectedRouteLayout() {
  const navigate = useNavigate()
  const intl = useIntl()
  // Below `md` the sidebar is a drawer the topbar's hamburger opens, so its
  // state lives here — the two components that need it are siblings.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // From `md` up only: the drawer has no collapsed state, it is open or gone.
  //
  // Below `xl` it starts collapsed, because that is where a fixed 256px rail
  // stops being free: a tablet in landscape is 1024px, and the full rail left
  // the content the same 768px the same tablet has in portrait — rotating the
  // device bought nothing. Collapsed it costs 80px instead. A deliberate
  // toggle wins over the breakpoint from then on, and `null` means "still
  // following the screen", so rotating keeps working until the user decides.
  //
  // Asked as "is it narrow?" rather than "is it wide?" so that the uncertain
  // answer is the expanded one: until a media query resolves, every query
  // reads false, and the other phrasing collapsed the rail for a frame on a
  // desktop that was never narrow.
  const [narrowForRail] = useMediaQuery(['(max-width: 79.99em)'], {
    fallback: [false],
  })
  const [collapseOverride, setCollapseOverride] = useState<boolean | null>(null)
  const sidebarCollapsed = collapseOverride ?? narrowForRail
  const { user } = useAuth()
  const { handleLogout } = useAuthActions()
  // One entry for the one approvals home: either decision key opens it, and so
  // does the requester's key — a `user` lands on the same home in read-only
  // "my requests" mode.
  const canDecideBudget = usePermission('budget.approval.decide')
  const canDecideForceStart = usePermission('forceStart.approval.decide')
  const canRequestBudget = usePermission('budget.edit.request')
  const canSeeApprovals =
    canDecideBudget || canDecideForceStart || canRequestBudget
  const canViewTrash = usePermission('trash.view')
  // The home dashboard narrows to owner/admin/manager, the org roster page and
  // the papelera to owner/admin.
  const canViewDashboard = usePermission('dashboard.view')
  const canManageTeam = usePermission('org.team.manage')

  // Import and Drafts share one gate: they are two stations of the same flow.
  const canCreateProjects = usePermission('project.create')

  // The product has one record (the project Historial) and one push: the
  // pending-approvals count sits on the home that owns the only signal which
  // needs a *specific* person.
  const pendingApprovals = usePendingApprovalsCount()

  // A group whose every item is hidden disappears with its header: a field
  // supervisor sees Works + Account, not three empty section titles.
  const navigationGroups = useMemo<NavigationGroup[]>(() => {
    const hiddenIds = new Set<NavigationItemSpec['id']>()
    if (!canViewDashboard) hiddenIds.add('dashboard')
    if (!canManageTeam) hiddenIds.add('team')
    if (!canSeeApprovals) hiddenIds.add('approvals')
    if (!canViewTrash) hiddenIds.add('trash')
    if (!canCreateProjects) {
      hiddenIds.add('import')
      hiddenIds.add('drafts')
    }
    return GROUPS.map((group) => ({
      id: group.id,
      label: intl.formatMessage(navMessages[group.id]),
      items: group.items
        .filter((item) => !hiddenIds.has(item.id))
        .map((item) => ({
          ...item,
          label: intl.formatMessage(navMessages[item.id]),
          badge: item.id === 'approvals' ? pendingApprovals : undefined,
        })),
    })).filter((group) => group.items.length > 0)
  }, [
    canCreateProjects,
    canSeeApprovals,
    canManageTeam,
    canViewDashboard,
    canViewTrash,
    intl,
    pendingApprovals,
  ])

  const onLogout = () => {
    handleLogout()
    navigate(PATHS.LOGIN)
  }

  return (
    // `overflowX="hidden"`: one cell that outgrows its track should cost that
    // row its layout, not hand the whole page a sideways scroll that shifts
    // the header and the nav off screen with it. Vertical scrolling is the
    // `main` below's job and is untouched.
    <Flex bg="bg.canvas" h="100dvh" overflowX="hidden">
      <Sidebar
        navigationGroups={navigationGroups}
        collapsed={sidebarCollapsed}
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />
      <Flex direction="column" flex="1" minW={0}>
        <Topbar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setCollapseOverride(!sidebarCollapsed)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          user={user}
          onLogout={onLogout}
        />
        <Box
          as="main"
          flex="1"
          minH={0}
          minW={0}
          overflowY="auto"
          overflowX="hidden"
          bg="bg.subtle"
        >
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  )
}
