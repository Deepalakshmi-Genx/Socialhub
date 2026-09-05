<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::create('/api/social/meta/url?type=page&target=facebook_page', 'GET');
$start = microtime(true);
$response = $kernel->handle($request);
$end = microtime(true);

echo "Time taken: " . ($end - $start) . " seconds\n";
echo "Response: " . $response->getContent() . "\n";
