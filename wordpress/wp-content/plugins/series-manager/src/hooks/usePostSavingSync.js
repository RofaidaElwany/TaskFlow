import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

export const usePostSavingSync = (
  selectedSeriesId,
  orderedPosts,
  saveOrderToDB
) => {
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
};
