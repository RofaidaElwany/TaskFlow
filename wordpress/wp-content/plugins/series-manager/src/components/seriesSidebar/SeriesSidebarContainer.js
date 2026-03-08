import { useSelect, useDispatch } from '@wordpress/data';

import { SeriesSidebarView } from './SeriesSidebarView';

import { useSeriesPosts } from '../../hooks/useSeriesPosts';
import { useSeriesTerms } from '../../hooks/useSeriesTerms';
import { usePostSavingSync } from '../../hooks/usePostSavingSync';
import { useSeriesPostActions } from '../../hooks/useSeriesPostActions';

import { createSeriesTerm } from '../../services/seriesApiExports';

const SeriesSidebarContainer = () => {
    /* ========================= Editor Data ========================= */

  const { postId, postTitle, currentSeries } = useSelect((select) => {
    const editor = select('core/editor');

    return {
      postId: editor.getCurrentPostId(),
      postTitle: editor.getEditedPostAttribute('title'),
      currentSeries: editor.getEditedPostAttribute('series') || [],
    };
  });

  const normalizeSeriesId = (value) => {
    if (value == null) return null;

    if (typeof value === 'object') {
      const candidate = value.id ?? value.term_id ?? value;
      const num = Number(candidate);
      return Number.isNaN(num) ? null : num;
    }

    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  };

  const selectedSeriesId = normalizeSeriesId(currentSeries[0] ?? null);

  const { editPost } = useDispatch('core/editor');

  /* ========================= Terms ========================= */
  const { seriesTerms, isResolvingTerms } = useSeriesTerms();

    /* =========================    Posts  ========================= */
  const { orderedPosts, setOrderedPosts } =
    useSeriesPosts(selectedSeriesId, postId, postTitle);

    /* =========================    Post Actions (Reorder, Delete)  ========================= */
  const { handleReorder, handleDelete } =
    useSeriesPostActions(
      selectedSeriesId,
      orderedPosts,
      setOrderedPosts
    );

    /* =========================    Sync with Post Saving  ========================= */
  usePostSavingSync(
    selectedSeriesId,
    orderedPosts,
    (posts) => posts
  );

  /* =========================    Handler(Change series)  ========================= */
  const onChangeSeries = (seriesId) => {
    editPost({
      series: seriesId ? [Number(seriesId)] : [],
    });
  };

  /* =========================    Handler(Create series)  ========================= */
  const handleCreateSeries = async (name) => {
    try {
      const newTerm = await createSeriesTerm(name);

      if (newTerm?.id) {
        onChangeSeries(newTerm.id);
      }
    } catch (err) {
      console.error('Error creating series:', err);
    }
  };

  return (
    <SeriesSidebarView
      selectedSeriesId={selectedSeriesId}
      seriesTerms={seriesTerms}
      isResolvingTerms={isResolvingTerms}
      orderedPosts={orderedPosts}
      onChangeSeries={onChangeSeries}
      onCreateSeries={handleCreateSeries}
      onReorder={handleReorder}
      onDelete={handleDelete}
    />
  );
};

export { SeriesSidebarContainer };