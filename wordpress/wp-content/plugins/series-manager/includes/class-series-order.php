<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class SM_Series_Order {

    /* =========================
     * Ensure DB Column
     ========================= */
    public static function ensure_term_order_column() {
        global $wpdb;

        $table = $wpdb->term_relationships;

        $exists = $wpdb->get_results(
            "SHOW COLUMNS FROM `$table` LIKE 'term_order'"
        );

        if ( empty( $exists ) ) {
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
    public static function update_order( $term_taxonomy_id, array $post_ids ) {
        global $wpdb;
        self::ensure_term_order_column();

        foreach ( $post_ids as $index => $post_id ) {
            $wpdb->update(
                $wpdb->term_relationships,
                [ 'term_order' => $index ],
                [
                    'term_taxonomy_id' => $term_taxonomy_id,
                    'object_id'        => $post_id
                ],
                [ '%d' ],
                [ '%d', '%d' ]
            );
        }
    }

    /* =========================
     * READ helper 
     ========================= */
    public static function get_ordered_posts( $term_taxonomy_id ) {
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
    public static function register() {
        add_action('wp_ajax_sm_update_series_order', [__CLASS__, 'ajax_update_order']);
        add_action('wp_ajax_sm_get_series_posts', [__CLASS__, 'ajax_get_series_posts']);
    }

    public static function ajax_update_order() {
        // Verify user has permission
        if ( ! current_user_can('edit_posts') ) {
            wp_send_json_error(['message' => 'No permission']);
            return;
        }

        // Verify nonce
        $nonce = $_POST['nonce'] ?? $_REQUEST['nonce'] ?? '';
        if ( ! wp_verify_nonce( $nonce, 'sm_series_nonce' ) ) {
            wp_send_json_error(['message' => 'Invalid nonce']);
            return;
        }

        // Get data from POST or REQUEST
        $term_id  = intval($_POST['term_id'] ?? $_REQUEST['term_id'] ?? 0);
        $post_ids_str = $_POST['post_ids'] ?? $_REQUEST['post_ids'] ?? '';
        $post_ids = array_map('intval', array_filter(explode(',', $post_ids_str)));

        if ( ! $term_id || empty($post_ids) ) {
            wp_send_json_error(['message' => 'Invalid data']);
            return;
        }

        $term = get_term($term_id);
        if (!$term || is_wp_error($term)) {
            wp_send_json_error(['message' => 'Invalid term']);
            return;
        }

        self::update_order($term->term_taxonomy_id, $post_ids);

        wp_send_json_success(['message' => 'Order updated successfully']);
    }

    public static function ajax_get_series_posts() {
        // Verify user has permission
        if ( ! current_user_can('edit_posts') ) {
            wp_send_json_error(['message' => 'No permission']);
            return;
        }

        // Verify nonce
        $nonce = $_POST['nonce'] ?? $_REQUEST['nonce'] ?? '';
        if ( ! wp_verify_nonce( $nonce, 'sm_series_nonce' ) ) {
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

        $formatted_posts = array_map(function($post) {
            return [
                'id' => $post->ID,
                'title' => [
                    'rendered' => $post->post_title ?: 'Untitled'
                ]
            ];
        }, $posts);

        wp_send_json_success($formatted_posts);
    }
}
