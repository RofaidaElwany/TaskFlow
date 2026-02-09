<?php

if (! defined('ABSPATH')) {
    exit;
}

class SM_Series_Order
{

    /* =========================
     * Ensure DB Column
     ========================= */
    public static function ensure_term_order_column()
    {
        global $wpdb;
        $table = $wpdb->term_relationships;
        $exists = $wpdb->get_results(
            "SHOW COLUMNS FROM `$table` LIKE 'term_order'"
        );
        if (empty($exists)) {
            $wpdb->query(
                "ALTER TABLE `$table`
                 ADD COLUMN `term_order` INT(11) NOT NULL DEFAULT 0
                 AFTER `term_taxonomy_id`"
            );
        }
    }

    /* =========================
     * WRITE helper
     ========================= */
    public static function update_order($term_taxonomy_id, array $post_ids)
    {
        global $wpdb;
        self::ensure_term_order_column();

        foreach ($post_ids as $index => $post_id) {
            // Ensure there is a relationship row and set the term_order.
            // Use REPLACE so we insert when missing or update when present.
            $wpdb->replace(
                $wpdb->term_relationships,
                [
                    'object_id'        => (int) $post_id,
                    'term_taxonomy_id' => (int) $term_taxonomy_id,
                    'term_order'       => (int) $index,
                ],
                ['%d', '%d', '%d']
            );
        }
    }

    /**
     * Persist the ordering as term meta (by term_id) so we can re-apply
     * the order when new relationships are created (e.g. on post publish).
     */
    public static function persist_order_meta($term_id, array $post_ids)
    {
        update_term_meta((int) $term_id, 'sm_series_order', implode(',', $post_ids));
    }

    /* =========================
     * READ helper 
     ========================= */
    public static function get_ordered_posts($term_taxonomy_id)
    {
        global $wpdb;

        return $wpdb->get_results(
            $wpdb->prepare(
                "
                SELECT p.ID, p.post_title, tr.term_order
                FROM {$wpdb->posts} p
                INNER JOIN {$wpdb->term_relationships} tr
                    ON p.ID = tr.object_id
                WHERE tr.term_taxonomy_id = %d
                AND p.post_status = 'publish'
                ORDER BY tr.term_order ASC
                ",
                $term_taxonomy_id
            )
        );
    }

    /* =========================
     * AJAX
     ========================= */
    public static function register()
    {
        add_action('wp_ajax_sm_update_series_order', [__CLASS__, 'ajax_update_order']);
        add_action('wp_ajax_sm_get_series_posts', [__CLASS__, 'ajax_get_series_posts']);
        add_action('wp_ajax_sm_remove_post_from_series', [__CLASS__, 'ajax_remove_post_from_series']);
        // When a post is saved/published, ensure its term_relationship term_order
        // matches any ordering stored for the series term(s).
        add_action('save_post', [__CLASS__, 'sync_post_order_on_save'], 20, 3);
    }

    public static function ajax_remove_post_from_series()
    {
        // Verify user has permission
        if (! current_user_can('edit_posts')) {
            wp_send_json_error(['message' => 'No permission']);
            return;
        }

        // Verify nonce
        $nonce = $_POST['nonce'] ?? $_REQUEST['nonce'] ?? '';
        if (! wp_verify_nonce($nonce, 'sm_series_nonce')) {
            wp_send_json_error(['message' => 'Invalid nonce']);
            return;
        }

        $term_id = intval($_POST['term_id'] ?? $_REQUEST['term_id'] ?? 0);
        $post_id = intval($_POST['post_id'] ?? $_REQUEST['post_id'] ?? 0);

        if (! $term_id || ! $post_id) {
            wp_send_json_error(['message' => 'Invalid data']);
            return;
        }

        $term = get_term($term_id);
        if (!$term || is_wp_error($term)) {
            wp_send_json_error(['message' => 'Invalid term']);
            return;
        }

        // Remove the term relationship for this post
        $removed = wp_remove_object_terms($post_id, (int) $term_id, 'series');

        if (is_wp_error($removed)) {
            wp_send_json_error(['message' => 'Error removing term']);
            return;
        }

        // Also clean up term_order column if present
        global $wpdb;
        self::ensure_term_order_column();
        $wpdb->delete(
            $wpdb->term_relationships,
            ['term_taxonomy_id' => (int) $term->term_taxonomy_id, 'object_id' => $post_id],
            ['%d', '%d']
        );

        wp_send_json_success(['message' => 'Post removed from series']);
    }

    public static function ajax_update_order()
    {
        // Verify user has permission
        if (! current_user_can('edit_posts')) {
            wp_send_json_error(['message' => 'No permission']);
            return;
        }

        // Verify nonce
        $nonce = $_POST['nonce'] ?? $_REQUEST['nonce'] ?? '';
        if (! wp_verify_nonce($nonce, 'sm_series_nonce')) {
            wp_send_json_error(['message' => 'Invalid nonce']);
            return;
        }

        // Get data from POST or REQUEST
        $term_id  = intval($_POST['term_id'] ?? $_REQUEST['term_id'] ?? 0);
        $post_ids_str = $_POST['post_ids'] ?? $_REQUEST['post_ids'] ?? '';
        $post_ids = array_map('intval', array_filter(explode(',', $post_ids_str)));

        if (! $term_id || empty($post_ids)) {
            wp_send_json_error(['message' => 'Invalid data']);
            return;
        }

        $term = get_term($term_id);
        if (!$term || is_wp_error($term)) {
            wp_send_json_error(['message' => 'Invalid term']);
            return;
        }

        self::update_order($term->term_taxonomy_id, $post_ids);

        // Also persist ordering in term meta (use term_id for meta APIs)
        self::persist_order_meta($term->term_id, $post_ids);

        wp_send_json_success(['message' => 'Order updated successfully']);
    }

    public static function ajax_get_series_posts()
    {
        // Verify user has permission
        if (! current_user_can('edit_posts')) {
            wp_send_json_error(['message' => 'No permission']);
            return;
        }

        // Verify nonce
        $nonce = $_POST['nonce'] ?? $_REQUEST['nonce'] ?? '';
        if (! wp_verify_nonce($nonce, 'sm_series_nonce')) {
            wp_send_json_error(['message' => 'Invalid nonce']);
            return;
        }

        // Get term_id from POST or REQUEST
        $term_id = intval($_POST['term_id'] ?? $_REQUEST['term_id'] ?? 0);

        if (!$term_id) {
            wp_send_json_error(['message' => 'Invalid term ID']);
            return;
        }

        $term = get_term($term_id);
        if (!$term || is_wp_error($term)) {
            wp_send_json_error(['message' => 'Term not found']);
            return;
        }

        // Ensure the term_order column exists
        self::ensure_term_order_column();

        $posts = self::get_ordered_posts($term->term_taxonomy_id);

        $formatted_posts = array_map(function ($post) {
            return [
                'id' => $post->ID,
                'title' => [
                    'rendered' => $post->post_title ?: 'Untitled'
                ]
            ];
        }, $posts);

        wp_send_json_success($formatted_posts);
    }

    /**
     * When a post is saved, re-apply any saved series ordering to the
     * term_relationship row for that post so newly-created relationships
     * (created during publish) get the correct `term_order`.
     *
     * Hooked to `save_post`.
     */
    public static function sync_post_order_on_save($post_id, $post, $update)
    {
        // Ignore revisions and autosaves
        if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) {
            return;
        }

        // Only for posts
        if ($post->post_type !== 'post') {
            return;
        }

        // Get series terms for this post
        $terms = wp_get_post_terms($post_id, 'series', ['fields' => 'ids']);
        if (is_wp_error($terms) || empty($terms)) {
            return;
        }

        global $wpdb;
        self::ensure_term_order_column();

        foreach ($terms as $term_id) {
            $order_str = get_term_meta($term_id, 'sm_series_order', true);
            if (! $order_str) {
                continue;
            }

            $post_ids = array_map('intval', array_filter(explode(',', $order_str)));
            $index = array_search($post_id, $post_ids, true);
            if ($index === false) {
                continue;
            }

            // Resolve term_taxonomy_id
            $term_taxonomy_id = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT term_taxonomy_id FROM {$wpdb->term_taxonomy} WHERE term_id = %d",
                    $term_id
                )
            );

            if (! $term_taxonomy_id) {
                continue;
            }

            // Update the term_relationship row for this post+term
            $wpdb->query(
                $wpdb->prepare(
                    "UPDATE {$wpdb->term_relationships} SET term_order = %d WHERE term_taxonomy_id = %d AND object_id = %d",
                    $index,
                    $term_taxonomy_id,
                    $post_id
                )
            );
        }
    }
}
