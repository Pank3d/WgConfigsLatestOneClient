import { useModal } from '../lib';

export default function Modal() {
  const { isOpen, content, closeModal } = useModal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeModal} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
        {content}
      </div>
    </div>
  );
}
