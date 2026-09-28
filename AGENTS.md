# Project Guidance

## User Preferences

- Mobile-first design with a clean, simple interface for first-time users
- Modern Indian grocery shopping UI with large, clear product images
- Bottom navigation: Home | Categories | Cart | Orders | Profile
- Only grocery, food, personal-care and household daily-use products
- Production-ready: clean code, responsive UI, proper navigation, validation, loading states, empty states, error handling

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Backend cart mutation endpoints return #invalidQuantity as the no-error sentinel because the frozen CartError type has no success variant; the frontend must treat it as success and re-read getCart().
- Public shopper reads must use non-admin-gated backend queries; adminListCoupons traps for non-admins, so listActiveCoupons was added as the public counterpart. Customer-facing and admin-gated hooks must use distinct query keys.
- tailwind.config.js maps the color key 'well' to var(--product-well); the correct utility is bg-well, not bg-product-well.
- Money is paise (bigint) and backend timestamps are nanosecond bigints; use formatPaise and timestampToDate before any Date operation.
- With Enhanced Migration and check-limit=1 on a fresh install, fold the init migration and the first real migration into the single latest pending file (OldActor={}) rather than adding a second file.
- OQL entity derivation needs the value-module import for every field type (IntValue for Int fields, NatValue, TextValue, BoolValue) or the build fails with M0230.
- Motoko has no triple-quoted string literal; long static Markdown must be built from single-quoted strings concatenated with # and explicit \n escapes.
- Text.trim takes a Pattern argument in mo:core — write t.trim(#text(" ")), not t.trim().
- For image upload without object storage, a hidden file input triggered by a button plus FileReader.readAsDataURL produces a usable imageUrl data URL.
- Tester-authored test files sit inside the app type-check scope; vi.fn() mocks need explicit typing against the real interface signatures or pnpm typecheck fails.
