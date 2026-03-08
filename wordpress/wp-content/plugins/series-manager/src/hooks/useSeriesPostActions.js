import { reorderPosts, removePostFromList } from '../utils/postHelpers';
import { updateSeriesOrder } from '../services/seriesApiExports';

export const useSeriesPostActions = (
  selectedSeriesId,
  orderedPosts,
  setOrderedPosts
) => {

  const saveOrderToDB = (posts) => {
    if (!selectedSeriesId) return;
    updateSeriesOrder(selectedSeriesId, posts);
  };

  const handleReorder = (activeId, overId) => {
    const newPosts = reorderPosts(
      orderedPosts,
      activeId,
      overId
    );

    setOrderedPosts(newPosts);
    saveOrderToDB(newPosts);
  };

  const handleDelete = (postToDelete) => {
    const updatedPosts = removePostFromList(
      orderedPosts,
      postToDelete.id
    );

    setOrderedPosts(updatedPosts);
    saveOrderToDB(updatedPosts);
  };

  return {
    handleReorder,
    handleDelete,
  };
};