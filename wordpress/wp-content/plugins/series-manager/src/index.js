import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { PanelBody, Spinner, Modal, Button, ComboboxControl, TextControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useEffect,createPortal } from '@wordpress/element';
import './index.css';

/* =========================
   DnD Kit imports
========================= */
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay 
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';

/* =========================
   SortableItem Component
========================= */
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
        className={`flex
                    items-center
                    p-2  
                    hover:bg-gray-100 
                    dark:hover:bg-gray-900/30
                    font-semibold    
          ${post.isCurrent
            ? 'p-0 rounded bg-blue-100 dark:bg-blue-900/20 border-l-4 border-blue-600 text-gray-900 dark:text-gray-100'
            : ' text-gray-600 dark:text-gray-300 flex-grow'}`}
      >
        <span
          className="material-symbols-outlined text-gray-400 text-[16px]"
          {...attributes}
          {...listeners}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          drag_indicator
        </span>

        <span className="flex-1">
          {post.title?.rendered || 'Current Post'}
        </span>

        <button
          type="button"
          onClick={handleDeleteClick}
          className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors relative group"
          title=""
    
        >
          <span className="material-symbols-outlined text-[16px]!important">close</span>
          <span className="absolute
                            bottom-full left-1/2 -translate-x-3/4
                            mb-2 px-2 py-1 
                            bg-gray-800 
                            text-white 
                            text-xs 
                            rounded 
                            whitespace-nowrap 
                            opacity-0 
                            group-hover:opacity-100 
                            transition-opacity 
                            pointer-events-none z-10">
            Remove from series
            <span className="absolute -bottom-1 left-3/4 -translate-x-full w-2 h-2 bg-gray-800 rotate-45 pointer-events-none" />
          </span>
        </button>
      </li>
        
      {isConfirmModalOpen && createPortal (
        //modal for delete confirmation
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-[360px] rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 pt-6 pb-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Remove from Series
            </h3>
          </div>
            <div className="px-6 pb-6 pt-2">
              <p className="text-sm 
                            text-gray-600 
                            dark:text-gray-400 
                            leading-relaxed">
                Are you sure you want to remove <span className="font-bold 
                                                                text-gray-900 
                                                                dark:text-gray-100"> 
                {post.title?.rendered || 'Current Post'}</span> from the series?
              </p>
            </div>
              <div className="px-6 py-4 
                             bg-gray-50
                             dark:bg-[#1e1e1e] 
                             flex 
                             justify-end 
                             items-center 
                             gap-3">
                <button 
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setIsConfirmModalOpen(false)}
                  variant="secondary"
                >
                  Cancel
                </button>
                <button class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded shadow-sm transition-colors"
                  onClick={handleConfirmDelete}
                  variant="destructive"
                >
                  Remove
                </button>
              </div>
            </div>
        </div>,
        document.body
    )}

    {/* New series modal moved to SeriesSidebar */}

    </>
  );
};
/* =========================
   SeriesSidebar Plugin
========================= */
const SeriesSidebar = () => {
  const { postId, postTitle, currentSeries } = useSelect((select) => {
    const editor = select('core/editor');
    return {
      postId: editor.getCurrentPostId(),
      postTitle: editor.getEditedPostAttribute('title'),
      currentSeries: editor.getEditedPostAttribute('series') || [],
    };
  }, []);

  const selectedSeriesId = currentSeries[0] || null;
  const { editPost } = useDispatch('core/editor');
  const [isNewSeriesModalOpen, setIsNewSeriesModalOpen] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState('');
  const [orderedPosts, setOrderedPosts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingPostToRemove, setPendingPostToRemove] = useState(null);
  const [activePost, setActivePost] = useState(null); 

  /* =========================
     Fetch series terms
  ========================= */
  const { seriesTerms, isResolvingTerms } = useSelect((select) => {
    const core = select('core');
    const args = ['taxonomy', 'series', { per_page: -1 }];

    return {
      seriesTerms: core.getEntityRecords(...args) || [],
      isResolvingTerms: core.isResolving('getEntityRecords', args),
    };
  }, []);

  /* =========================
     Fetch posts
  ========================= */
  useEffect(() => {
    if (!selectedSeriesId) {
      setOrderedPosts([]);
      return;
    }
    const formData = new URLSearchParams({
      action: 'sm_get_series_posts',
      nonce: window.SMSeries.nonce,
      term_id: selectedSeriesId,
    });

    fetch(window.SMSeries.ajaxurl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    })
      .then(res => res.json())
      .then(({ success, data }) => {
        if (!success) return;

        const currentId = Number(postId);
        let posts = data || [];

        posts = posts.map(p => ({
          ...p,
          isCurrent: Number(p.id) === currentId,
        }));

        const exists = posts.find(p => Number(p.id) === currentId);

        if (!exists) {
          posts.push({
            id: currentId,
            title: { rendered: postTitle || 'Current Post' },
            isCurrent: true,
          });
        }
        setOrderedPosts(posts);
      });
  }, [selectedSeriesId, postId, postTitle]);
  const onChangeSeries = (seriesId) => {
    editPost({ series: seriesId ? [Number(seriesId)] : [] });
  };

  /* =========================
     DnD sensors
  ========================= */
  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragStart = (event) => { // 🔹 ADDED
    const post = orderedPosts.find(p => p.id === event.active.id);
    setActivePost(post);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActivePost(null); // 🔹 ADDED

    if (!over || active.id === over.id) return;

    const oldIndex = orderedPosts.findIndex(p => p.id === active.id);
    const newIndex = orderedPosts.findIndex(p => p.id === over.id);
    const newPosts = arrayMove(orderedPosts, oldIndex, newIndex);
    setOrderedPosts(newPosts);
    saveOrderToDB(newPosts);
  };

  const handleDragCancel = () => { // 🔹 ADDED
    setActivePost(null);
  };

  /* =========================
     Save order
  ========================= */
  const saveOrderToDB = (posts) => {
    const formData = new URLSearchParams({
      action: 'sm_update_series_order',
      nonce: window.SMSeries.nonce,
      term_id: selectedSeriesId,
      post_ids: posts.map(p => p.id).join(','),
    });

    fetch(window.SMSeries.ajaxurl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
  };
  /* =========================
      Handle save order when adding new post to series
  ========================= */
  const { isSavingPost, isAutosavingPost } = useSelect(
    (select) => ({
      isSavingPost: select('core/editor').isSavingPost(),
      isAutosavingPost: select('core/editor').isAutosavingPost(),
    }),
    []
  );
  useEffect(() => {
    if (
      isSavingPost &&
      !isAutosavingPost &&
      selectedSeriesId &&
      orderedPosts.length
    ) {
      saveOrderToDB(orderedPosts);
    }
  }, [isSavingPost]);
  /* =========================
     Handle delete post from series
  ========================= */
  const handleDeletePost = (postToDelete) => {
    const updatedPosts = orderedPosts.filter(p => p.id !== postToDelete.id);
    setOrderedPosts(updatedPosts);
    saveOrderToDB(updatedPosts);
  };

  /* =========================
      add new series
  ========================= */
  
  const createNewSeries = async () => {
  const newTerm = await wp.data.dispatch('core').saveEntityRecord(
    'taxonomy',
    'series',
    {
      name: newSeriesName,
    }
  );

  setIsNewSeriesModalOpen(false);
  setNewSeriesName('');

  if (newTerm?.id) {
    onChangeSeries(newTerm.id);
  }
};

  /* =========================
     Render
  ========================= */
  return (
    <PluginDocumentSettingPanel name="sm-series-sidebar" title="Series Manager">
      <PanelBody>
        <div className="-mx-4">
          {isResolvingTerms && <Spinner />}

          {!isResolvingTerms && seriesTerms?.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                Series
              </label>
              <div className="sm-series-combo">
                <ComboboxControl
                  value={selectedSeriesId ? String(selectedSeriesId) : ''}
                  options={[
                    { value: '', label: 'Select the series' },
                    ...seriesTerms.map(t => ({ value: String(t.id), label: t.name })),
                  ]}
                  onChange={(val) => {
                      onChangeSeries(val);
                  }}
                />
              </div>
              {/* Always-visible action below combobox so user doesn't need to scroll */}
              <div className="sm-new-series-action-container">
                <button
                  type="button"
                  className="sm-new-series-action"
                  onClick={() => {
                    setNewSeriesName('');
                    setIsNewSeriesModalOpen(true);
                  }}
                >
                  + New Series
                </button>
              </div>
              {isNewSeriesModalOpen && (
                <Modal
                  title="Add new series"
                  onRequestClose={() => setIsNewSeriesModalOpen(false)}
                >
                  <TextControl
                    label="Series name"
                    value={newSeriesName}
                    onChange={setNewSeriesName}
                  />

                  <div className="mt-4">
                    <Button
                      variant="primary"
                      onClick={createNewSeries}
                      disabled={!newSeriesName}
                    >
                      ADD
                    </Button>
                  </div>
                </Modal>
              )}
            </div>
          )}
          {orderedPosts.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}   
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel} 
            >
              <SortableContext
                items={orderedPosts.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1 pt-4">
                    POSTS IN SERIES
                  </label>
                  <ul className="flex flex-col list-none p-0 mt-4 gap-2">
                    {orderedPosts.map(post => (
                      <SortableItem
                        key={post.id}
                        id={post.id}
                        post={post}
                        onDelete={handleDeletePost}
                      />
                    ))}
                  </ul>
                </div>
              </SortableContext>
              {/* 🔹 Drag Overlay */}
              <DragOverlay adjustScale={false}>
                {activePost && (
                  <li className="font-mono 
                                  text-sm 
                                  px-3 py-2 
                                  rounded-md 
                                  border
                                bg-blue-200 
                                border-blue-300 
                                shadow-lg
                                cursor-grabbing">
                    {activePost.title?.rendered || 'Current Post'}
                  </li>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </PanelBody>
    </PluginDocumentSettingPanel>
  );
};
/* =========================
   Register plugin
========================= */
if (!window.smSeriesSidebarRegistered) {
  registerPlugin('sm-series-sidebar', { render: SeriesSidebar });
  window.smSeriesSidebarRegistered = true;
}

export default SeriesSidebar;
