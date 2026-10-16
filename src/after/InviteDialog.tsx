import { useRef, useState, type FormEvent } from 'react';
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(email, role);
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.role) return;

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
          <input
            ref={emailRef}
            type="text"
            className={errors.email ? `${styles.input} ${styles.inputError}` : styles.input}
            placeholder="Email address"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setMessage('');
            }}
          />
          {errors.email && <div className={styles.error}>{errors.email}</div>}
        </div>

        <div className={styles.field}>
          <div className={styles.label}>Role</div>
          {ROLES.map((r) => (
            <div className={styles.radioRow} key={r.value}>
              <input
                type="radio"
                name="role"
                value={r.value}
                checked={role === r.value}
                onChange={() => setRole(r.value)}
              />
              <span className={styles.radioText}>
                <span>{r.label}</span>
                <span className={styles.hint}>{r.hint}</span>
              </span>
            </div>
          ))}
          {errors.role && <div className={styles.error}>{errors.role}</div>}
        </div>

        <Toggle checked={sendWelcome} onChange={setSendWelcome} label="Send welcome email" />

        <button type="submit" className={styles.primary}>
          Send invite
        </button>

        {message && <div className={styles.success}>{message}</div>}
      </form>
    </Modal>
  );
}
