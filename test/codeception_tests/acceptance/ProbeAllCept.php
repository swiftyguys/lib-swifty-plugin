<?php

//\Codeception\Subscriber\Console::beforeStep = function(StepEvent $e)
//{
//    if (!$this->steps or !$e->getTest() instanceof ScenarioDriven) {
//        return;
//    }
//    $this->output->writeln("* " . $e->getStep());
//};

global $ssI;
$ssI = new AcceptanceTester($scenario);

if( file_exists( '../../../../../test/test.php' ) ) {
    require '../../../../../test/test.php';
} else {
    require '../../../../../../test/test.php';
}

$ssI->wait(3);
