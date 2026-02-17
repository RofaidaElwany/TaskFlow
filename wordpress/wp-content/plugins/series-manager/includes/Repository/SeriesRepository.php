<?php

class SeriesRepository
{
    private $wpdb;

    public function __construct($wpdb)
    {
        $this->wpdb = $wpdb;
    }

    public function getPostIdsByTerm(int $term_id): ?string
    {
        return $this->wpdb->get_var(
            $this->wpdb->prepare(
                "SELECT meta_value FROM {$this->wpdb->termmeta}
                 WHERE term_id = %d AND meta_key = %s",
                $term_id,
                'series_post_ids'
            )
        );
    }
}
