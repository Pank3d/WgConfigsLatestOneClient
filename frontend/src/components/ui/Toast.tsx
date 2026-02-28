import { useUIStore } from '../../stores/useUIStore';

export default function Toast() {
  const toasts = useUIStore((state) => state.toasts);
  const hideToast = useUIStore((state) => state.hideToast);

  if (toasts.length === 0) return null;

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${typeStyles[toast.type]} px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[250px] max-w-md animate-slide-in-right`}
        >
          <span className="text-xl">{typeIcons[toast.type]}</span>
          <p className="flex-1">{toast.message}</p>
          <button
            onClick={() => hideToast(toast.id)}
            className="text-white hover:opacity-80 ml-2"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
