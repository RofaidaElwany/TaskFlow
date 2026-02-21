import { registerPlugin } from '@wordpress/plugins';
import SeriesSidebar from '../components/SeriesSidebar';

export const registerSeriesPlugin = () => {
  if (!window.smSeriesSidebarRegistered) {
    registerPlugin('sm-series-sidebar', {
      render: SeriesSidebar,
    });

    window.smSeriesSidebarRegistered = true;
  }
};
