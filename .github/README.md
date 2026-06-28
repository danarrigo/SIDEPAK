# CI/CD

Two GitHub Actions workflows validate the codebase on every push/PR to `main` or `mobile`.

## Workflows

| File | Triggers on | Jobs |
|------|-------------|------|
| `.github/workflows/desktop-ci.yml` | changes in `desktop/**` | Lint, TypeScript type-check, Jest tests |
| `.github/workflows/mobile-ci.yml` | changes in `mobile/**` | Flutter analyze, format check, widget/unit tests |

Both run on `ubuntu-latest` and are triggered independently so a change to one app only rebuilds that app.

## Running locally

### Desktop
```bash
cd desktop
npm install
npm run lint
npx tsc --noEmit        # type-check (no emit)
npm test                # Jest tests
```

### Mobile
```bash
cd mobile
flutter pub get
flutter analyze
flutter test            # All unit + widget tests
```

## Test layout

### Desktop (Jest + React Testing Library)
- `desktop/src/__tests__/actions/` — server action unit tests
- `desktop/src/__tests__/api/` — Next.js route handler integration tests
- `desktop/src/__tests__/components/` — React component tests
- `desktop/src/__tests__/services/` — service layer unit tests

Test setup:
- `desktop/jest.config.ts` — uses `next/jest`, `jsdom` environment
- `desktop/jest.polyfills.ts` — `Request`/`Response`/`Headers` polyfills (runs before test framework)
- `desktop/jest.setup.ts` — `@testing-library/jest-dom` matchers

### Mobile (Flutter test)
- `mobile/test/models/` — model `fromJson` parsing
- `mobile/test/providers/` — `KoperasiProvider` HTTP-mocked unit tests
- `mobile/test/views/` — widget tests for new feature views
- `mobile/test/views/widgets/` — widget tests for shared components (PrankOverlay, LeaderboardSection)
- `mobile/test/widget_test.dart` — app boot smoke test (7-item bottom nav)

## Adding a new test

For new mobile providers/methods, follow the pattern in
`mobile/test/providers/koperasi_provider_test.dart` — inject a `MockClient` via
`KoperasiProvider.apiClientOverride`.

For new API routes, add a file under `desktop/src/__tests__/api/` mirroring
the existing `mobile-sync.test.ts` / `mobile-sync-action.test.ts` patterns.
