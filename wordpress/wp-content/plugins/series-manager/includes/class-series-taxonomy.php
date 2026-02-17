<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class SM_Series_Taxonomy {

    public static function register() {
        register_taxonomy(
            'series',
            'post',
            [
                'labels' => [
                    'name'          => 'Series',
                    'singular_name' => 'Series',
                ],
                'public'            => true,
                'hierarchical'      => false,
                'show_in_rest'      => true,
                'show_admin_column' => true,
                'sort'               => true,
                'args'              => [ 'orderby' => 'term_order' ],
                'rewrite'           => [ 'slug' => 'series' ],
            ]
        );
    }
}
