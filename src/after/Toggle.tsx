import styles from './invite.module.css';

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <div className={styles.switchRow}>
      <div
        className={checked ? `${styles.switch} ${styles.switchOn}` : styles.switch}
        onClick={() => onChange(!checked)}
      >
        <div className={styles.knob} />
      </div>
      <span className={styles.switchLabel}>{label}</span>
    </div>
  );
}
