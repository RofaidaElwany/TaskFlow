<?php

if (! defined('ABSPATH')) {
    exit;
}

class SM_Series_Block_Render
{
    public static function init()
    {
        register_block_type('series-manager/series-list', [
            'render_callback' => [self::class, 'render'],
            'attributes'      => [
                'align' => [
                    'type' => 'string',
                ],
            ],
        ]);
    }

    public static function render($attributes)
    {
        if (! is_singular('post')) {
            return '';
        }

        $post_id = get_the_ID();
        $terms = wp_get_post_terms($post_id, 'series');

        if (empty($terms) || is_wp_error($terms)) {
            return '';
        }

        ob_start();
        ?>
        <div class="sm-series-wrapper">
        <?php
        foreach ($terms as $term) {
            $posts = get_posts([
                'post_type'   => 'post',
                'numberposts' => -1,
                'tax_query'   => [
                    [
                        'taxonomy' => 'series',
                        'terms'    => $term->term_id,
                    ],
                ],
                'orderby' => 'term_order',
                'order'   => 'ASC',
            ]);

            if (empty($posts)) {
                continue;
            }

            $post_ids = wp_list_pluck($posts, 'ID');
            $current_index = array_search($post_id, $post_ids, true);

            $prev_post = $current_index > 0
                ? get_post($post_ids[$current_index - 1])
                : null;

            $next_post = $current_index < count($post_ids) - 1
                ? get_post($post_ids[$current_index + 1])
                : null;
        ?>
            <div class="sm-series">
                <h3><?php echo esc_html($term->name); ?></h3>
                <ul class="sm-series-list">
                    <?php foreach ($posts as $p) : ?>
                        <li class="sm-series-item <?php echo $p->ID === $post_id ? 'is-current' : ''; ?>">
                            <a href="<?php echo esc_url(get_permalink($p)); ?>">
                                <?php echo esc_html($p->post_title); ?>
                            </a>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
            <div class="sm-series-nav">
                <?php if ($prev_post) : ?>
                    <a class="sm-series-prev" href="<?php echo esc_url(get_permalink($prev_post)); ?>">
                        ← <?php echo esc_html(get_the_title($prev_post)); ?>
                    </a>
                <?php endif; ?>

                <?php if ($next_post) : ?>
                    <a class="sm-series-next" href="<?php echo esc_url(get_permalink($next_post)); ?>">
                        <?php echo esc_html(get_the_title($next_post)); ?> →
                    </a>
                <?php endif; ?>
            </div>
            
        <?php
        }
        ?>
        </div>
        <?php

        return ob_get_clean();
    }
}
