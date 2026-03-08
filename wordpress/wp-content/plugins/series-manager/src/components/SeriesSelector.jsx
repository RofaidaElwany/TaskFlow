import {
  Spinner,
  Modal,
  Button,
  ComboboxControl,
  TextControl
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import '../index.css';

const SeriesSelector = ({
  selectedSeriesId,
  seriesTerms,
  isLoading,
  onChangeSeries,
  onCreateSeries,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState('');

  const handleCreate = async () => {
    await onCreateSeries(newSeriesName);
    setNewSeriesName('');
    setIsModalOpen(false);
  };

  return (
    <div className="-mx-4">
      {isLoading && <Spinner />}

      {!isLoading && (
        <div>
          {/* Label */}
          <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
            Series
          </label>

          {/* Combobox */}
          <div className="sm-series-combo mb-2">
            <ComboboxControl
              value={selectedSeriesId ? String(selectedSeriesId) : ''}
              options={[
                { value: '', label: 'Select the series' },
                ...seriesTerms.map((t) => ({
                  value: String(t.id),
                  label: t.name,
                })),
              ]}
              onChange={onChangeSeries}
            />
          </div>

          {/* New Series Button */}
          <div className="sm-new-series-action-container mb-4">
            <button
              type="button"
              className="sm-new-series-action px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => {
                setNewSeriesName('');
                setIsModalOpen(true);
              }}
            >
              + New Series
            </button>
          </div>

          {/* Modal */}
          {isModalOpen && (
            <Modal
              title="Add new series"
              onRequestClose={() => setIsModalOpen(false)}
              className="bg-white dark:bg-[#1e1e1e] rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <TextControl
                label="Series name"
                value={newSeriesName}
                onChange={setNewSeriesName}
                className="mb-4"
              />

              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  onClick={handleCreate}
                  disabled={!newSeriesName}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm transition-colors"
                >
                  ADD
                </Button>
              </div>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
};

export { SeriesSelector };