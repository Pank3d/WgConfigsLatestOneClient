import { useConfirm } from '../lib';
import Button from './Button';

export default function ConfirmDialog() {
  const { isOpen, title, message, confirm, closeConfirm } = useConfirm();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeConfirm} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={closeConfirm}>
            Отмена
          </Button>
          <Button variant="danger" onClick={confirm}>
            Подтвердить
          </Button>
        </div>
      </div>
    </div>
  );
}
