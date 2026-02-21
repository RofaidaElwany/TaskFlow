/* =========================
   Fetch Series Posts
========================= */
export const fetchSeriesPosts = async (termId) => {
  const formData = new URLSearchParams({
    action: 'sm_get_series_posts',
    nonce: window.SMSeries.nonce,
    term_id: termId,
  });

  const res = await fetch(window.SMSeries.ajaxurl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  return res.json();
};

/* =========================
   Update Series Order
========================= */
export const updateSeriesOrder = async (termId, posts) => {
  const formData = new URLSearchParams({
    action: 'sm_update_series_order',
    nonce: window.SMSeries.nonce,
    term_id: termId,
    post_ids: posts.map((p) => p.id).join(','),
  });

  return fetch(window.SMSeries.ajaxurl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });
};

/* =========================
   Create New Series
========================= */
export const createSeriesTerm = async (name) => {
  return wp.data.dispatch('core').saveEntityRecord(
    'taxonomy',
    'series',
    { name }
  );
};
