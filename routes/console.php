<?php

use Illuminate\Foundation\Console\ClosureCommand;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    /** @var ClosureCommand $this */
    while(true){
        $this->comment(Inspiring::quote());
        sleep(2);
    }
})->purpose('Display an inspiring quote');
