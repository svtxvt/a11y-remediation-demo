import styles from './invite.module.css';

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export function Toggle({ checked, onChange, label }: ToggleProps) {
  // A native <button> is focusable and fires click on Enter and Space.
  // role="switch" with aria-checked exposes it as an on/off control,
  // and the visible text inside is its accessible name.
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`${styles.switchRow} ${styles.switchButton}`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={checked ? `${styles.switch} ${styles.switchOn}` : styles.switch}
        aria-hidden="true"
      >
        <span className={styles.knob} />
      </span>
      <span className={styles.switchLabel}>{label}</span>
    </button>
  );
}
