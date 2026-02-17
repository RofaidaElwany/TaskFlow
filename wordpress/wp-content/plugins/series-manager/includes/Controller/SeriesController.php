<?php

class SeriesController
{
    private $repository;
    private $service;
    private $formatter;

    public function __construct($repository, $service, $formatter)
    {
        $this->repository = $repository;
        $this->service = $service;
        $this->formatter = $formatter;

        add_action('wp_ajax_get_series_posts', [$this, 'handleAjax']);
        add_action('wp_ajax_nopriv_get_series_posts', [$this, 'handleAjax']);
    }

   public function handleAjax()
    {
        $term_id = intval($_POST['term_id'] ?? 0);

        if (!$term_id) {
            wp_send_json_error('Invalid term ID');
        }

        $postIdsString = $this->repository->getPostIdsByTerm($term_id);

        if (!$postIdsString) {
            wp_send_json_success([]);
        }

        $postIds = $this->service->parsePostIds($postIdsString);

        $posts = get_posts([
            'post__in' => $postIds,
            'orderby'  => 'post__in',
            'numberposts' => -1
        ]);

        $sortedPosts = $this->service->sortPostsBySeriesOrder($posts, $postIds);

        $formatted = $this->formatter->formatPosts($sortedPosts);

        wp_send_json_success($formatted);
    }
}
