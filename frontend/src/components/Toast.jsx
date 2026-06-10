import { useEffect, useState } from "react";

let showToastFn = null;

export function showToast(message, type = "success") {
  if (showToastFn) {
    showToastFn({ message, type, id: Date.now() });
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    showToastFn = ({ message, type, id }) => {
      setToasts((list) => [...list, { id, message, type }]);
      setTimeout(() => {
        setToasts((list) => list.filter((t) => t.id !== id));
      }, 2500);
    };
    return () => {
      showToastFn = null;
    };
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
