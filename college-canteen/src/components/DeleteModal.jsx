import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose, onConfirm, food, isDeleting }) {
  if (!isOpen || !food) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-content modal-content-sm animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="delete-modal-header">
          <div className="delete-icon-wrap">
            <AlertTriangle size={24} />
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="delete-modal-body">
          <h3 className="delete-modal-title">Delete Food Item?</h3>
          <p className="delete-modal-desc">
            Are you sure you want to delete <strong className="text-white">"{food.name}"</strong>?
            This will permanently remove the item from the Firestore <code className="inline-code">foods</code> collection.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting from Firestore...' : 'Yes, Delete Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
