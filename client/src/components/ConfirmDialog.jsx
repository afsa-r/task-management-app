import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', busy, onConfirm, onCancel }) {
  const cancelRef = useRef();
  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);
  return (
    <div className="overlay" onMouseDown={onCancel}>
      <div className="modal small" role="alertdialog" aria-modal="true" aria-labelledby="cd-title" onMouseDown={(e) => e.stopPropagation()}>
        <h2 id="cd-title">{title}</h2>
        <p className="muted">{message}</p>
        <div className="modal-actions">
          <button ref={cancelRef} className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
