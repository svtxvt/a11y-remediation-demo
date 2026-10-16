import { useId, useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { Modal } from './Modal';
import { Toggle } from './Toggle';
import styles from './invite.module.css';

const ROLES = [
  { value: 'member', label: 'Member', hint: 'Can create and edit projects' },
  { value: 'admin', label: 'Admin', hint: 'Can also manage members and billing' },
  { value: 'viewer', label: 'Viewer', hint: 'Can view projects but not edit them' },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = { email?: string; role?: string };

function validate(email: string, role: string): Errors {
  const errors: Errors = {};
  const trimmed = email.trim();
  if (!trimmed) {
    errors.email = 'Enter an email address.';
  } else if (!EMAIL_PATTERN.test(trimmed)) {
    errors.email = 'Enter a valid email address, like name@company.com.';
  }
  if (!role) {
    errors.role = 'Choose a role.';
  }
  return errors;
}

type InviteDialogProps = {
  onClose: () => void;
};

export function InviteDialog({ onClose }: InviteDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [sendWelcome, setSendWelcome] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const firstRoleRef = useRef<HTMLInputElement>(null);

  const id = useId();
  const emailId = `${id}-email`;
  const emailErrorId = `${id}-email-error`;
  const roleErrorId = `${id}-role-error`;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(email, role);
    // Render aria-invalid and the messages before moving focus, so the
    // field is announced together with its error.
    flushSync(() => setErrors(nextErrors));
    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }
    if (nextErrors.role) {
      firstRoleRef.current?.focus();
      return;
    }

    const roleLabel = ROLES.find((r) => r.value === role)?.label;
    setMessage(
      `Invite sent to ${email.trim()} as ${roleLabel}.` +
        (sendWelcome ? ' A welcome email is on its way.' : ''),
    );
    setEmail('');
    setRole('');
  }

  return (
    <Modal title="Invite a teammate" onClose={onClose} initialFocusRef={emailRef}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor={emailId} className={styles.label}>
            Email address
          </label>
          <input
            ref={emailRef}
            id={emailId}
            type="email"
            required
            className={errors.email ? `${styles.input} ${styles.inputError}` : styles.input}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? emailErrorId : undefined}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setMessage('');
            }}
          />
          {errors.email && (
            <p id={emailErrorId} className={styles.error}>
              {errors.email}
            </p>
          )}
        </div>

        {/* No native `required` on the radios: Chromium then reports an empty
            group as invalid as soon as the dialog opens, before any submit.
            The group carries aria-required instead. */}
        <fieldset className={styles.fieldset} role="radiogroup" aria-required="true">
          <legend className={styles.label}>Role</legend>
          {ROLES.map((r, index) => {
            const radioId = `${id}-role-${r.value}`;
            const hintId = `${radioId}-hint`;
            return (
              <div className={styles.radioRow} key={r.value}>
                <input
                  ref={index === 0 ? firstRoleRef : undefined}
                  id={radioId}
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={role === r.value}
                  onChange={() => setRole(r.value)}
                  aria-invalid={errors.role ? true : undefined}
                  aria-describedby={errors.role ? `${roleErrorId} ${hintId}` : hintId}
                />
                <span className={styles.radioText}>
                  <label htmlFor={radioId}>{r.label}</label>
                  <span id={hintId} className={styles.hint}>
                    {r.hint}
                  </span>
                </span>
              </div>
            );
          })}
          {errors.role && (
            <p id={roleErrorId} className={styles.error}>
              {errors.role}
            </p>
          )}
        </fieldset>

        <Toggle checked={sendWelcome} onChange={setSendWelcome} label="Send welcome email" />

        <button type="submit" className={styles.primary}>
          Send invite
        </button>

        {/* The live region is always in the DOM, so screen readers are already
            watching it when the message text is added. */}
        <p role="status" className={styles.success}>
          {message}
        </p>
      </form>
    </Modal>
  );
}
