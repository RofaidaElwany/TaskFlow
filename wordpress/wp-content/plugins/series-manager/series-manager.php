<?php

/**
 * Plugin Name: Series Manager
 * Description: Manage post series and navigation between them.
 * Version: 0.1.0
 * Author: Rofaida
 */

if (! defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/includes/class-series-taxonomy.php';
require_once __DIR__ . '/includes/class-series-taxonomy-edit.php';
require_once __DIR__ . '/includes/class-series-order.php';
require_once __DIR__ . '/includes/class-series-block-render.php';

function sm_register_everything()
{
    SM_Series_Taxonomy::register();
    SM_Series_Taxonomy_Edit::register();
    SM_Series_Order::register();  

    register_block_type(
        __DIR__,
        [
            'render_callback' => ['SM_Series_Block_Render', 'render'],
        ]
    );
}

add_action('init', 'sm_register_everything');

function sm_enqueue_post_editor_assets() {
    $screen = get_current_screen();

    if ( ! $screen || $screen->base !== 'post' ) {
        return;
    }

    $asset_file = include plugin_dir_path( __FILE__ ) . 'build/index.asset.php';

    wp_enqueue_script(
        'sm-series-post-editor',
        plugins_url( 'build/index.js', __FILE__ ),
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    wp_enqueue_style(
        'sm-series-post-editor',
        plugins_url( 'build/index.css', __FILE__ ),
        [],
        $asset_file['version']
    );

    // Localize BEFORE the script runs
    wp_localize_script(
        'sm-series-post-editor',
        'SMSeries',
        [
            'nonce'   => wp_create_nonce( 'sm_series_nonce' ),
            'ajaxurl' => admin_url( 'admin-ajax.php' ),
        ]
    );
}
add_action( 'admin_enqueue_scripts', 'sm_enqueue_post_editor_assets' );

// Localize block editor script with nonce and ajaxurl
add_action('wp_enqueue_scripts', function() {
    // Localize the block editor script
    if (wp_script_is('wp-block-series-manager-series', 'enqueued')) {
        wp_localize_script(
            'wp-block-series-manager-series',
            'SMSeries',
            [
                'nonce' => wp_create_nonce('sm_series_nonce'),
                'ajaxurl' => admin_url('admin-ajax.php'),
            ]
        );
    }
});


// Enqueue front-end styles

function sm_enqueue_front_assets()
{
    wp_enqueue_style(
        'sm-series-style',
        plugins_url('assets/frontend/series.css', __FILE__),
        [],
        filemtime(plugin_dir_path(__FILE__) . 'assets/frontend/series.css')
    );
}
add_action('wp_enqueue_scripts', 'sm_enqueue_front_assets');

// Append series block to the end of post content
add_filter('the_content', 'sm_append_series_to_content');

function sm_append_series_to_content($content)
{
    if (! is_singular('post')) {
        return $content;
    }

    if (! in_the_loop() || ! is_main_query()) {
        return $content;
    }

    $series_html = SM_Series_Block_Render::render([]);

    if (! $series_html) {
        return $content;
    }

    return $content . $series_html;
}


