<?php

class SeriesController
{
    private $repository;
    private $service;
    private $formatter;

    public function __construct($repository, $service, $formatter)
    {
        $this->repository = $repository;
        $this->service    = $service;
        $this->formatter  = $formatter;

        // AJAX
        add_action('wp_ajax_sm_get_series_posts', [$this, 'ajaxGetSeriesPosts']);
        add_action('wp_ajax_sm_update_series_order', [$this, 'ajaxUpdateOrder']);
        add_action('wp_ajax_sm_remove_post_from_series', [$this, 'ajaxRemovePostFromSeries']);

        // Hook
        add_action('save_post', [$this, 'syncPostOrderOnSave'], 20, 3);
    }

    /* =========================
     * AJAX: Get Series Posts
     ========================= */
    public function ajaxGetSeriesPosts()
    {
        if (! current_user_can('edit_posts')) {
            wp_send_json_error(['message' => 'No permission']);
        }

        $nonce = $_POST['nonce'] ?? '';
        if (! wp_verify_nonce($nonce, 'sm_series_nonce')) {
            wp_send_json_error(['message' => 'Invalid nonce']);
        }

        $term_id = intval($_POST['term_id'] ?? 0);

        if (!$term_id) {
            wp_send_json_error(['message' => 'Invalid term ID']);
        }

        $term = get_term($term_id);
        if (!$term || is_wp_error($term)) {
            wp_send_json_error(['message' => 'Term not found']);
        }


        $posts = $this->repository->getOrderedPosts($term->term_taxonomy_id);

        $formatted = $this->formatter->formatPosts($posts);

        wp_send_json_success($formatted);
    }

    /* =========================
     * AJAX: Update Order
     ========================= */
    public function ajaxUpdateOrder()
    {
        if (! current_user_can('edit_posts')) {
            wp_send_json_error(['message' => 'No permission']);
        }

        $nonce = $_POST['nonce'] ?? '';
        if (! wp_verify_nonce($nonce, 'sm_series_nonce')) {
            wp_send_json_error(['message' => 'Invalid nonce']);
        }

        $term_id      = intval($_POST['term_id'] ?? 0);
        $post_ids_str = $_POST['post_ids'] ?? '';

        $post_ids = $this->service->parsePostIds($post_ids_str);

        if (!$term_id || empty($post_ids)) {
            wp_send_json_error(['message' => 'Invalid data']);
        }

        $term = get_term($term_id);
        if (!$term || is_wp_error($term)) {
            wp_send_json_error(['message' => 'Invalid term']);
        }

        $this->repository->updateOrder($term->term_taxonomy_id, $post_ids);
        $this->repository->persistOrderMeta($term->term_id, $post_ids);

        wp_send_json_success(['message' => 'Order updated successfully']);
    }

    /* =========================
     * AJAX: Remove Post
     ========================= */
    public function ajaxRemovePostFromSeries()
    {
        if (! current_user_can('edit_posts')) {
            wp_send_json_error(['message' => 'No permission']);
        }

        $nonce = $_POST['nonce'] ?? '';
        if (! wp_verify_nonce($nonce, 'sm_series_nonce')) {
            wp_send_json_error(['message' => 'Invalid nonce']);
        }

        $term_id = intval($_POST['term_id'] ?? 0);
        $post_id = intval($_POST['post_id'] ?? 0);

        if (!$term_id || !$post_id) {
            wp_send_json_error(['message' => 'Invalid data']);
        }

        $term = get_term($term_id);
        if (!$term || is_wp_error($term)) {
            wp_send_json_error(['message' => 'Invalid term']);
        }

        $removed = wp_remove_object_terms($post_id, $term_id, 'series');

        if (is_wp_error($removed)) {
            wp_send_json_error(['message' => 'Error removing term']);
        }

        global $wpdb;
        $wpdb->delete(
            $wpdb->term_relationships,
            [
                'term_taxonomy_id' => $term->term_taxonomy_id,
                'object_id'        => $post_id
            ],
            ['%d', '%d']
        );

        wp_send_json_success(['message' => 'Post removed from series']);
    }

    /* =========================
     * Sync Order On Save
     ========================= */
    public function syncPostOrderOnSave($post_id, $post, $update)
    {
        if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
            return;
        }

        if ($post->post_type !== 'post') {
            return;
        }

        $terms = wp_get_post_terms($post_id, 'series', ['fields' => 'ids']);

        if (is_wp_error($terms) || empty($terms)) {
            return;
        }
        global $wpdb;

        foreach ($terms as $term_id) {

            $order_str = get_term_meta($term_id, 'sm_series_order', true);
            if (! $order_str) {
                continue;
            }

            $post_ids = $this->service->parsePostIds($order_str);
            $index    = array_search($post_id, $post_ids, true);

            if ($index === false) {
                continue;
            }

            $term_taxonomy_id = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT term_taxonomy_id FROM {$wpdb->term_taxonomy} WHERE term_id = %d",
                    $term_id
                )
            );

            if (! $term_taxonomy_id) {
                continue;
            }

            $wpdb->query(
                $wpdb->prepare(
                    "UPDATE {$wpdb->term_relationships}
                     SET term_order = %d
                     WHERE term_taxonomy_id = %d AND object_id = %d",
                    $index,
                    $term_taxonomy_id,
                    $post_id
                )
            );
        }
    }
}
