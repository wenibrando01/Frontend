import React from "react";

const ConfirmDialog = ({
  open,
  title,
  message,
  meta,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmClassName = "admin-btn danger",
  isLoading = false,
}) => {
  if (!open) return null;

  return (
    <div
      className="admin-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-confirm-title"
      onClick={onCancel}
    >
      <div className="admin-modal admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="app-confirm-title" className="admin-confirm-title">{title}</h2>

        {message && <p className="admin-confirm-sub">{message}</p>}

        {meta && (
          <div className="admin-confirm-card">
            <span className="admin-confirm-meta">{meta}</span>
          </div>
        )}

        <div className="admin-modal-actions">
          <button type="button" className={confirmClassName} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Processing..." : confirmText}
          </button>
          <button type="button" className="admin-btn" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
