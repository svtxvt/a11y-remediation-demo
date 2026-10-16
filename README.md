# Accessible "Invite a teammate" dialog — before/after remediation demo

**Status:** Personal demonstration, agent-assisted. Checked on 2026-10-16 with the keyboard and the browser accessibility tree (see Manual checklist).

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

Each fix commit changes only `src/after/` (and its tests). To read one: `git show <hash>`. To see all fixes at once: `git diff 3cbaf19 9968693 -- src/after`.

| # | Fix | What changed | WCAG 2.2 success criteria it addresses | Commit |
|---|-----|--------------|----------------------------------------|--------|
| 1 | **Dialog: semantics and focus** | `role="dialog"`, `aria-modal`, named by its heading. Focus moves to the email field on open, Tab and Shift+Tab cycle inside, the page behind is `inert`, Escape closes, focus returns to the trigger. Icon-only buttons get names, icons are hidden from assistive tech. | 2.1.1 Keyboard, 2.1.2 No Keyboard Trap (Escape and Close always exit), 2.4.3 Focus Order, 4.1.2 Name, Role, Value, 1.3.1 Info and Relationships, 1.1.1 Non-text Content | see commit `1aa9b29` |
| 2 | **Form: labels and errors** | Visible `<label>` for email instead of a placeholder, plus `type="email"` and `required`. Role radios in a `fieldset` with a `legend`, each with its own label and hint. The fieldset is a `radiogroup` with `aria-required`; the radios have no native `required`, which made Chromium report the empty group as invalid before any submit (found in the manual check, fixed in `9968693`). Invalid fields get `aria-invalid` and `aria-describedby` pointing at the error. On submit, focus moves to the first invalid field after the error state is rendered. | 3.3.1 Error Identification, 3.3.2 Labels or Instructions, 1.3.1 Info and Relationships, 4.1.2 Name, Role, Value | see commits `d51d6f2`, `9968693` |
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

Run on 2026-10-16 on macOS (re-run after the fix in `9968693`). Tool versions: React 19.3, Vite 8.3, TypeScript 6.0, Vitest 5.0, jest-axe 11 (axe-core 4.12.1), Playwright 1.64 with @axe-core/playwright 4.14 (axe-core 4.14.0), Chromium headless shell 156.

The `BEFORE` tests pass while the bugs exist. They document the failures, so the contrast is checked, not just described.

`npx vitest run --reporter=verbose --no-file-parallelism`:

```text
 ✓ tests/unit/after.test.tsx > AFTER: axe > has no axe violations with the dialog open
 ✓ tests/unit/after.test.tsx > AFTER: axe > has no axe violations while validation errors are shown
 ✓ tests/unit/after.test.tsx > AFTER: dialog > is a named modal dialog and focus moves into it
 ✓ tests/unit/after.test.tsx > AFTER: dialog > makes the page behind the dialog inert
 ✓ tests/unit/after.test.tsx > AFTER: dialog > keeps Tab and Shift+Tab inside the dialog
 ✓ tests/unit/after.test.tsx > AFTER: dialog > closes on Escape and returns focus to the trigger
 ✓ tests/unit/after.test.tsx > AFTER: dialog > closes with the named Close button and returns focus to the trigger
 ✓ tests/unit/after.test.tsx > AFTER: labels and errors > every field has a programmatic label
 ✓ tests/unit/after.test.tsx > AFTER: labels and errors > does not report any field as invalid before the first submit
 ✓ tests/unit/after.test.tsx > AFTER: labels and errors > invalid submit sets aria-invalid, links the error and focuses the first invalid field
 ✓ tests/unit/after.test.tsx > AFTER: labels and errors > explains a badly formatted email
 ✓ tests/unit/after.test.tsx > AFTER: labels and errors > focuses the role group when only the role is missing
 ✓ tests/unit/after.test.tsx > AFTER: switch > exposes role="switch" with a name and aria-checked
 ✓ tests/unit/after.test.tsx > AFTER: switch > toggles with Space and Enter
 ✓ tests/unit/after.test.tsx > AFTER: announcements > announces success through a status region that exists before it is filled
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > axe reports violations while the dialog is open
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > icon-only buttons have no accessible name
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > the dialog has no dialog role and focus stays on the trigger
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > Tab moves to page controls hidden behind the backdrop
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > Escape does nothing and closing drops focus to the document body
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > fields have no programmatic labels
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > errors are red text only: no aria-invalid, no aria-describedby, no focus move
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > the switch is a clickable div: no role, no state, not focusable
 ✓ tests/unit/before.test.tsx > BEFORE: documented failures > the success message is not in a live region

 Test Files  2 passed (2)
      Tests  24 passed (24)
```

`npm run e2e` (Chromium, production build):

```text
Running 5 tests using 4 workers

  ✓  4 [chromium] › e2e/after.spec.ts:5:3 › AFTER (/after) › keyboard-only invite flow
  ✓  2 [chromium] › e2e/after.spec.ts:62:3 › AFTER (/after) › axe: no violations with the dialog open
BEFORE axe violations (2 rules): button-name [critical] x2, label [critical] x3
  ✓  3 [chromium] › e2e/after.spec.ts:71:3 › AFTER (/after) › axe: no violations with validation errors shown
  ✓  1 [chromium] › e2e/before.spec.ts:7:3 › BEFORE (/before) › axe: reports violations with the dialog open
  ✓  5 [chromium] › e2e/before.spec.ts:20:3 › BEFORE (/before) › keyboard: focus stays behind, Escape does nothing, switch unreachable

  5 passed
```

Both suites use axe's default rule set. In Chromium that includes color contrast, which jest-axe turns off in jsdom.

## Manual checklist

Steps are for `/after`. Each row should fail or behave worse on `/before`, which is a useful sanity check.

**How it was run.** On 2026-10-16 the keyboard rows were run in Chromium (Playwright 1.64, Chromium headless shell 156, 1000×760) with real key presses, checking the focused element, its `:focus-visible` outline and a screenshot at each step. The accessibility-tree rows read Chromium's accessibility tree, which is what a screen reader receives from the browser.

Before running it yourself: in Safari, turn on Settings > Advanced > "Press Tab to highlight each item". On macOS, turn on System Settings > Keyboard > "Keyboard navigation". VoiceOver toggles with Cmd+F5. VoiceOver wording differs between versions, so judge the meaning, not the exact words.

### Keyboard only

| # | Steps | Expected | Result | Date | Browser+AT |
|---|-------|----------|--------|------|------------|
| K1 | Load `/after`, press Tab until the add-person button is focused, press Enter | Focus ring is visible on the button; dialog opens with focus in "Email address" | Pass: 4th Tab stop, 3px outline; dialog opens, focus in Email | 2026-10-16 | Chromium 156, keyboard |
| K2 | Press Tab and Shift+Tab repeatedly | Focus cycles Close, Email, Role, switch, Send invite, and never leaves the dialog | Pass: Tab and Shift+Tab both cycle the five stops, 7 presses each way | 2026-10-16 | Chromium 156, keyboard |
| K3 | Leave email empty, press Enter | Error shows under Email, focus stays in Email | Pass: "Enter an email address." linked by `aria-describedby`, `aria-invalid="true"`, focus in Email | 2026-10-16 | Chromium 156, keyboard |
| K4 | Type a valid email, Tab to Role, use arrow keys; Tab to the switch, press Space | Role selection follows the arrows; the switch flips and looks on or off accordingly | Pass: Down selects Admin, then Viewer; Space turns the switch off, Enter turns it on | 2026-10-16 | Chromium 156, keyboard |
| K5 | Tab to "Send invite", press Enter | Green "Invite sent to ..." message appears, focus stays on the button | Pass: "Invite sent to alex@example.com as Viewer. A welcome email is on its way."; focus stays on Send invite | 2026-10-16 | Chromium 156, keyboard |
| K6 | Press Escape | Dialog closes, focus is back on the add-person button with a visible ring | Pass: same with the Close button | 2026-10-16 | Chromium 156, keyboard |
| K7 | Repeat K1, K2 and K6 on `/before` | Focus stays behind the dialog, Tab reaches hidden controls, Escape does nothing (expected failures) | Fails as expected: focus stays on the trigger, next Tab goes to "Role for Marco Silva" behind the backdrop, Escape leaves the dialog open, the switch is never a Tab stop | 2026-10-16 | Chromium 156, keyboard |

### Accessibility tree (what assistive technology receives)

| # | State | Expected | Result | Date | Browser |
|---|-------|----------|--------|------|---------|
| A1 | `/after`, page | Add-person button is named | Pass: `button "Invite a teammate"` | 2026-10-16 | Chromium 156 |
| A2 | `/after`, dialog open | A named modal dialog; page behind is not in the tree | Pass: `dialog "Invite a teammate"`, modal; page headings, links and selects are absent | 2026-10-16 | Chromium 156 |
| A3 | `/after`, dialog open | Email is a named, required field and nothing is invalid yet | Pass: `textbox "Email address"`, required, not invalid; role radios not invalid (after `9968693`) | 2026-10-16 | Chromium 156 |
| A4 | `/after`, dialog open | Role radios have names, hints and a group name | Pass: `radiogroup "Role"`, required; `radio "Member"` with description "Can create and edit projects", same for Admin and Viewer | 2026-10-16 | Chromium 156 |
| A5 | `/after`, empty submit | Errors are tied to their fields | Pass: Email invalid, description "Enter an email address."; radios invalid, description starts with "Choose a role." | 2026-10-16 | Chromium 156 |
| A6 | `/after`, dialog open | Switch has a role, name and state | Pass: `switch "Send welcome email"`, checked true, then false after Space | 2026-10-16 | Chromium 156 |
| A7 | `/after`, dialog open | Success region exists before it is filled | Pass: `status` with `live="polite"`, present on open | 2026-10-16 | Chromium 156 |
| A8 | `/before`, dialog open | Expected failures | Fails as expected: buttons with no name, radios with no name, no dialog role, page behind still in the tree | 2026-10-16 | Chromium 156 |

### Try it with VoiceOver on macOS (Safari)

| # | Steps | Expected |
|---|-------|----------|
| V1 | On `/after`, move VoiceOver to the add-person button | Reads "Invite a teammate, button" |
| V2 | Press VO+Space to open | Announces a dialog named "Invite a teammate" and lands on "Email address, edit text, required" |
| V3 | Browse with VO+Right Arrow past the last control | The VoiceOver cursor stays inside the dialog; page content behind is not reachable |
| V4 | Submit with the email empty | Hears the field as invalid plus "Enter an email address." |
| V5 | Move to the Role radios | Hears each radio's name ("Member", "Admin", "Viewer"), its hint, and the group name "Role" |
| V6 | Move to the switch and press VO+Space | Hears "Send welcome email, switch, on", then "off" after toggling |
| V7 | Complete the form and submit | Hears "Invite sent to ..." without focus moving |
| V8 | Press Escape | Dialog closes, VoiceOver is back on "Invite a teammate, button" |
| V9 | Repeat V1, V2, V4 and V7 on `/before` | Unnamed "button", no dialog announcement, silent errors and success (expected failures) |

## Limits

- Zero axe violations does not mean WCAG conformance. Automated rules catch only part of the problems; in `/before` axe flagged only the unnamed buttons and the unlabeled radios.
- This covers one component on one small page, not an application.
- No legal or standards compliance claim of any kind (ADA, EAA, Section 508, EN 301 549 or similar).
- The recorded results cover the keyboard and the accessibility tree in Chromium. No claims about NVDA, JAWS, TalkBack, VoiceOver on iOS, or Windows browsers.
- Not covered: zoom and reflow, high contrast or forced colors modes, reduced motion, speech input.
- The dialog relies on the `inert` attribute, which current browsers support. A native `<dialog>` with `showModal()` is a good alternative; this demo keeps a custom dialog because that is what many React codebases already have.
- `/before` is broken on purpose. Do not copy it.
