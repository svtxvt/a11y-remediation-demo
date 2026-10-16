// These tests PASS when the bugs are present. They record what the
// broken "before" version does in a real browser.
import { expect, test } from '@playwright/test';
import { isFocused, scanWithAxe, tabUntilFocused } from './helpers';

test.describe('BEFORE (/before)', () => {
  test('axe: reports violations with the dialog open', async ({ page }, testInfo) => {
    await page.goto('/before');
    // The trigger has no accessible name, so it can only be found by position.
    await page.locator('section').getByRole('button').first().click();
    await expect(page.getByText('Invite a teammate', { exact: true })).toBeVisible();

    const violations = await scanWithAxe(page, testInfo, 'axe-before-dialog-open');
    const summary = violations.map((v) => `${v.id} [${v.impact}] x${v.nodes.length}`);
    console.log(`BEFORE axe violations (${violations.length} rules): ${summary.join(', ')}`);

    expect(violations.length).toBeGreaterThan(0);
  });

  test('keyboard: focus stays behind, Escape does nothing, switch unreachable', async ({ page }) => {
    await page.goto('/before');

    const trigger = page.locator('section').getByRole('button').first();
    await tabUntilFocused(page, trigger);
    await page.keyboard.press('Enter');
    const title = page.getByText('Invite a teammate', { exact: true });
    await expect(title).toBeVisible();

    // Focus did not move into the dialog.
    await expect(trigger).toBeFocused();

    // The next Tab lands on a control hidden behind the backdrop.
    await page.keyboard.press('Tab');
    await expect(page.getByRole('combobox', { name: 'Role for Marco Silva' })).toBeFocused();

    // Escape does not close the dialog.
    await page.keyboard.press('Escape');
    await expect(title).toBeVisible();

    // Tabbing through the whole page never reaches the switch.
    const switchDiv = page.getByText('Send welcome email').locator('xpath=preceding-sibling::div');
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      expect(await isFocused(switchDiv)).toBe(false);
    }
  });
});
