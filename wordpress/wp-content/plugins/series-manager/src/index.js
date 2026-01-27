import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';
import { PanelBody, SelectControl, Spinner } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';

const SeriesSidebar = () => {
    const { postId, postTitle, currentSeries } = useSelect((select) => {
        const editor = select('core/editor');
        return {
            postId: editor.getCurrentPostId(),
            postTitle: editor.getEditedPostAttribute('title'),
            currentSeries: editor.getEditedPostAttribute('series') || [],
        };
    }, []);

    const [seriesTerms, setSeriesTerms] = useState([]);
    const [orderedPosts, setOrderedPosts] = useState([]);
    const selectedSeriesId = currentSeries[0] || null;

    const { editPost } = useDispatch('core/editor');

    /* =========================
       Fetch all series terms
    ========================= */
    useEffect(() => {
        wp.data.select('core').getEntityRecords('taxonomy', 'series', { per_page: -1 })
            .then((terms) => setSeriesTerms(terms || []));
    }, []);

    /* =========================
       Fetch posts for selected series via AJAX
    ========================= */
    useEffect(() => {
        if (!selectedSeriesId) {
            setOrderedPosts([]);
            return;
        }

        const formData = new URLSearchParams({
            action: 'sm_get_series_posts',
            nonce: SMSeries.nonce,
            term_id: selectedSeriesId,
        });

        fetch(SMSeries.ajaxurl, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                let posts = data.data;
                // أضف الـ current post لو مش موجود
                if (!posts.some(p => p.id === postId)) {
                    posts.push({
                        id: postId,
                        title: { rendered: postTitle?.trim() || 'The current post' },
                        isCurrent: true,
                    });
                }
                setOrderedPosts(posts);
            } else {
                console.error('Error fetching posts:', data);
            }
        })
        .catch(err => console.error('Error fetching posts:', err));

    }, [selectedSeriesId, postId, postTitle]);

    /* =========================
       Change series
    ========================= */
    const onChangeSeries = (seriesId) => {
        editPost({ series: seriesId ? [Number(seriesId)] : [] });
    };

    /* =========================
       Drag & Drop
    ========================= */
    const onDragStart = (e, index) => e.dataTransfer.setData('dragIndex', index);
    const onDragOver = (e) => e.preventDefault();
    const onDrop = (e, dropIndex) => {
        const dragIndex = Number(e.dataTransfer.getData('dragIndex'));
        if (dragIndex === dropIndex) return;

        const updated = [...orderedPosts];
        const [movedItem] = updated.splice(dragIndex, 1);
        updated.splice(dropIndex, 0, movedItem);
        setOrderedPosts(updated);
        saveOrderToDB(updated);
    };

    const saveOrderToDB = (posts) => {
        if (!selectedSeriesId) return;

        const postIds = posts.map(p => p.id);
        const formData = new URLSearchParams({
            action: 'sm_update_series_order',
            nonce: SMSeries.nonce,
            term_id: selectedSeriesId,
            post_ids: postIds.join(','),
        });

        fetch(SMSeries.ajaxurl, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
        });
    };

    /* =========================
       Series Options
    ========================= */
    const seriesOptions = [
        { label: 'Select the series', value: '' },
        ...seriesTerms.map(t => ({ label: t.name, value: t.id })),
    ];

    return (
        <PluginDocumentSettingPanel name="sm-series-sidebar" title="Series Manager">
            <PanelBody>
                {!seriesTerms.length && <Spinner />}
                {seriesTerms.length > 0 && (
                    <SelectControl
                        label="Series"
                        value={selectedSeriesId || ''}
                        options={seriesOptions}
                        onChange={onChangeSeries}
                    />
                )}

                {!orderedPosts.length && selectedSeriesId && <Spinner />}
                {orderedPosts.length > 0 && (
                    <ul className="sm-series-posts">
                        {orderedPosts.map((post, index) => (
                            <li
                                key={post.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, index)}
                                onDragOver={onDragOver}
                                onDrop={(e) => onDrop(e, index)}
                            >
                                {post.title?.rendered || 'Untitled'}
                            </li>
                        ))}
                    </ul>
                )}
            </PanelBody>
        </PluginDocumentSettingPanel>
    );
};

registerPlugin('sm-series-sidebar', { render: SeriesSidebar });
