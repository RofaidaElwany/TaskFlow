import { createSeriesApi } from './seriesApi';

let apiInstance = null;

export const SeriesApi = () => {
  // Only create the instance once, and only when first called (lazy initialization)
  // This ensures wp_localize_script has already run
  if (apiInstance) {
    return apiInstance;
  }

  // Construct fallback URL for subdirectory installations
  let ajaxurl = window.SMSeries?.ajaxurl;

  if (!ajaxurl) {
    // Build URL based on current location
    // For /projects/TaskFlow/wordpress/wp-admin/post.php
    // We want /projects/TaskFlow/wordpress/wp-admin/admin-ajax.php
    const pathname = window.location.pathname;
    const baseUrl = pathname.substring(0, pathname.indexOf('/wp-admin/') + 10); // includes /wp-admin/
    ajaxurl = baseUrl + 'admin-ajax.php';

    console.warn('[SeriesApi] ajaxurl not localized, using fallback:', ajaxurl);
  }

  const nonce = window.SMSeries?.nonce;

  if (!nonce) {
    // Even if logging is removed, we might want a runtime warning
    // so developers know something is wrong during development.
    if (process.env.NODE_ENV !== 'test') {
      console.error('[SeriesApi] Missing nonce; AJAX requests will fail.');
    }
  }

  apiInstance = createSeriesApi({
    ajaxurl,
    nonce,
    fetchFn: fetch,
    wpData: wp.data,
  });

  return apiInstance;
};