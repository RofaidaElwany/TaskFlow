import { useState, useEffect } from '@wordpress/element';
import { prepareOrderedPosts } from '../utils/postHelpers';
import { fetchSeriesPosts } from "../services/seriesApiExports";

export const useSeriesPosts = (
  selectedSeriesId,
  postId,
  postTitle
) => {
  const [orderedPosts, setOrderedPosts] = useState([]);

  useEffect(() => {
    if (!selectedSeriesId) {
      setOrderedPosts([]);
      return;
    }

    fetchSeriesPosts(selectedSeriesId)
      .then((response) => {
        if (!response?.success) {
          setOrderedPosts([]);
          return;
        }

        const prepared = prepareOrderedPosts(
          response.data || [],
          postId,
          postTitle
        );

        setOrderedPosts(prepared);
      })
      .catch(() => setOrderedPosts([]));
  }, [selectedSeriesId, postId, postTitle]);

  return { orderedPosts, setOrderedPosts };
};
