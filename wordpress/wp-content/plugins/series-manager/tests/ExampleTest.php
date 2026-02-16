<?php

use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    public function testBasicMath()
    {
        $result = 2 + 2;

        $this->assertEquals(4, $result);
    }
}
