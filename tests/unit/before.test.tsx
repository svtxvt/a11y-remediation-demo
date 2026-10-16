// These tests PASS when the bugs are present. They document what the
// broken "before" version does, so the contrast with "after" is evidenced.
import { screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { SettingsPage } from '../../src/before/SettingsPage';
import { renderPage } from './render';

function getInviteTrigger() {
  // The trigger has no accessible name, so tests (and screen reader users)
  // can only find it by position.
  const membersCard = screen.getByRole('heading', { name: 'Members' }).closest('section')!;
  return within(membersCard).getByRole('button');
}

async function openWithKeyboard(user: ReturnType<typeof renderPage>['user']) {
  const trigger = getInviteTrigger();
  trigger.focus();
  await user.keyboard('{Enter}');
  return trigger;
}

describe('BEFORE: documented failures', () => {
  it('axe reports violations while the dialog is open', async () => {
    const { user } = renderPage(SettingsPage);
    await openWithKeyboard(user);

    const results = await axe(document.body);
    const ruleIds = results.violations.map((v) => v.id);

    expect(results.violations.length).toBeGreaterThan(0);
    expect(ruleIds).toEqual(expect.arrayContaining(['button-name', 'label']));
  });

  it('icon-only buttons have no accessible name', async () => {
    const { user } = renderPage(SettingsPage);
    const trigger = await openWithKeyboard(user);

    expect(trigger).toHaveAccessibleName('');
    const closeButton = screen.getByText('Invite a teammate').nextElementSibling;
    expect(closeButton).toHaveAccessibleName('');
  });

  it('the dialog has no dialog role and focus stays on the trigger', async () => {
    const { user } = renderPage(SettingsPage);
    const trigger = await openWithKeyboard(user);

    expect(screen.getByText('Invite a teammate')).toBeVisible();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('Tab moves to page controls hidden behind the backdrop', async () => {
    const { user } = renderPage(SettingsPage);
    await openWithKeyboard(user);

    await user.tab();
    expect(screen.getByRole('combobox', { name: 'Role for Marco Silva' })).toHaveFocus();
  });

  it('Escape does nothing and closing drops focus to the document body', async () => {
    const { user } = renderPage(SettingsPage);
    await openWithKeyboard(user);

    await user.keyboard('{Escape}');
    expect(screen.getByText('Invite a teammate')).toBeInTheDocument();

    const closeButton = screen.getByText('Invite a teammate').nextElementSibling as HTMLElement;
    await user.click(closeButton);
    expect(screen.queryByText('Invite a teammate')).toBeNull();
    expect(document.body).toHaveFocus();
  });

  it('fields have no programmatic labels', async () => {
    const { user } = renderPage(SettingsPage);
    await openWithKeyboard(user);

    expect(screen.queryByLabelText(/email/i)).toBeNull();
    expect(screen.queryByRole('radio', { name: 'Admin' })).toBeNull();
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toHaveAccessibleName('');
    }
  });

  it('errors are red text only: no aria-invalid, no aria-describedby, no focus move', async () => {
    const { user } = renderPage(SettingsPage);
    await openWithKeyboard(user);

    const submit = screen.getByRole('button', { name: 'Send invite' });
    await user.click(submit);

    expect(screen.getByText('Enter an email address.')).toBeVisible();
    expect(screen.getByText('Choose a role.')).toBeVisible();

    const email = screen.getByPlaceholderText('Email address');
    expect(email).not.toHaveAttribute('aria-invalid');
    expect(email).not.toHaveAttribute('aria-describedby');
    expect(email).not.toHaveFocus();
    expect(submit).toHaveFocus();
  });

  it('the switch is a clickable div: no role, no state, not focusable', async () => {
    const { user } = renderPage(SettingsPage);
    await openWithKeyboard(user);

    expect(screen.queryByRole('switch')).toBeNull();
    const switchDiv = screen.getByText('Send welcome email').previousElementSibling as HTMLElement;
    expect(switchDiv.tagName).toBe('DIV');
    expect(switchDiv).not.toHaveAttribute('role');
    expect(switchDiv).not.toHaveAttribute('aria-checked');
    switchDiv.focus();
    expect(switchDiv).not.toHaveFocus();
  });

  it('the success message is not in a live region', async () => {
    const { user } = renderPage(SettingsPage);
    await openWithKeyboard(user);

    await user.type(screen.getByPlaceholderText('Email address'), 'sam@example.com');
    await user.click(screen.getAllByRole('radio')[1]);
    await user.click(screen.getByRole('button', { name: 'Send invite' }));

    expect(screen.getByText(/Invite sent to sam@example.com as Admin/)).toBeVisible();
    expect(document.querySelector('[role="status"], [role="alert"], [aria-live]')).toBeNull();
  });
});
