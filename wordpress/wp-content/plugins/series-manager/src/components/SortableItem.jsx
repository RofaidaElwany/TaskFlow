import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';
import '../index.css';

const SortableItem = ({ id, post, onDelete }) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsConfirmModalOpen(false);
    onDelete && onDelete(post);
  };

  return (
    <>
      <li
        ref={setNodeRef}
        style={style}
        className={`flex items-center font-semibold 
          ${post.isCurrent
            ? 'p-0 rounded bg-blue-100 dark:bg-blue-900/20 border-l-4 border-blue-600 text-gray-900 dark:text-gray-100'
            : 'p-2 text-gray-600 dark:text-gray-300 flex-grow hover:bg-gray-100 dark:hover:bg-gray-900/30'
          }`}
      >
        <span
          className="material-symbols-outlined text-gray-400 text-[16px]"
          {...attributes}
          {...listeners}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          drag_indicator
        </span>

        <span className="flex-1 ml-2">
          {post.title?.rendered || 'Current Post'}
        </span>

        <button
          type="button"
          onClick={handleDeleteClick}
          className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors relative group"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
          <span className="absolute bottom-full left-1/2 -translate-x-3/4 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            Remove from series
            <span className="absolute -bottom-1 left-3/4 -translate-x-full w-2 h-2 bg-gray-800 rotate-45 pointer-events-none" />
          </span>
        </button>
      </li>

      {isConfirmModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-[360px] rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 pt-6 pb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Remove from Series
                </h3>
              </div>
              <div className="px-6 pb-6 pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Are you sure you want to remove{' '}
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {post.title?.rendered || 'Current Post'}
                  </span>{' '}
                  from the series?
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-[#1e1e1e] flex justify-end items-center gap-3">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded shadow-sm transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default SortableItem;