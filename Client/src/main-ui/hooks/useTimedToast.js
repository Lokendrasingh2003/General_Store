import { useCallback, useEffect, useState } from 'react';

const initialToast = {
  visible: false,
  type: 'success',
  message: '',
};

export const useTimedToast = (duration = 1800) => {
  const [toast, setToast] = useState(initialToast);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({
      visible: true,
      type,
      message,
    });
  }, []);

  useEffect(() => {
    if (!toast.visible) return undefined;

    const timeout = setTimeout(hideToast, duration);
    return () => clearTimeout(timeout);
  }, [toast.visible, duration, hideToast]);

  return {
    toast,
    showToast,
    hideToast,
  };
};
