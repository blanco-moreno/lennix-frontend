import { lazy } from 'react'
import type { RouteObject } from 'react-router'
import { Navigate } from 'react-router'

import { PublicRouteLayout, ProtectedRouteLayout } from '@/components'
import { PATHS } from '@/constants'

import { AuthGuard } from './guards/auth-guard'
import { HomeRedirect } from './guards/home-redirect'
import { PermissionGuard } from './guards/permission-guard'
import { RouteErrorBoundary } from './route-error-boundary'

// Lazy load all pages for code splitting
const LoginView = lazy(async () =>
  import('@/views/login-view').then((m) => ({ default: m.LoginView })),
)
const HomeView = lazy(async () =>
  import('@/views/home-view').then((m) => ({
    default: m.HomeView,
  })),
)
const ProjectsView = lazy(async () =>
  import('@/views/projects-view').then((m) => ({
    default: m.ProjectsView,
  })),
)
// List and detail are separate chunks: opening one project must not
// download the list screen, and vice versa.
const ProjectDetailView = lazy(async () =>
  import('@/views/project-detail-view').then((m) => ({
    default: m.ProjectDetailView,
  })),
)
const TaskDetailView = lazy(async () =>
  import('@/views/task-detail-view').then((m) => ({
    default: m.TaskDetailView,
  })),
)
const DraftsView = lazy(async () =>
  import('@/views/drafts-view').then((m) => ({ default: m.DraftsView })),
)
const ProjectImportView = lazy(async () =>
  import('@/views/project-import-view').then((m) => ({
    default: m.ProjectImportView,
  })),
)
const DraftReviewView = lazy(async () =>
  import('@/views/draft-review-view').then((m) => ({
    default: m.DraftReviewView,
  })),
)
const ImportAssistedMappingView = lazy(async () =>
  import('@/views/import-assisted-mapping-view').then((m) => ({
    default: m.ImportAssistedMappingView,
  })),
)
const TasksView = lazy(async () =>
  import('@/views/tasks-view').then((m) => ({ default: m.TasksView })),
)
const SettingsView = lazy(async () =>
  import('@/views/settings-view').then((m) => ({
    default: m.SettingsView,
  })),
)
const TeamManagementView = lazy(async () =>
  import('@/views/team-management-view').then((m) => ({
    default: m.TeamManagementView,
  })),
)
const ApprovalsView = lazy(async () =>
  import('@/views/approvals-view').then((m) => ({
    default: m.ApprovalsView,
  })),
)
const TrashView = lazy(async () =>
  import('@/views/trash-view').then((m) => ({
    default: m.TrashView,
  })),
)
const NotFoundView = lazy(async () =>
  import('@/views/not-found-view').then((m) => ({
    default: m.NotFoundView,
  })),
)

/**
 * Attach the styled `RouteErrorBoundary` to every leaf route.
 *
 * React Router resolves the *nearest* `errorElement`, so putting one on each
 * leaf keeps a broken screen contained to its own outlet — the layout shell and
 * sidebar survive. The bare boundary in `App.tsx` stays as the last resort for
 * errors thrown above the router (it sits outside `AppIntlProvider`, so it
 * cannot be translated).
 */
function withRouteBoundaries(routeList: RouteObject[]): RouteObject[] {
  return routeList.map((route) => {
    if (route.children) {
      return {
        ...route,
        errorElement: <RouteErrorBoundary />,
        children: withRouteBoundaries(route.children),
      }
    }
    return { ...route, errorElement: <RouteErrorBoundary /> }
  })
}

/**
 * Application route configuration
 * Organized into auth routes and protected routes
 */
const routeDefinitions: RouteObject[] = [
  {
    // Authentication routes (public)
    element: <PublicRouteLayout />,
    children: [
      {
        path: PATHS.LOGIN,
        element: <LoginView />,
      },
    ],
  },
  {
    // Protected routes (require authentication)
    element: <AuthGuard />,
    children: [
      {
        // The home of whoever is signed in — the role decides which one, and
        // `AuthGuard` above guarantees the role has resolved.
        path: PATHS.HOME,
        element: <HomeRedirect />,
      },
      {
        element: <ProtectedRouteLayout />,
        children: [
          {
            element: <PermissionGuard permission="dashboard.view" />,
            children: [
              {
                path: PATHS.DASHBOARD,
                element: <HomeView />,
              },
            ],
          },
          {
            path: PATHS.PROJECTS,
            element: <ProjectsView />,
          },
          {
            path: PATHS.PROJECT_DETAIL,
            element: <ProjectDetailView />,
          },
          {
            // The activity's own page, inside its project's address space.
            // Old `?activity=&panel=` links redirect here from project detail.
            path: PATHS.TASK_DETAIL,
            element: <TaskDetailView />,
          },
          {
            // Borradores — the one drafts home. Its own surface, not the
            // project list with a tab selected: the quota meter, the resumable
            // review links and discarding an import all live here.
            path: PATHS.DRAFTS,
            element: <DraftsView />,
          },
          {
            // The "New project" entry button is gated by `project.create`;
            // gate the whole import flow at the route too, so a deep link to
            // /projects/import doesn't end in a backend 403 and a toast.
            element: <PermissionGuard permission="project.create" />,
            children: [
              {
                path: PATHS.PROJECT_IMPORT,
                element: <ProjectImportView />,
              },
              {
                path: PATHS.DRAFT_REVIEW,
                element: <DraftReviewView />,
              },
              {
                path: PATHS.IMPORT_ASSISTED_MAPPING,
                element: <ImportAssistedMappingView />,
              },
            ],
          },
          {
            path: PATHS.TASKS,
            element: <TasksView />,
          },
          {
            // Everyone has an account, so the page is open; the organization
            // section inside it is what the permission gates.
            path: PATHS.SETTINGS,
            element: <SettingsView />,
          },
          // The two settings pages this one replaced.
          {
            path: '/settings/profile',
            element: <Navigate to={PATHS.SETTINGS} replace />,
          },
          {
            // The organization half of the settings page is gated, so the old
            // address that led to it is gated too — a manager or a user
            // following a stale link gets the refusal page, not a bounce into
            // a screen whose only section they cannot see.
            element: (
              <PermissionGuard permission="organization.settings.manage" />
            ),
            children: [
              {
                path: '/settings/organization',
                element: <Navigate to={PATHS.SETTINGS} replace />,
              },
            ],
          },
          {
            // The org roster page is admin-only.
            element: <PermissionGuard permission="org.team.manage" />,
            children: [
              {
                path: PATHS.TEAM_MANAGEMENT,
                element: <TeamManagementView />,
              },
            ],
          },
          {
            // One home, two decision types: holding either key opens it, and
            // the view itself only renders the sections you can decide.
            // `budget.edit.request` is the `user`'s key — it opens the same
            // home in read-only "my requests" mode.
            element: (
              <PermissionGuard
                permission={[
                  'budget.approval.decide',
                  'forceStart.approval.decide',
                  'budget.edit.request',
                ]}
              />
            ),
            children: [
              {
                path: PATHS.APPROVALS,
                element: <ApprovalsView />,
              },
            ],
          },
          {
            element: <PermissionGuard permission="trash.view" />,
            children: [
              {
                path: PATHS.TRASH,
                element: <TrashView />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    // Catch-all for unknown routes
    path: '*',
    element: <NotFoundView />,
  },
]

export const routes: RouteObject[] = withRouteBoundaries(routeDefinitions)
