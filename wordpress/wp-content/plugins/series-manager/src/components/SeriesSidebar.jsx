import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { PanelBody, Spinner, Modal, Button, ComboboxControl, TextControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import '../index.css';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';

import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import SortableItem from './SortableItem';
import DragOverlayItem from './DragOverlayItem';

import { useSeriesPosts } from '../hooks/useSeriesPosts';
import { useSeriesTerms } from '../hooks/useSeriesTerms';
import { usePostSavingSync } from '../hooks/usePostSavingSync';

import { reorderPosts, removePostFromList } from '../utils/postHelpers';
import { updateSeriesOrder, createSeriesTerm } from '../services/seriesApi';

const SeriesSidebar = () => {
  /* =========================
     Editor Data
  ========================= */
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

  /* =========================
     Terms Hook
  ========================= */
  const { seriesTerms, isResolvingTerms } = useSeriesTerms();

  /* =========================
     Posts Hook
  ========================= */
  const { orderedPosts, setOrderedPosts } =
    useSeriesPosts(selectedSeriesId, postId, postTitle);

  /* =========================
     Local State
  ========================= */
  const [isNewSeriesModalOpen, setIsNewSeriesModalOpen] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState('');
  const [activePost, setActivePost] = useState(null);

  /* =========================
     Save Order Wrapper
  ========================= */
  const saveOrderToDB = (posts) => {
    updateSeriesOrder(selectedSeriesId, posts);
  };

  /* =========================
     Sync on Save
  ========================= */
  usePostSavingSync(
    selectedSeriesId,
    orderedPosts,
    saveOrderToDB
  );

  /* =========================
     DnD Setup
  ========================= */
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event) => {
    const post = orderedPosts.find(p => p.id === event.active.id);
    setActivePost(post);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActivePost(null);

    if (!over) return;

    const newPosts = reorderPosts(
      orderedPosts,
      active.id,
      over.id
    );

    setOrderedPosts(newPosts);
    saveOrderToDB(newPosts);
  };

  const handleDragCancel = () => {
    setActivePost(null);
  };

  /* =========================
     Delete Post
  ========================= */
  const handleDeletePost = (postToDelete) => {
    const updatedPosts = removePostFromList(
      orderedPosts,
      postToDelete.id
    );

    setOrderedPosts(updatedPosts);
    saveOrderToDB(updatedPosts);
  };

  /* =========================
     Change Series
  ========================= */
  const onChangeSeries = (seriesId) => {
    editPost({ series: seriesId ? [Number(seriesId)] : [] });
  };

  /* =========================
     Create New Series
  ========================= */
  const createNewSeries = async () => {
    try {
      const newTerm = await createSeriesTerm(newSeriesName);

      setIsNewSeriesModalOpen(false);
      setNewSeriesName('');

      if (newTerm?.id) {
        onChangeSeries(newTerm.id);
      }
    } catch (err) {
      console.error('Error creating series:', err);
      setIsNewSeriesModalOpen(false);
      setNewSeriesName('');
    }
  };

  /* =========================
     Render
  ========================= */
  return (
    <PluginDocumentSettingPanel
      name="sm-series-sidebar"
      title="Series Manager"
    >
      <PanelBody>
        <div className="-mx-4">

          {isResolvingTerms && <Spinner />}

          {!isResolvingTerms && (
            <div>
              {/* Label */}
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                Series
              </label>

              {/* Combobox */}
              <div className="sm-series-combo mb-2">
                <ComboboxControl
                  value={selectedSeriesId ? String(selectedSeriesId) : ''}
                  options={[
                    { value: '', label: 'Select the series' },
                    ...seriesTerms.map(t => ({
                      value: String(t.id),
                      label: t.name
                    })),
                  ]}
                  onChange={onChangeSeries}
                />
              </div>

              {/* New Series Button */}
              <div className="sm-new-series-action-container mb-4">
                <button
                  type="button"
                  className="sm-new-series-action px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setNewSeriesName('');
                    setIsNewSeriesModalOpen(true);
                  }}
                >
                  + New Series
                </button>
              </div>

              {/* Modal */}
              {isNewSeriesModalOpen && (
                <Modal
                  title="Add new series"
                  onRequestClose={() => setIsNewSeriesModalOpen(false)}
                  className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                >
                  <TextControl
                    label="Series name"
                    value={newSeriesName}
                    onChange={setNewSeriesName}
                    className="mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setIsNewSeriesModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={createNewSeries}
                      disabled={!newSeriesName}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-colors"
                    >
                      ADD
                    </Button>
                  </div>
                </Modal>
              )}
            </div>
          )}

          {/* Posts List */}
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
              </SortableContext>

              {/* Drag Overlay */}
              <DragOverlay adjustScale={false}>
                {activePost && (
                  <DragOverlayItem
                    post={activePost}
                    className="font-mono text-sm px-3 py-2 rounded-md border bg-blue-200 border-blue-300 shadow-lg cursor-grabbing"
                  />
                )}
              </DragOverlay>
            </DndContext>
          )}

        </div>
      </PanelBody>
    </PluginDocumentSettingPanel>
  );
};

export default SeriesSidebar;