import { SeriesApi } from './seriesApiInstance';

// We avoid calling SeriesApi() during module evaluation because at that
// point wp_localize_script may not have run yet.  Instead each exported
// helper obtains the current API instance lazily when invoked.

const getApi = () => SeriesApi();

export const fetchSeriesPosts = (...args) =>
  getApi().fetchSeriesPosts(...args);

export const updateSeriesOrder = (...args) =>
  getApi().updateSeriesOrder(...args);

export const createSeriesTerm = (...args) =>
  getApi().createSeriesTerm(...args);