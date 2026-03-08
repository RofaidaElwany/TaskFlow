import { useState, useEffect } from '@wordpress/element';
import { prepareOrderedPosts } from '../utils/postHelpers';
import { fetchSeriesPosts } from "../services/seriesApiExports";

// convert whatever user passes in (number, string, object) into a real term ID
const normalizeSeriesId = (value) => {
  if (value == null) {
    return null;
  }

  // some versions of Gutenberg return an array of objects, not just ids
  // e.g. [{ id: 5, name: 'Foo' }]
  if (typeof value === 'object') {
    // try a couple of common properties
    const candidate = value.id ?? value.term_id ?? value;
    const num = Number(candidate);
    return Number.isNaN(num) ? null : num;
  }

  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

export const useSeriesPosts = (
  selectedSeriesId,
  postId,
  postTitle
) => {
  const [orderedPosts, setOrderedPosts] = useState([]);

  useEffect(() => {
    const seriesId = normalizeSeriesId(selectedSeriesId);

    if (!seriesId) {
      setOrderedPosts([]);
      return;
    }

    fetchSeriesPosts(seriesId)
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