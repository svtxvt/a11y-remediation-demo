import { screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { SettingsPage } from '../../src/after/SettingsPage';
import { renderPage } from './render';

async function openDialog() {
  const view = renderPage(SettingsPage);
  const trigger = screen.getByRole('button', { name: 'Invite a teammate' });
  trigger.focus();
  await view.user.keyboard('{Enter}');
  const dialog = screen.getByRole('dialog', { name: 'Invite a teammate' });
  return { ...view, trigger, dialog };
}

const getEmail = () => screen.getByRole('textbox', { name: 'Email address' });
const getSubmit = () => screen.getByRole('button', { name: 'Send invite' });

describe('AFTER: axe', () => {
  it('has no axe violations with the dialog open', async () => {
    await openDialog();
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no axe violations while validation errors are shown', async () => {
    const { user } = await openDialog();
    await user.click(getSubmit());
    expect(await axe(document.body)).toHaveNoViolations();
  });
});

describe('AFTER: dialog', () => {
  it('is a named modal dialog and focus moves into it', async () => {
    const { dialog } = await openDialog();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(getEmail()).toHaveFocus();
  });

  it('makes the page behind the dialog inert', async () => {
    const { trigger } = await openDialog();
    expect(trigger.closest('[inert]')).not.toBeNull();
  });

  it('keeps Tab and Shift+Tab inside the dialog', async () => {
    const { user, dialog } = await openDialog();

    for (let i = 0; i < 10; i++) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }

    const close = screen.getByRole('button', { name: 'Close' });
    close.focus();
    await user.tab({ shift: true });
    expect(getSubmit()).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const { user, trigger } = await openDialog();
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
    expect(trigger.closest('[inert]')).toBeNull();
  });

  it('closes with the named Close button and returns focus to the trigger', async () => {
    const { user, trigger } = await openDialog();
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });
});

describe('AFTER: labels and errors', () => {
  it('every field has a programmatic label', async () => {
    await openDialog();

    expect(getEmail()).toBeRequired();
    const roleGroup = screen.getByRole('group', { name: 'Role' });
    const radios = within(roleGroup).getAllByRole('radio');
    expect(radios.map((radio) => radio.getAttribute('value'))).toEqual(['member', 'admin', 'viewer']);
    expect(within(roleGroup).getByRole('radio', { name: 'Admin' })).toHaveAccessibleDescription(
      'Can also manage members and billing',
    );
  });

  it('invalid submit sets aria-invalid, links the error and focuses the first invalid field', async () => {
    const { user } = await openDialog();
    await user.click(getSubmit());

    const email = getEmail();
    expect(email).toHaveFocus();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    const errorId = email.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)).toHaveTextContent('Enter an email address.');
    expect(email).toHaveAccessibleDescription('Enter an email address.');
  });

  it('explains a badly formatted email', async () => {
    const { user } = await openDialog();
    await user.type(getEmail(), 'sam@{Enter}');

    expect(getEmail()).toHaveFocus();
    expect(getEmail()).toHaveAccessibleDescription(
      'Enter a valid email address, like name@company.com.',
    );
  });

  it('focuses the role group when only the role is missing', async () => {
    const { user } = await openDialog();
    await user.type(getEmail(), 'sam@example.com');
    await user.click(getSubmit());

    expect(getEmail()).not.toHaveAttribute('aria-invalid');
    const member = screen.getByRole('radio', { name: 'Member' });
    expect(member).toHaveFocus();
    expect(member).toHaveAttribute('aria-invalid', 'true');
    expect(member).toHaveAccessibleDescription(expect.stringContaining('Choose a role.'));
  });
});

describe('AFTER: switch', () => {
  it('exposes role="switch" with a name and aria-checked', async () => {
    await openDialog();
    const toggle = screen.getByRole('switch', { name: 'Send welcome email' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles with Space and Enter', async () => {
    const { user } = await openDialog();
    const toggle = screen.getByRole('switch', { name: 'Send welcome email' });
    toggle.focus();

    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveFocus();
  });
});

describe('AFTER: announcements', () => {
  it('announces success through a status region that exists before it is filled', async () => {
    const { user } = await openDialog();
    const status = screen.getByRole('status');
    expect(status).toBeEmptyDOMElement();

    await user.type(getEmail(), 'sam@example.com');
    await user.click(screen.getByRole('radio', { name: 'Admin' }));
    await user.click(getSubmit());

    expect(status).toHaveTextContent(
      'Invite sent to sam@example.com as Admin. A welcome email is on its way.',
    );
    expect(getSubmit()).toHaveFocus();
  });
});
