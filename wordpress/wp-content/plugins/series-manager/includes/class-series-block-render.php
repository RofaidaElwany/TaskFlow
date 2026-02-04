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
        $post = get_post($post_id);
        $terms = wp_get_post_terms($post_id, 'series');

        if (empty($terms) || is_wp_error($terms)) {
            return '';
        }

        ob_start();
?>
        <div class="flex justify-center my-7">
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
                    'orderby' => 'date',
                    'order'   => 'ASC',
                ]);

                if (empty($posts)) {
                    continue;
                }

                $post_ids = wp_list_pluck($posts, 'ID');
                $current_index = array_search($post_id, $post_ids, true);
                $total_posts = count($posts);

                $prev_post = $current_index > 0
                    ? get_post($post_ids[$current_index - 1])
                    : null;

                $next_post = $current_index < $total_posts - 1
                    ? get_post($post_ids[$current_index + 1])
                    : null;
            ?>
                <div class="w-full max-w-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <!-- Header -->
                    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <!-- Series title and part info -->
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                Series: <?php echo esc_html($term->name); ?>
                            </h2>
                        </div>
                        <div class="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                            Part <?php echo intval($current_index + 1); ?> of <?php echo intval($total_posts); ?>
                        </div>
                    </div>
                    <!-- Series list -->
                    <div class="flex flex-col py-2">
                        <?php
                        $index = 1;
                        foreach ($posts as $p) :
                            $is_current = $p->ID === $post_id;
                        ?>
                            <?php if ($is_current) : ?>
                                <div aria-current="step" class="relative flex items-center gap-4 bg-primary/5 dark:bg-primary/10 px-6 py-4 border-l-4 border-primary">
                                    <div class="flex items-center justify-center rounded-lg bg-primary/20 text-primary w-10 h-10 flex-shrink-0">
                                        <span class="material-symbols-outlined">check_circle</span>
                                    </div>
                                    <div class="flex flex-col flex-1 truncate">
                                        <p class="text-primary text-base font-semibold truncate">
                                            <?php echo esc_html($p->post_title); ?>
                                        </p>
                                        <span class="text-[10px] text-primary/70 font-bold uppercase tracking-widest">You are here</span>
                                    </div>
                                    <div class="shrink-0">
                                        <span class="text-primary text-xs font-semibold px-2 py-1 bg-white dark:bg-gray-900 rounded border border-primary/20">Current Post</span>
                                    </div>
                                </div>
                            <?php else : ?>
                                <a class="group flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" href="<?php echo esc_url(get_permalink($p)); ?>">
                                    <div class="flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 w-10 h-10 flex-shrink-0 group-hover:text-primary transition-colors">
                                        <span class="material-symbols-outlined">link</span>
                                    </div>
                                    <p class="text-gray-900 dark:text-gray-200 text-base font-medium flex-1 truncate">
                                        <?php echo esc_html($p->post_title); ?>
                                    </p>
                                    <div class="shrink-0 text-gray-300 group-hover:text-primary transition-colors">
                                        <span class="material-symbols-outlined">chevron_right</span>
                                    </div>
                                </a>
                            <?php endif; ?>
                        <?php
                            $index++;
                        endforeach;
                        ?>
                    </div>

                    <!-- Navigation Footer -->
                    <div class="px-6 pb-6 pt-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <?php if ($prev_post) : ?>
                                <a class="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary/50 hover:shadow-md transition-all" href="<?php echo esc_url(get_permalink($prev_post)); ?>">
                                    <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <span class="material-symbols-outlined">arrow_back</span>
                                    </div>
                                    <div class="flex flex-col overflow-hidden">
                                        <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Previous Post</span>
                                        <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            <?php echo esc_html($prev_post->post_title); ?>
                                        </span>
                                    </div>
                                </a>
                            <?php else : ?>
                                <div class="opacity-50 flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                                    <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                                        <span class="material-symbols-outlined">arrow_back</span>
                                    </div>
                                    <div class="flex flex-col overflow-hidden">
                                        <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Previous Post</span>
                                        <span class="text-sm font-semibold text-gray-400 dark:text-gray-500 truncate">No previous post</span>
                                    </div>
                                </div>
                            <?php endif; ?>

                            <?php if ($next_post) : ?>
                                <a class="group flex items-center justify-end gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary/50 hover:shadow-md transition-all text-right" href="<?php echo esc_url(get_permalink($next_post)); ?>">
                                    <div class="flex flex-col overflow-hidden order-1">
                                        <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Next Post</span>
                                        <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            <?php echo esc_html($next_post->post_title); ?>
                                        </span>
                                    </div>
                                    <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 group-hover:bg-primary group-hover:text-white transition-colors order-2">
                                        <span class="material-symbols-outlined">arrow_forward</span>
                                    </div>
                                </a>
                            <?php else : ?>
                                <div class="opacity-50 flex items-center justify-end gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-right">
                                    <div class="flex flex-col overflow-hidden order-1">
                                        <span class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Next Post</span>
                                        <span class="text-sm font-semibold text-gray-400 dark:text-gray-500 truncate">No next post</span>
                                    </div>
                                    <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 order-2">
                                        <span class="material-symbols-outlined">arrow_forward</span>
                                    </div>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php
            }
            ?>
        </div>
<?php

        return ob_get_clean();
    }
}





