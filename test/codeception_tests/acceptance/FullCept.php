<?php

global $ssI;
$ssI = new AcceptanceTester($scenario);

require '../../../../../test/test.php';

$ssI->wait(3);
