<?php

class SeriesFormatter
{
    public function formatPosts(array $posts): array
    {
        return array_map(function ($post) {
            return [
                'id' => $post->ID,
                'title' => [
                    'rendered' => $post->post_title ?: 'Untitled'
                ]
            ];
        }, $posts);
    }
}
