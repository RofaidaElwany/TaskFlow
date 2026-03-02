import { createSeriesApi } from './seriesApi';

export const SeriesApi = () => {
  return createSeriesApi({
    ajaxurl: window.SMSeries?.ajaxurl,
    nonce: window.SMSeries?.nonce,
    fetchFn: fetch,
    wpData: wp.data,
  });
};