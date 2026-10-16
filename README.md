# Accessible "Invite a teammate" dialog — before/after remediation demo

**Status:** Personal demonstration, agent-assisted. Manual verification: PENDING (owner)

A tiny settings page with an "Invite a teammate" dialog, built twice in React + TypeScript:

- `/before` ([src/before/](src/before/)) has common accessibility bugs, the kind that show up in real React apps.
- `/after` ([src/after/](src/after/)) is the same UI with the bugs fixed, one commit per fix area.

## What users experienced before

- **Keyboard users get lost.** Enter opens the dialog, but focus stays on the button behind it. The next Tab lands on dropdowns behind the dark backdrop. Escape does nothing. Closing the dialog drops focus to the top of the page.
- **Screen reader users hear unlabeled controls.** The add and close buttons are icons only, so they are read as just "button". The dialog is not announced as a dialog and has no name, and the page behind it stays browsable.
- **Errors are not announced.** The email field relies on a placeholder, the role radios have no labels, and errors are red text that is not linked to its field. Nothing is marked invalid and focus does not move to the problem.
- **The switch is unusable without a mouse.** "Send welcome email" is a `div` with `onClick`: it cannot be reached with Tab, cannot be toggled with the keyboard, and has no on/off state for assistive tech.
- **Success is silent.** "Invite sent" appears on screen, but screen readers say nothing.

axe found only 2 rule failures in `/before` (unnamed buttons, unlabeled radios). Everything else on this list is covered only by behavior tests and manual checks, which is why both are here.

## The fixes

Each fix commit changes only `src/after/`. To read one: `git show <hash>`. To see all fixes at once: `git diff 3cbaf19 28ae9e7 -- src/after`.

| # | Fix | What changed | WCAG 2.2 success criteria it addresses | Commit |
|---|-----|--------------|----------------------------------------|--------|
| 1 | **Dialog: semantics and focus** | `role="dialog"`, `aria-modal`, named by its heading. Focus moves to the email field on open, Tab and Shift+Tab cycle inside, the page behind is `inert`, Escape closes, focus returns to the trigger. Icon-only buttons get names, icons are hidden from assistive tech. | 2.1.1 Keyboard, 2.1.2 No Keyboard Trap (Escape and Close always exit), 2.4.3 Focus Order, 4.1.2 Name, Role, Value, 1.3.1 Info and Relationships, 1.1.1 Non-text Content | see commit `1aa9b29` |
| 2 | **Form: labels and errors** | Visible `<label>` for email instead of a placeholder, plus `type="email"` and `required`. Role radios in a `fieldset` with a `legend`, each with its own label and hint. Invalid fields get `aria-invalid` and `aria-describedby` pointing at the error. On submit, focus moves to the first invalid field after the error state is rendered. | 3.3.1 Error Identification, 3.3.2 Labels or Instructions, 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value | see commit `d51d6f2` |
| 3 | **Switch: keyboard and state** | A native `<button type="button" role="switch" aria-checked>`. Focusable, toggles with Space and Enter, the visible text is its name. | 2.1.1 Keyboard, 4.1.2 Name, Role, Value | see commit `40099fd` |
| 4 | Announcements | The success message goes into a `role="status"` region that is in the DOM from the start, so it is read out. Focus stays on the submit button. | 4.1.3 Status Messages | see commit `28ae9e7` |

The mapping shows which criteria each fix is aimed at. It is not a conformance claim (see Limits).

## How to run

Node 22.12 or newer.

```bash
npm install
npm run dev                       # open http://localhost:5173/before and /after
npm run build                     # type check + production build
npm test                          # Vitest + Testing Library + jest-axe (jsdom)
npx playwright install chromium   # once
npm run e2e                       # builds, serves on :4173, runs Chromium tests
```

Layout: `src/before/` (broken, untouched after the first commit), `src/after/` (fixed), `tests/unit/` (Vitest), `e2e/` (Playwright).

## Automated evidence

Run on 2026-10-16 on macOS. Tool versions: React 19.3, Vite 8.3, TypeScript 6.0, Vitest 5.0, jest-axe 11 (axe-core 4.12.1), Playwright 1.64 with @axe-core/playwright 4.14 (axe-core 4.14.0), Chromium headless shell 156.

The `BEFORE` tests pass while the bugs exist. They document the failures, so the contrast is checked, not just described.

`npx vitest run --reporter=verbose --no-file-parallelism`:

```text
 ✓ tests/unit/after.test.tsx > AFTER: axe > has no axe violations with the dialog open 152ms
 ✓ tests/unit/after.test.tsx > AFTER: axe > has no axe violations while validation errors are shown 70ms
 ✓ tests/unit/after.test.tsx > AFTER: dialog > is a named modal dialog and focus moves into it 17ms
 ✓ tests/unit/after.test.tsx > AFTER: dialog > makes the page behind the dialog inert 13ms
 ✓ tests/unit/after.test.tsx > AFTER: dialog > keeps Tab and Shift+Tab inside the dialog 90ms
 ✓ tests/unit/after.test.tsx > AFTER: dialog > closes on Escape and returns focus to the trigger 16ms
 ✓ tests/unit/after.test.tsx > AFTER: dialog > closes with the named Close button and returns focus to the trigger 21ms
 ✓ tests/unit/after.test.tsx > AFTER: labels and errors > every field has a programmatic label 17ms
 ✓ tests/unit/after.test.tsx > AFTER: labels and errors > invalid submit sets aria-invalid, links the error and focuses the first invalid field 25ms
 ✓ tests/unit/after.test.tsx > AFTER: labels and errors > explains a badly formatted email 34ms
 ✓ tests/unit/after.test.tsx > AFTER: labels and errors > focuses the role group when only the role is missing 67ms
 ✓ tests/unit/after.test.tsx > AFTER: switch > exposes role="switch" with a name and aria-checked 11ms
 ✓ tests/unit/after.test.tsx > AFTER: switch > toggles with Space and Enter 22ms
 ✓ tests/unit/after.test.tsx > AFTER: announcements > announces success through a status region that exists before it is filled 75ms
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > axe reports violations while the dialog is open 150ms
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > icon-only buttons have no accessible name 20ms
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > the dialog has no dialog role and focus stays on the trigger 21ms
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > Tab moves to page controls hidden behind the backdrop 22ms
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > Escape does nothing and closing drops focus to the document body 26ms
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > fields have no programmatic labels 15ms
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > errors are red text only: no aria-invalid, no aria-describedby, no focus move 26ms
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > the switch is a clickable div: no role, no state, not focusable 11ms
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > the success message is not in a live region 80ms

 Test Files  2 passed (2)
      Tests  23 passed (23)
```

`npm run e2e` (Chromium, production build):

```text
Running 5 tests using 4 workers

  ✓  2 [chromium] › e2e/after.spec.ts:5:3 › AFTER (/after) › keyboard-only invite flow (806ms)
BEFORE axe violations (2 rules): button-name [critical] x2, label [critical] x3
  ✓  3 [chromium] › e2e/after.spec.ts:62:3 › AFTER (/after) › axe: no violations with the dialog open (1.1s)
  ✓  1 [chromium] › e2e/after.spec.ts:71:3 › AFTER (/after) › axe: no violations with validation errors shown (1.1s)
  ✓  4 [chromium] › e2e/before.spec.ts:7:3 › BEFORE (/before) › axe: reports violations with the dialog open (1.1s)
  ✓  5 [chromium] › e2e/before.spec.ts:20:3 › BEFORE (/before) › keyboard: focus stays behind, Escape does nothing, switch unreachable (355ms)

  5 passed (4.2s)
```

Both suites use axe's default rule set. In Chromium that includes color contrast, which jest-axe turns off in jsdom.

## Manual checklist (owner fills)

Not done yet. Steps are for `/after`. Each row should fail or behave worse on `/before`, which is a useful sanity check.

Before starting: in Safari, turn on Settings > Advanced > "Press Tab to highlight each item". On macOS, turn on System Settings > Keyboard > "Keyboard navigation". VoiceOver toggles with Cmd+F5. VoiceOver wording differs between versions, so judge the meaning, not the exact words.

### Keyboard only

| # | Steps | Expected | Result | Date | Browser+AT |
|---|-------|----------|--------|------|------------|
| K1 | Load `/after`, press Tab until the add-person button is focused, press Enter | Focus ring is visible on the button; dialog opens with focus in "Email address" | | | |
| K2 | Press Tab and Shift+Tab repeatedly | Focus cycles Close, Email, Role, switch, Send invite, and never leaves the dialog | | | |
| K3 | Leave email empty, press Enter | Error shows under Email, focus stays in Email | | | |
| K4 | Type a valid email, Tab to Role, use arrow keys; Tab to the switch, press Space | Role selection follows the arrows; the switch flips and looks on or off accordingly | | | |
| K5 | Tab to "Send invite", press Enter | Green "Invite sent to ..." message appears, focus stays on the button | | | |
| K6 | Press Escape | Dialog closes, focus is back on the add-person button with a visible ring | | | |
| K7 | Repeat K1, K2 and K6 on `/before` | Focus stays behind the dialog, Tab reaches hidden controls, Escape does nothing (expected failures) | | | |

### VoiceOver on macOS (Safari)

| # | Steps | Expected | Result | Date | Browser+AT |
|---|-------|----------|--------|------|------------|
| V1 | On `/after`, move VoiceOver to the add-person button | Reads "Invite a teammate, button" | | | |
| V2 | Press VO+Space to open | Announces a dialog named "Invite a teammate" and lands on "Email address, edit text, required" | | | |
| V3 | Browse with VO+Right Arrow past the last control | The VoiceOver cursor stays inside the dialog; page content behind is not reachable | | | |
| V4 | Submit with the email empty | Hears the field as invalid plus "Enter an email address." | | | |
| V5 | Move to the Role radios | Hears each radio's name ("Member", "Admin", "Viewer"), its hint, and the group name "Role" | | | |
| V6 | Move to the switch and press VO+Space | Hears "Send welcome email, switch, on", then "off" after toggling | | | |
| V7 | Complete the form and submit | Hears "Invite sent to ..." without focus moving | | | |
| V8 | Press Escape | Dialog closes, VoiceOver is back on "Invite a teammate, button" | | | |
| V9 | Repeat V1, V2, V4 and V7 on `/before` | Unnamed "button", no dialog announcement, silent errors and success (expected failures) | | | |

## Limits

- Zero axe violations does not mean WCAG conformance. Automated rules catch only part of the problems; in `/before` axe flagged only the unnamed buttons and the unlabeled radios.
- This covers one component on one small page, not an application.
- No legal or standards compliance claim of any kind (ADA, EAA, Section 508, EN 301 549 or similar).
- Manual checks were intended for keyboard only and VoiceOver on macOS. No claims about NVDA, JAWS, TalkBack, VoiceOver on iOS, or Windows browsers.
- Not covered: zoom and reflow, high contrast or forced colors modes, reduced motion, speech input.
- The dialog relies on the `inert` attribute, which current browsers support. A native `<dialog>` with `showModal()` is a good alternative; this demo keeps a custom dialog because that is what many React codebases already have.
- `/before` is broken on purpose. Do not copy it.
