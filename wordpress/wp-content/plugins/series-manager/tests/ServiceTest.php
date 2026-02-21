<?php

use PHPUnit\Framework\TestCase;
use Service\SeriesService;

class ServiceTest extends TestCase{
    public function testParsePostIds()
    {
        $service = new SeriesService();

        $input = '1, 2, 3, 4';
        $expected = [1, 2, 3, 4];

        $result = $service->parsePostIds($input);

        $this->assertEquals($expected, $result);
    }

    public function testFindPostIndex()
    {
        $service = new SeriesService();

        $postIds = [10, 20, 30, 40];
        $postIdToFind = 30;

        $expectedIndex = 2;

        $result = $service->findPostIndex($postIds, $postIdToFind);

        $this->assertEquals($expectedIndex, $result);
    }

    public function testSortPostsBySeriesOrder()
    {
        $service = new SeriesService();


        $posts = [
            (object) ['ID' => 20, 'post_title' => 'Second'],
            (object) ['ID' => 10, 'post_title' => 'First'],
            (object) ['ID' => 30, 'post_title' => 'Third'],
        ];

        // Desired order of post IDs
        $postIdsOrder = [10, 20, 30];

        // Expected sorted posts
        $expected = [
            (object) ['ID' => 10, 'post_title' => 'First'],
            (object) ['ID' => 20, 'post_title' => 'Second'],
            (object) ['ID' => 30, 'post_title' => 'Third'],
        ];

        $result = $service->sortPostsBySeriesOrder($posts, $postIdsOrder);

        // Assert that the sorted posts match the expected order
        for ($i = 0; $i < count($expected); $i++) {
            $this->assertEquals($expected[$i]->ID, $result[$i]->ID);
            $this->assertEquals($expected[$i]->post_title, $result[$i]->post_title);
        }
    }   
} 