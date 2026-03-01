export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-[16px] p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[16px] font-semibold m-0">{title}</h2>
          <button onClick={onClose} className="text-[#808080] hover:text-white bg-transparent border-none cursor-pointer text-[18px]">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}