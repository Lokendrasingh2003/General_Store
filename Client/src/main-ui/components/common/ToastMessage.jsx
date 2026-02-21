const typeStyles = {
  success: 'bg-green-600',
  error: 'bg-rose-600',
  info: 'bg-blue-600',
};

const ToastMessage = ({ toast, positionClassName = 'bottom-6 right-6' }) => {
  if (!toast?.visible) return null;

  return (
    <div
      className={`fixed ${positionClassName} z-50 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-lg ${typeStyles[toast.type] || 'bg-stone-700'}`}
    >
      {toast.message}
    </div>
  );
};

export default ToastMessage;
