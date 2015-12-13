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

/**
 * This function is to replace PHP's extremely buggy realpath().
 * @param string The original path, can be relative etc.
 * @return string The resolved path, it might not exist.
 */
function truepath($path){
    // whether $path is unix or not
    $unipath=strlen($path)==0 || $path{0}!='/';
    // attempts to detect if path is relative in which case, add cwd
    if(strpos($path,':')===false && $unipath)
        $path=getcwd().DIRECTORY_SEPARATOR.$path;
    // resolve path parts (single dot, double dot and double delimiters)
    $path = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $path);
    $parts = array_filter(explode(DIRECTORY_SEPARATOR, $path), 'strlen');
    $absolutes = array();
    foreach ($parts as $part) {
        if ('.'  == $part) continue;
        if ('..' == $part) {
            array_pop($absolutes);
        } else {
            $absolutes[] = $part;
        }
    }
    $path=implode(DIRECTORY_SEPARATOR, $absolutes);
    // resolve any symlinks
    if(file_exists($path) && linkinfo($path)>0)$path=readlink($path);
    // put initial separator that could have been lost
    $path=!$unipath ? '/'.$path : $path;
    return $path;
}

$path = truepath( getcwd(). '/../../../../../test' );

if( file_exists( $path . '/test.php' ) ) {
    require $path . '/test.php';
//} else {
//    require '../../../../../../test/test.php';
}

$ssI->wait(3);
