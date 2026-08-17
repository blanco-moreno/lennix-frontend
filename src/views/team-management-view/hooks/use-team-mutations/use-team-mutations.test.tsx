import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import toast from 'react-hot-toast'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'

import { server } from '@/mocks/server'
import type { TeamMemberCreateFormValues } from '@/schemas'
import { makeStore } from '@/stores'
import { seedOrganizationMemberListDTO, seedUser } from '@/tests/fixtures'
import { SEED_IDS, SEED_ORGANIZATION } from '@/tests/seed'

import enMessages from '../../../../../lang/en.json'

import { useTeamMutations } from './use-team-mutations'

const organizationId = SEED_ORGANIZATION.id

/** The hook needs RTK Query (store) and intl (toasts) — no theme. */
function makeWrapper() {
  const store = makeStore()
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <IntlProvider locale="en" defaultLocale="en" messages={enMessages}>
          {children}
        </IntlProvider>
      </Provider>
    )
  }
}

const formValues: TeamMemberCreateFormValues = {
  firstName: '  Nueva ',
  lastName: ' Persona ',
  email: ' nueva.persona@lennix-test.com ',
  role: 'member',
}

/** Records register + add-member calls; each step can be told to fail. */
function serveCreateFlow({ registerStatus = 201, addStatus = 201 } = {}) {
  const registerBodies: Record<string, unknown>[] = []
  const memberBodies: Record<string, unknown>[] = []
  const pedro = seedUser(SEED_IDS.USER_PEDRO_ID)

  server.use(
    http.post('*/v1/auth/register', async ({ request }) => {
      registerBodies.push((await request.json()) as Record<string, unknown>)
      if (registerStatus >= 400) {
        return HttpResponse.json(
          { detail: 'email already registered' },
          { status: registerStatus },
        )
      }
      return HttpResponse.json(
        {
          user_id: pedro.userId,
          email: 'nueva.persona@lennix-test.com',
          first_name: 'Nueva',
          last_name: 'Persona',
          phone: null,
          is_active: true,
          plan_id: null,
          role_id: pedro.roleId,
          organization_id: organizationId,
        },
        { status: registerStatus },
      )
    }),
    http.post(
      '*/v1/organizations/:organizationId/members',
      async ({ request }) => {
        memberBodies.push((await request.json()) as Record<string, unknown>)
        if (addStatus >= 400) {
          return HttpResponse.json({ detail: 'boom' }, { status: addStatus })
        }
        const [row] = seedOrganizationMemberListDTO()
        return HttpResponse.json(row, { status: addStatus })
      },
    ),
  )
  return { registerBodies, memberBodies }
}

function renderMutations(onMemberCreated = vi.fn()) {
  const { result } = renderHook(
    () => useTeamMutations({ organizationId, onMemberCreated }),
    { wrapper: makeWrapper() },
  )
  return { result, onMemberCreated }
}

describe('useTeamMutations', () => {
  // The toast spies must not leak calls from one test into the next.
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('registers the user, adds the membership and hands back the credentials', async () => {
    const { registerBodies, memberBodies } = serveCreateFlow()
    const { result, onMemberCreated } = renderMutations()

    let ok = false
    await act(async () => {
      ok = await result.current.handleAddMember(formValues)
    })

    expect(ok).toBe(true)
    await waitFor(() => expect(memberBodies).toHaveLength(1))
    // Trimmed values, a generated password, and no role — the backend
    // assigns the default `user` role server-side.
    expect(registerBodies[0]).toMatchObject({
      email: 'nueva.persona@lennix-test.com',
      first_name: 'Nueva',
      last_name: 'Persona',
    })
    expect(registerBodies[0]).not.toHaveProperty('role_id')
    expect(memberBodies[0]).toEqual({
      user_id: SEED_IDS.USER_PEDRO_ID,
    })
    // The credentials handed to the dialog are the ones actually registered.
    expect(onMemberCreated).toHaveBeenCalledWith({
      email: 'nueva.persona@lennix-test.com',
      password: registerBodies[0].password,
    })
    expect(registerBodies[0].password).toEqual(expect.any(String))
  })

  it('reports failure and shows no credentials when the registration fails', async () => {
    serveCreateFlow({ registerStatus: 400 })
    const errorToast = vi.spyOn(toast, 'error')
    const { result, onMemberCreated } = renderMutations()

    let ok = true
    await act(async () => {
      ok = await result.current.handleAddMember(formValues)
    })

    expect(ok).toBe(false)
    expect(onMemberCreated).not.toHaveBeenCalled()
    expect(errorToast).toHaveBeenCalled()
  })

  it('reports failure when the user registers but the membership add fails', async () => {
    const { memberBodies } = serveCreateFlow({ addStatus: 500 })
    const { result, onMemberCreated } = renderMutations()

    let ok = true
    await act(async () => {
      ok = await result.current.handleAddMember(formValues)
    })

    await waitFor(() => expect(memberBodies).toHaveLength(1))
    expect(ok).toBe(false)
    // Credentials are only surfaced for a member that actually joined.
    expect(onMemberCreated).not.toHaveBeenCalled()
  })

  it('removes a member over DELETE and toasts each outcome', async () => {
    const deletes: { organizationId: string; userId: string }[] = []
    server.use(
      http.delete(
        '*/v1/organizations/:organizationId/members/:userId',
        ({ params }) => {
          deletes.push({
            organizationId: params.organizationId as string,
            userId: params.userId as string,
          })
          if (deletes.length > 1) {
            return HttpResponse.json({ detail: 'boom' }, { status: 500 })
          }
          return new HttpResponse(null, { status: 204 })
        },
      ),
    )
    const successToast = vi.spyOn(toast, 'success')
    const errorToast = vi.spyOn(toast, 'error')
    const { result } = renderMutations()

    await act(async () => {
      await result.current.handleRemoveMember(SEED_IDS.USER_MIGUEL_ID)
    })
    expect(deletes[0]).toEqual({
      organizationId,
      userId: SEED_IDS.USER_MIGUEL_ID,
    })
    expect(successToast).toHaveBeenCalled()
    expect(errorToast).not.toHaveBeenCalled()

    // The failure path lands as a toast too, not as an unhandled rejection.
    await act(async () => {
      await result.current.handleRemoveMember(SEED_IDS.USER_MIGUEL_ID)
    })
    expect(errorToast).toHaveBeenCalled()
  })

  it('regenerates a password over POST and hands back the credentials', async () => {
    const posts: { userId: string; body: Record<string, unknown> }[] = []
    server.use(
      http.post(
        '*/v1/organizations/:organizationId/members/:userId/password',
        async ({ params, request }) => {
          posts.push({
            userId: params.userId as string,
            body: (await request.json()) as Record<string, unknown>,
          })
          if (posts.length > 1) {
            return HttpResponse.json(
              { detail: { code: 'only_owner_manages_admins' } },
              { status: 403 },
            )
          }
          return new HttpResponse(null, { status: 204 })
        },
      ),
    )
    const successToast = vi.spyOn(toast, 'success')
    const errorToast = vi.spyOn(toast, 'error')
    const { result, onMemberCreated } = renderMutations()
    const email = seedUser(SEED_IDS.USER_MIGUEL_ID).email

    await act(async () => {
      await result.current.handleResetPassword(SEED_IDS.USER_MIGUEL_ID, email)
    })
    expect(posts[0]?.userId).toBe(SEED_IDS.USER_MIGUEL_ID)
    const sent = posts[0]?.body.password
    expect(typeof sent).toBe('string')
    // The credentials dialog receives the very password that was sent.
    expect(onMemberCreated).toHaveBeenCalledWith({
      email,
      password: sent,
      regenerated: true,
    })
    expect(successToast).toHaveBeenCalled()

    // A refusal lands as a toast, with no credentials surfaced.
    await act(async () => {
      await result.current.handleResetPassword(SEED_IDS.USER_MIGUEL_ID, email)
    })
    expect(errorToast).toHaveBeenCalled()
    expect(onMemberCreated).toHaveBeenCalledTimes(1)
  })
})
