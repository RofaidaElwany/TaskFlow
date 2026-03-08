export const createSeriesApi = ({
  ajaxurl,
  nonce,
  fetchFn,
  wpData,
}) => {

  //fetchSeriesPosts, updateSeriesOrder, createSeriesTerm
  const fetchSeriesPosts = async (termId) => {
    const formData = new URLSearchParams({
      action: 'sm_get_series_posts',
      nonce,
      term_id: termId,
    });



    const res = await fetchFn(ajaxurl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    return res.json();
  };

  const updateSeriesOrder = async (termId, posts) => {
    const formData = new URLSearchParams({
      action: 'sm_update_series_order',
      nonce,
      term_id: termId,
      post_ids: posts.map((p) => p.id).join(','),
    });

    return fetchFn(ajaxurl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
  };

  const createSeriesTerm = async (name) => {
    return wpData.dispatch('core').saveEntityRecord(
      'taxonomy',
      'series',
      { name }
    );
  };

  return {
    fetchSeriesPosts,
    updateSeriesOrder,
    createSeriesTerm,
  };
};