import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { PanelBody } from '@wordpress/components';

import { SeriesSelector } from '../SeriesSelector';
import { SeriesPostsList } from '../SeriesPostsList';

const SeriesSidebarView = ({
  selectedSeriesId,
  seriesTerms,
  isResolvingTerms,
  orderedPosts,
  onChangeSeries,
  onCreateSeries,
  onReorder,
  onDelete,
}) => {
  return (
    <PluginDocumentSettingPanel
      name="sm-series-sidebar"
      title="Series Manager"
    >
      <PanelBody>

        <SeriesSelector
          selectedSeriesId={selectedSeriesId}
          seriesTerms={seriesTerms}
          isLoading={isResolvingTerms}
          onChangeSeries={onChangeSeries}
          onCreateSeries={onCreateSeries}
        />

        <SeriesPostsList
          posts={orderedPosts}
          onReorder={onReorder}
          onDelete={onDelete}
        />

      </PanelBody>
    </PluginDocumentSettingPanel>
  );
};

export { SeriesSidebarView };