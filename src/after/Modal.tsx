import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from './icons';
import styles from './invite.module.css';

const TABBABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getTabbable(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(TABBABLE));
}

type ModalProps = {
  title: string;
  onClose: () => void;
  /** Element to focus when the dialog opens. Defaults to the first tabbable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
};

export function Modal({ title, onClose, initialFocusRef, children }: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Remember where focus was (the trigger) so we can return it on close.
    const returnFocusTo =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Make the rest of the page inert: no Tab stops and no screen reader
    // browsing behind the dialog. The backdrop is a direct child of <body>.
    const backdrop = dialog.parentElement;
    const background = Array.from(document.body.children).filter(
      (element) => element !== backdrop && !element.hasAttribute('inert'),
    );
    background.forEach((element) => element.setAttribute('inert', ''));

    // Move focus into the dialog.
    const target = initialFocusRef?.current ?? getTabbable(dialog)[0] ?? dialog;
    target.focus();

    return () => {
      background.forEach((element) => element.removeAttribute('inert'));
      returnFocusTo?.focus();
    };
  }, [initialFocusRef]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    // Keep Tab and Shift+Tab cycling inside the dialog.
    const tabbable = getTabbable(event.currentTarget);
    if (tabbable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = tabbable[0];
    const last = tabbable[tabbable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === event.currentTarget)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div className={styles.backdrop}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={styles.dialog}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.dialogHeader}>
          <h2 id={titleId} className={styles.dialogTitle}>
            {title}
          </h2>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
