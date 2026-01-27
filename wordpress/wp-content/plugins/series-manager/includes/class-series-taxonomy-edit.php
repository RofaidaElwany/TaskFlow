<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class SM_Series_Taxonomy_Edit {

    /**
     * Register hooks
     */
    public static function register() {
        add_action( 'series_edit_form_fields', [ __CLASS__, 'render_posts_list' ], 10, 2 );
        add_action( 'admin_enqueue_scripts', [ __CLASS__, 'enqueue_assets' ] );
    }

    /**
     * Render posts list in Edit Series screen
     */
    public static function render_posts_list( $term, $taxonomy ) {
        global $wpdb;

        // نجيب term_taxonomy_id الصح
        $term_taxonomy_id = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT term_taxonomy_id 
                 FROM {$wpdb->term_taxonomy} 
                 WHERE term_id = %d",
                $term->term_id
            )
        );

        if ( ! $term_taxonomy_id ) {
            return;
        }

        // نجيب البوستات مرتبة حسب term_order
        $posts = $wpdb->get_results(
            $wpdb->prepare(
                "
                SELECT p.ID, p.post_title
                FROM {$wpdb->posts} p
                INNER JOIN {$wpdb->term_relationships} tr
                    ON p.ID = tr.object_id
                WHERE tr.term_taxonomy_id = %d
                ORDER BY tr.term_order ASC
                ",
                $term_taxonomy_id
            )
        );
        ?>
        <tr class="form-field sm-series-posts-field">
            <th scope="row">
                <label><?php esc_html_e( 'Series Posts Order', 'series-manager' ); ?></label>
            </th>
            <td>
                <?php if ( empty( $posts ) ) : ?>
                    <p><?php esc_html_e( 'No posts in this series.', 'series-manager' ); ?></p>
                <?php else : ?>
                    <ul id="sm-series-posts">
                        <?php foreach ( $posts as $post ) : ?>
                            <li data-post-id="<?php echo esc_attr( $post->ID ); ?>">
                                <?php echo esc_html( $post->post_title ?: __( 'Untitled', 'series-manager' ) ); ?>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                    <p class="description">
                        <?php esc_html_e( 'Drag and drop to reorder posts in this series.', 'series-manager' ); ?>
                    </p>
                <?php endif; ?>
            </td>
        </tr>
        <?php
    }

    /**
     * Enqueue JS & CSS for Edit Series page
     */
    public static function enqueue_assets( $hook ) {

        // نشتغل بس في صفحة تعديل التاكسونومي
        if ( $hook !== 'term.php' ) {
            return;
        }

        if ( empty( $_GET['taxonomy'] ) || $_GET['taxonomy'] !== 'series' ) {
            return;
        }

        wp_enqueue_script(
            'sm-series-taxonomy-order',
            plugins_url( '../assets/admin/series-order.js', __FILE__ ),
            [ 'jquery', 'jquery-ui-sortable' ],
            '1.0',
            true
        );

        wp_localize_script(
            'sm-series-taxonomy-order',
            'SMSeries',
            [
                'term_id' => isset( $_GET['tag_ID'] ) ? (int) $_GET['tag_ID'] : 0,
                'nonce'   => wp_create_nonce( 'sm_series_nonce' ),
                'ajaxurl' => admin_url( 'admin-ajax.php' ),
            ]
        );

        wp_enqueue_style(
            'sm-series-taxonomy-style',
            plugins_url( '../assets/admin/series-order.css', __FILE__ ),
            [],
            '1.0'
        );
    }
}
