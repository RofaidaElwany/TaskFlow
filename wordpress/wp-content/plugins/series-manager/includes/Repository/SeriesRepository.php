<?php

class SeriesRepository
{
    private $wpdb;

    public function __construct($wpdb)
    {
        $this->wpdb = $wpdb;
    }

    /* =========================
     * Ensure DB Column
    ========================= */
    public function ensureTermOrderColumn()
    {
        $table = $this->wpdb->term_relationships;
        $exists = $this->wpdb->get_results(
            "SHOW COLUMNS FROM `$table` LIKE 'term_order'"
        );
        if (empty($exists)) {
            $this->wpdb->query(
                "ALTER TABLE `$table`
                 ADD COLUMN `term_order` INT(11) NOT NULL DEFAULT 0
                 AFTER `term_taxonomy_id`"
            );
        }
    }

    /* =========================
     * READ: Get ordered posts
    ========================= */
    public function getOrderedPosts(int $term_taxonomy_id): array
    {
        $this->ensureTermOrderColumn();

        return $this->wpdb->get_results(
            $this->wpdb->prepare(
                "SELECT p.ID, p.post_title, tr.term_order
                 FROM {$this->wpdb->posts} p
                 INNER JOIN {$this->wpdb->term_relationships} tr
                     ON p.ID = tr.object_id
                 WHERE tr.term_taxonomy_id = %d
                 AND p.post_status = 'publish'
                 ORDER BY tr.term_order ASC",
                $term_taxonomy_id
            )
        );
    }

    /* =========================
     * WRITE: Update order
    ========================= */
    public function updateOrder(int $term_taxonomy_id, array $post_ids)
    {
        $this->ensureTermOrderColumn();

        foreach ($post_ids as $index => $post_id) {
            $this->wpdb->replace(
                $this->wpdb->term_relationships,
                [
                    'object_id'        => (int) $post_id,
                    'term_taxonomy_id' => (int) $term_taxonomy_id,
                    'term_order'       => (int) $index,
                ],
                ['%d', '%d', '%d']
            );
        }
    }

    /* =========================
     * WRITE: Persist order meta
    ========================= */
    public function persistOrderMeta(int $term_id, array $post_ids)
    {
        update_term_meta((int) $term_id, 'sm_series_order', implode(',', $post_ids));
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
