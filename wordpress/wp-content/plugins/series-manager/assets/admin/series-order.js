jQuery(function ($) {
    const $list = $('#sm-series-posts');

    if (!$list.length) return;

    $list.sortable({
        update() {
            const postIds = [];

            $list.find('li').each(function (index) {
                const postId = $(this).data('post-id');
                postIds[index] = postId;
            });

            console.log('Saving post order:', postIds);
            console.log('Post IDs string:', postIds.join(','));

            $.post(ajaxurl, {
                action: 'sm_update_series_order',
                term_id: SMSeries.term_id,
                post_ids: postIds.join(','),
                nonce: SMSeries.nonce,
            }, function(response) {
                console.log('Order saved response:', response);
            });
        }
    });
});
