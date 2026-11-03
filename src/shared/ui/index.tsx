import { useEffect, useRef, type ReactNode } from 'react';
import { X, AlertCircle, LoaderCircle } from 'lucide-react';
import { useI18n } from '../i18n';
export function Badge({ children, tone = '' }: { children: ReactNode; tone?: string }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function ErrorBox({ error, retry }: { error: unknown; retry?: () => void }) {
  return (
    <div className="error-box" role="alert">
      <AlertCircle size={18} />
      <span>{error instanceof Error ? error.message : 'Something went wrong.'}</span>
      {retry && <button onClick={retry}>Try again</button>}
    </div>
  );
}
export function Loading() {
  const { t } = useI18n();
  return (
    <div className="empty" role="status">
      <LoaderCircle className="spin" size={24} />
      {t.loading}
    </div>
  );
}
export function Empty({ children }: { children?: ReactNode }) {
  const { t } = useI18n();
  return <div className="empty">{children || t.empty}</div>;
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { t } = useI18n();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    dialog.current?.showModal();
    return () => previous?.focus();
  }, []);
  return (
    <dialog
      ref={dialog}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="modal-title"
    >
      <header>
        <h2 id="modal-title">{title}</h2>
        <button className="icon-button" aria-label={t.close} onClick={onClose}>
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
