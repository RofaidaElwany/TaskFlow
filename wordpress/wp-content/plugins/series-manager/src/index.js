import { registerPlugin } from '@wordpress/plugins';
import { PluginDocumentSettingPanel } from '@wordpress/editor';
import { PanelBody, SelectControl, Spinner } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import './index.css';


const SeriesSidebar = () => {
    const { postId, postTitle, currentSeries } = useSelect((select) => {
        const editor = select('core/editor');
        return {
            postId: editor.getCurrentPostId(),
            postTitle: editor.getEditedPostAttribute('title'),
            currentSeries: editor.getEditedPostAttribute('series') || [],
        };
    }, []);

    const [orderedPosts, setOrderedPosts] = useState([]);
    const selectedSeriesId = currentSeries[0] || null;

    const { editPost } = useDispatch('core/editor');

    /* =========================
       Fetch all series terms using useSelect
    ========================= */
    const { seriesTerms, isResolvingTerms } = useSelect((select) => {
        const core = select('core');
        if (!core) {
            return { seriesTerms: [], isResolvingTerms: false };
        }

        const queryArgs = ['taxonomy', 'series', { per_page: -1 }];
        const records = core.getEntityRecords(...queryArgs);
        const isResolving = core.isResolving('getEntityRecords', queryArgs);
        
        return {
            seriesTerms: records || [],
            isResolvingTerms: isResolving === true,
        };
    }, []);

    /* =========================
       Fetch posts for selected series via AJAX
    ========================= */
    useEffect(() => {
        if (!selectedSeriesId) {
            setOrderedPosts([]);
            return;
        }

        // Check if SMSeries is available
        if (!window.SMSeries || !window.SMSeries.ajaxurl) {
            console.error('SMSeries object not available. Make sure the script is properly localized.');
            return;
        }

        const formData = new URLSearchParams({
            action: 'sm_get_series_posts',
            nonce: window.SMSeries.nonce,
            term_id: selectedSeriesId,
        });

        fetch(window.SMSeries.ajaxurl, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.text();
        })
        .then(text => {
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    let posts = data.data || [];
                    // If current post already exists, mark it as current (don't duplicate it).
                    const currentId = Number(postId);
                    const existingIndex = posts.findIndex((p) => Number(p?.id) === currentId);

                    if (existingIndex !== -1) {
                        posts = posts.map((p, idx) =>
                            idx === existingIndex
                                ? {
                                      ...p,
                                      isCurrent: true,
                                      // prefer the edited title for the current post
                                      title: {
                                          rendered:
                                              (postTitle?.trim && postTitle.trim()) ||
                                              p?.title?.rendered ||
                                              'Untitled',
                                      },
                                  }
                                : p
                        );
                    } else {
                        // Add current post only if it's not already in the ordered list
                        posts.push({
                            id: currentId,
                            title: { rendered: (postTitle?.trim && postTitle.trim()) || 'The current post' },
                            isCurrent: true,
                        });
                    }
                    setOrderedPosts(posts);
                } else {
                    console.error('Error fetching posts:', data);
                    setOrderedPosts([]);
                }
            } catch (e) {
                console.error('Error parsing JSON response:', e);
                console.error('Response text:', text);
                setOrderedPosts([]);
            }
        })
        .catch(err => {
            console.error('Error fetching posts:', err);
            setOrderedPosts([]);
        });

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

        // Check if SMSeries is available
        if (!window.SMSeries || !window.SMSeries.ajaxurl) {
            console.error('SMSeries object not available. Make sure the script is properly localized.');
            return;
        }

        const postIds = posts.map(p => p.id);
        const formData = new URLSearchParams({
            action: 'sm_update_series_order',
            nonce: window.SMSeries.nonce,
            term_id: selectedSeriesId,
            post_ids: postIds.join(','),
        });

        fetch(window.SMSeries.ajaxurl, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            if (!data.success) {
                console.error('Error saving order:', data);
            }
        })
        .catch(err => {
            console.error('Error saving order:', err);
        });
    };

    /* =========================
       Series Options
    ========================= */
    const seriesOptions = [
        { label: 'Select the series', value: '' },
        ...(seriesTerms || []).map(t => ({ label: t.name, value: t.id })),
    ];

    return (
        <PluginDocumentSettingPanel name="sm-series-sidebar" title="Series Manager">
            <PanelBody>
                {isResolvingTerms && <Spinner />}
                {!isResolvingTerms && seriesTerms && seriesTerms.length > 0 && (
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                        Series
                    </label>
                    <select
                        value={selectedSeriesId || ''}
                        onChange={(e) => onChangeSeries(e.target.value)}
                        className="w-full
                                    bg-white border 
                                    border-gray-300
                                    rounded-md py-2
                                    px-3
                                    text-sm 
                                    focus:ring-1 
                                    focus:ring-[#197fe6] 
                                    focus:border-[#197fe6] 
                                    outline-none 
                                    cursor-pointer"
                    >
                        <option value="">Select the series</option>
                        {seriesTerms.map((term) => (
                            <option key={term.id} value={term.id}>
                                {term.name}
                            </option>
                        ))}
                    </select>
                    </div>
                    
                )}
                {!isResolvingTerms && (!seriesTerms || seriesTerms.length === 0) && (
                    <p>No series found. Create a series first.</p>
                )}

                {!orderedPosts.length && selectedSeriesId && <Spinner />}
                {orderedPosts.length > 0 && (
                    <ul 
                    className=
                    'flex flex-col list-none p-0 mt-4 border-t border-gray-100 pt-4 gap-2'>
                        {orderedPosts.map((post, index) => (
                            <li
                                
                                key={post.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, index)}
                                onDragOver={onDragOver}
                                onDrop={(e) => onDrop(e, index)}
                                className={`
                                    font-mono
                                    text-sm 
                                    px-3 py-2
                                    rounded-md border
                                    border-gray-200
                                    bg-[#e6e9f1]
                                    cursor-grab active:cursor-grabbing select-none
                                    transition-all
                                    duration-200
                                    hover:bg-[#d8dce6]
                                    hover:shadow-sm 
                                    hover:-translate-y-[1px] 
                                    flex
                                    items-center
                                    gap-2 group
                                    ${post.isCurrent ? 
                                        'border-blue-200 bg-blue-200 font-semibold text-blue-900 hover:bg-blue-200' : 'border-gray-200'}
                                `}
                            >
                                <span class="material-symbols-outlined text-blue-400 text-lg select-none group-hover:text-blue-600"></span>
                                {post.title?.rendered || 'Untitled'}
                            </li>
                        ))}
                    </ul>
                )}
            </PanelBody>
        </PluginDocumentSettingPanel>
    );
};

// Prevent duplicate registration
if (!window.smSeriesSidebarRegistered) {
    registerPlugin('sm-series-sidebar', { render: SeriesSidebar });
    window.smSeriesSidebarRegistered = true;
}
