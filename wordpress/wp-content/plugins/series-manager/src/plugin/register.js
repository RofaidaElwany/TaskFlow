import { registerPlugin } from '@wordpress/plugins';
import { SeriesSidebarContainer } from '../components/seriesSidebar/SeriesSidebarContainer';

export const registerSeriesPlugin = () => {
  if (!window.smSeriesSidebarRegistered) {
    registerPlugin('sm-series-sidebar', {
      render: SeriesSidebarContainer,
    });

    window.smSeriesSidebarRegistered = true;
  }
};
