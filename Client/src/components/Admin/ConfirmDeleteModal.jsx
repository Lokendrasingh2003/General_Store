import styles from './ConfirmDeleteModal.module.css';

const ConfirmDeleteModal = ({ 
  isOpen, 
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item?',
  itemName = null,
  onConfirm, 
  onCancel, 
  isLoading = false,
  isDangerous = true
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <span className={styles.warningIcon}>⚠️</span> {title}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.message}>{message}</p>
          {itemName && (
            <div className={styles.itemName}>
              <strong>Item: </strong>{itemName}
            </div>
          )}
          <div className={styles.warningBox}>
            <p className={styles.warningText}>
              ⚠️ This action <strong>cannot be undone</strong>. Please make sure you want to delete this item permanently.
            </p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className={`${styles.deleteBtn} ${isDangerous ? styles.dangerous : ''}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <span>🗑️</span>
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
