# lennix-frontend

The Lennix web app — the AEC experience on top of `lennix-ms-bk`. React 19,
TypeScript, Vite, Redux Toolkit with RTK Query, Chakra UI v3, react-intl, React
Router. Deployed on Vercel.

**The product in one line:** turn a construction schedule into live intelligence
in minutes — upload a Gantt, land on a coherent schedule, build the dependency
graph, and see the critical path and propagated delay.

The app talks **only** to the backend: it never calls the AI service and never
touches cloud storage. Permission gates here are UX; the backend is always the
enforcer.

Documentation lives in [`docs/README.md`](docs/README.md) — start there.
Working on this repository as an agent starts at [`AGENTS.md`](AGENTS.md). The
domain vocabulary is canonical in `lennix-ms-bk/docs/DOMAIN.md`.

## Running it

```bash
pnpm install
pnpm dev             # dev server on :3000 against a running backend

pnpm typecheck       # tsc --noEmit
pnpm lint            # eslint src
pnpm test            # vitest --run
pnpm test:coverage   # with the 80% repo-wide floor — what CI runs
pnpm e2e             # bddgen + playwright against a production build

pnpm build           # production bundle into dist/
pnpm serve           # serve it locally
pnpm prettier        # format everything

pnpm seed:sync       # regenerate the test seed manifest from the backend
pnpm seed:check      # fail if it is stale
```

`VITE_API_BASE_URL` points the app at a backend. pnpm is the only supported
package manager and Node is pinned by Volta. `pnpm seed:sync` reads the sibling
backend checkout, or `LENNIX_MS_BK_PATH`.

## License

Proprietary software of Innovacores SpA — see [`LICENSE`](LICENSE). Third-party
attributions this repository is required to preserve are in
[`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md).
