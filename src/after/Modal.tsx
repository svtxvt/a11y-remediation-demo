import type { ReactNode } from 'react';
import { CloseIcon } from './icons';
import styles from './invite.module.css';

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <div className={styles.dialogTitle}>{title}</div>
          <button type="button" className={styles.iconButton} onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
