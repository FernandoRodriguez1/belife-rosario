import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { ToastContext } from '../hooks/useToast';

// Duración de la notificación (éxito y error): 5 s.
const DURATION = 5000;

const STYLES = {
  success: {
    container: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
    Icon: CheckCircle2,
  },
  error: {
    container: 'bg-red-50 text-red-600 ring-red-600/10',
    Icon: AlertCircle,
  },
};

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    ({ type = 'success', message, duration }) => {
      if (!message) return null;
      const id = (nextId += 1);
      const finalDuration = duration ?? DURATION;
      setToasts((prev) => [...prev, { id, type, message }]);
      const timer = setTimeout(() => remove(id), finalDuration);
      timersRef.current.set(id, timer);
      return id;
    },
    [remove]
  );

  const api = useMemo(
    () => ({
      notify,
      success: (message, duration) =>
        notify({ type: 'success', message, duration }),
      error: (message, duration) =>
        notify({ type: 'error', message, duration }),
    }),
    [notify]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
          {toasts.map((toast) => {
            const { container, Icon } = STYLES[toast.type] ?? STYLES.success;
            return (
              <div
                key={toast.id}
                role="status"
                className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl px-5 py-4 text-[15px] font-medium shadow-lg ring-1 ring-inset ${container}`}
              >
                <Icon className="mt-0.5 size-5 shrink-0" />
                <p className="min-w-0 flex-1 break-words">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => remove(toast.id)}
                  className="shrink-0 rounded-lg p-0.5 opacity-70 transition-opacity duration-150 hover:opacity-100"
                  title="Cerrar"
                >
                  <X className="size-5" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
