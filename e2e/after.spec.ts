import { expect, test } from '@playwright/test';
import { scanWithAxe, tabUntilFocused } from './helpers';

test.describe('AFTER (/after)', () => {
  test('keyboard-only invite flow', async ({ page }) => {
    await page.goto('/after');

    const trigger = page.getByRole('button', { name: 'Invite a teammate' });
    await tabUntilFocused(page, trigger);
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog', { name: 'Invite a teammate' });
    await expect(dialog).toBeVisible();
    const email = dialog.getByRole('textbox', { name: 'Email address' });
    await expect(email).toBeFocused();

    // Empty submit with Enter: the field is marked invalid, keeps focus
    // and its error is its accessible description.
    await page.keyboard.press('Enter');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAccessibleDescription('Enter an email address.');
    await expect(email).toBeFocused();

    await page.keyboard.type('sam@example.com');

    // Role: Tab into the radio group, arrow key to choose.
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('radio', { name: 'Member' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    const admin = dialog.getByRole('radio', { name: 'Admin' });
    await expect(admin).toBeFocused();
    await expect(admin).toBeChecked();

    // Switch: reachable with Tab, toggles with Space.
    await page.keyboard.press('Tab');
    const toggle = dialog.getByRole('switch', { name: 'Send welcome email' });
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    // Submit: the message lands in the status region, focus stays put.
    await page.keyboard.press('Tab');
    const submit = dialog.getByRole('button', { name: 'Send invite' });
    await expect(submit).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(dialog.getByRole('status')).toHaveText('Invite sent to sam@example.com as Admin.');
    await expect(submit).toBeFocused();

    // Focus is trapped: Tab from the last control wraps to the first.
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(submit).toBeFocused();

    // Escape closes and focus returns to the trigger.
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('axe: no violations with the dialog open', async ({ page }, testInfo) => {
    await page.goto('/after');
    await page.getByRole('button', { name: 'Invite a teammate' }).click();
    await expect(page.getByRole('dialog', { name: 'Invite a teammate' })).toBeVisible();

    const violations = await scanWithAxe(page, testInfo, 'axe-after-dialog-open');
    expect(violations).toEqual([]);
  });

  test('axe: no violations with validation errors shown', async ({ page }, testInfo) => {
    await page.goto('/after');
    await page.getByRole('button', { name: 'Invite a teammate' }).click();
    const dialog = page.getByRole('dialog', { name: 'Invite a teammate' });
    await dialog.getByRole('button', { name: 'Send invite' }).click();
    await expect(dialog.getByText('Choose a role.')).toBeVisible();

    const violations = await scanWithAxe(page, testInfo, 'axe-after-errors');
    expect(violations).toEqual([]);
  });
});
