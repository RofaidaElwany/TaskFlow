import { SeriesApi } from './seriesApiInstance';

const api = SeriesApi();

export const fetchSeriesPosts = (...args) =>
  api.fetchSeriesPosts(...args);

export const updateSeriesOrder = (...args) =>
  api.updateSeriesOrder(...args);

export const createSeriesTerm = (...args) =>
  api.createSeriesTerm(...args);