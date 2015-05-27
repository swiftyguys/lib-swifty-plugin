<?php

include 'ss_story.php';

class SSCeption extends SSStory {

    public function __construct() {
        $this->TestSetup();
        $this->TakeAction();
    }

    function TestSetup0() {
        // load the test settings; any settings in private will overrule the same settings in public
        $settingsPublic = json_decode( file_get_contents( dirname( __FILE__ ) . '/settings_public.json' ), true );
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

        $js = 'return swiftyProbe.' . $doName . '(["' . addslashes( $functionName ) . '", ' . json_encode($input) . ']);';
        if( $wait ) {
            $js = 'return swiftyProbe.' . $doName . '([' . json_encode( $wait ) . ', "' . addslashes( $functionName ) . '", ' . json_encode( $input ) . ']);';
        }
        $ret = $ssI->executeJS( $js );

        return $ret;
    }

    ////////////////////////////////////////

    function Fail( $t, $t2 ) {
        throw new PHPUnit_Framework_AssertionFailedError( '========== ERROR =========>>> ' . $t . ' = ' . $t2 );
    }

    ////////////////////////////////////////

    function __EchoMsg( $s ) {
        // Force output to console, even if --silent
        $out = fopen( 'php://stdout', 'w' );
        fputs( $out, $s );
        fclose( $out );
    }

    ////////////////////////////////////////

    function GotoUrl( $input ) {
        global $ssI;
        $I = $ssI;

        $I->amOnPage( $input[ 'url' ] );

        if( array_key_exists( 'waitForSelector', $input ) ) {
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
//        $I->see('Dashboard');
        $I->dontSeeInCurrentUrl('?loggedout=true');
    }

    ////////////////////////////////////////

    function SetCookie( $name, $val ) {
        global $ssI;
        $I = $ssI;

        $I->setCookie( $name, $val );
        $I->wait( 1 );
    }

    ////////////////////////////////////////

    function DeleteCookie( $name ) {
        global $ssI;
        $I = $ssI;

        $I->resetCookie( $name );
        $I->wait( 1 );
    }
}

