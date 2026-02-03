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


// Register AJAX handlers early (before admin_init)
SM_Series_Order::register();

function sm_register_everything()
{
    SM_Series_Taxonomy::register();
    SM_Series_Taxonomy_Edit::register();

    register_block_type(
        __DIR__,
        [
            'render_callback' => ['SM_Series_Block_Render', 'render'],
        ]
    );
}

add_action('init', 'sm_register_everything');

function sm_enqueue_post_editor_assets()
{
    $screen = get_current_screen();

    // Check if we're in the block editor (post edit screen)
    if (! $screen || ($screen->base !== 'post' && $screen->base !== 'site-editor')) {
        return;
    }

    // Only enqueue for post types that support series
    if ($screen->post_type && ! in_array($screen->post_type, ['post', 'page'])) {
        return;
    }

    $asset_file_path = plugin_dir_path(__FILE__) . 'build/index.asset.php';

    if (! file_exists($asset_file_path)) {
        return;
    }

    $asset_file = include $asset_file_path;

    $script_handle = 'sm-series-post-editor';

    wp_enqueue_script(
        $script_handle,
        plugins_url('build/index.js', __FILE__),
        $asset_file['dependencies'] ?? ['wp-plugins', 'wp-edit-post', 'wp-element', 'wp-components', 'wp-data'],
        $asset_file['version'] ?? filemtime(plugin_dir_path(__FILE__) . 'build/index.js'),
        true
    );

    // Only enqueue CSS if the file exists
    $css_file_path = plugin_dir_path(__FILE__) . 'build/index.css';
    if (file_exists($css_file_path)) {
        wp_enqueue_style(
            'sm-series-post-editor',
            plugins_url('build/index.css', __FILE__),
            [],
            $asset_file['version'] ?? filemtime($css_file_path)
        );
    }

    // Localize the script with AJAX data
    wp_localize_script(
        $script_handle,
        'SMSeries',
        [
            'nonce'   => wp_create_nonce('sm_series_nonce'),
            'ajaxurl' => admin_url('admin-ajax.php'),
        ]
    );
}
add_action('enqueue_block_editor_assets', 'sm_enqueue_post_editor_assets');



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

// Enqueue Material Symbols font for both editor and front-end
add_action('enqueue_block_assets', function () {
    wp_enqueue_style(
        'material-symbols',
        'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined',
        [],
        null
    );
});
