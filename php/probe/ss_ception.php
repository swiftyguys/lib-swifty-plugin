<?php

include 'ss_story.php';

class SSCeption extends SSStory {

    public function __construct() {
        $this->TestSetup();
        $this->TakeAction();
    }

    function TestSetup0() {
        // load the test settings; any settings in private will overrule the same settings in public
        $settingsPublic = json_decode( file_get_contents( dirname(__FILE__) . '/../../../../../../test/settings_public.json' ), true );
        $this->data = new stdClass(); // Empty object
        $this->data->testSettings = (object) $settingsPublic[ 'default' ];
    }

    ////////////////////////////////////////

    function TestSetup2() {
        // Intentionally empty
    }

    ////////////////////////////////////////

    function ExecuteJs( $functionName, $input, $doName = 'DoStart', $wait = null ) {
        global $ssI;

        $ssI->wantTo('Run Probe');

        $js = 'return swiftyProbe.' . $doName . '(["' . $functionName . '", ' . json_encode($input) . ']);';
        if( $wait ) {
            $js = 'return swiftyProbe.' . $doName . '([' . json_encode( $wait ) . ', "' . $functionName . '", ' . json_encode( $input ) . ']);';
        }
        $ret = $ssI->executeJS( $js );

        return $ret;
    }

    ////////////////////////////////////////

    function Fail( $t, $t2 ) {
        throw new PHPUnit_Framework_AssertionFailedError( '========== ERROR =========>>> ' . $t . ' = ' . $t2 );
    }

    ////////////////////////////////////////

    function EchoMsg( $s ) {
//        \Codeception\Util\Debug::debug( "\n######################################################################\n" . $s . "\n######################################################################\n\n" );

        // Force output to console, even if --silent
        $out = fopen('php://stdout', 'w');
        fputs($out, "\n######################################################################\n" . $s . "\n######################################################################\n" );
        fclose($out);
    }

    ////////////////////////////////////////

    function EchoMsgJs( $s ) {
//        if( strpos( $s, '.Start = ' ) !== false ) {
//            \Codeception\Util\Debug::debug( "\n\n" );
//        }
//        \Codeception\Util\Debug::debug( "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n" . $s );

        // Force output to console, even if --silent
        $out = fopen('php://stdout', 'w');
        if( strpos( $s, '.Start = ' ) !== false ) {
            fputs($out, "\n" );
        }
        fputs($out, "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n" . $s );
        fclose($out);
    }

    ////////////////////////////////////////

    function GotoUrl( $input ) {
        global $ssI;
        $I = $ssI;

        $I->amOnPage( $input[ 'url' ] );

        if( $input[ 'waitForSelector' ] ) {
            $I->waitForElementVisible( $input[ 'waitForSelector' ], 10 ); // secs
        }
    }

    ////////////////////////////////////////

    function WPLogin() {
        global $ssI;
        $I = $ssI;

        $I->wantTo('sign in');
        $I->amOnPage('wp-login.php?loggedout=true');
        $I->fillField('#user_login', 'test');
        $I->fillField('#user_pass', 'test!');
        $I->click('#wp-submit');
        $I->see('Dashboard');
    }

    ////////////////////////////////////////

    function SetCookie( $name, $val ) {
        global $ssI;
        $I = $ssI;

        $I->setCookie( $name, $val );
    }
}

