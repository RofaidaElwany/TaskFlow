import { useSelect } from '@wordpress/data';

export const useSeriesTerms = () => {
  return useSelect((select) => {
    const core = select('core');
    const args = ['taxonomy', 'series', { per_page: -1 }];

    return {
      seriesTerms: core.getEntityRecords(...args) || [],
      isResolvingTerms: core.isResolving('getEntityRecords', args),
    };
  }, []);
};
