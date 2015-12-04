<?php

use DataSift\Storyplayer\PlayerLib\StoryTeller;
use DataSift\Storyplayer\Prose\E5xx_ActionFailed;

include 'wordpress.php';

class SSStory
{

    public $data;
    protected $plugin_name = '';
    protected $tryFunctions = array();
    protected $tryFlags = array();
    protected $msg_level = 0;
    protected $tryVars = array();

    ////////////////////////////////////////

    function getText()
    { // Shortcut
        return $this->st->fromBrowser()->getText();
    }

    ////////////////////////////////////////

    function assertsString( $txt )
    { // Shortcut
        return $this->st->assertsString( $txt );
    }

    ////////////////////////////////////////

    function TakeAction()
    { // Must be called first in a derived method
        $this->PrepareForTest();
    }

    ////////////////////////////////////////

    function TestSetup()
    {
        $this->TestSetup0();
        $this->TestSetup1();
        $this->TestSetup2();
        $this->TestSetup3();
        $this->SetupProbeDescription();
        $this->RegisterTries();
    }

    ////////////////////////////////////////

    function RegisterTries()
    {
        $this->RegisterTry(
            'I have a fresh install',
            function () {
                // When plugin runs for the first time (without other SS plugins), SS mode must be off
                $this->DeleteCookie( 'ss_mode' );
            }
        );

        $this->RegisterTry(
            'I am logged in',
            function () {
                if( ! $this->GetTryFlag( 'wp_logged_in' ) ) {
                    $this->WPLogin();
                    $this->SetTryFlag( 'wp_logged_in', true );
                }
            }
        );

        $this->RegisterTry(
            'I am on the homepage',
            function () {
                $this->GotoUrl( array( 'url' => '/' ) );
            }
        );

        $this->RegisterTry(
            'The "Swifty Site Designer" theme is activated',
            function () {
                $this->WPActivateTheme();
            }
        );
    }

    ////////////////////////////////////////

    function SetupProbeDescription()
    {
        global $ssProbeDesciption;
        $ssProbeDesciption = array();

        $stack = array( &$ssProbeDesciption );
        $current = &$stack[ 0 ];
        $lastIndent = -1;
        if( file_exists( dirname( __FILE__ ) . '/../../../../../../test/test.desc' ) ) {
            $handle = fopen( dirname( __FILE__ ) . '/../../../../../../test/test.desc', "r" );
        } else {
            $handle = fopen( dirname( __FILE__ ) . '/../../../../../../../test/test.desc', "r" );
        }
        if( $handle ) {
            while( ( $line = fgets( $handle ) ) !== false ) {
                $line = preg_replace( "/\r|\n/", "", $line );

                if( $line !== '' && substr( $line, 0, 1 ) !== '#' ) {
                    $indent = 0;
                    $i = 0;
                    while( substr( $line, $i, 4 ) === '    ' || substr( $line, $i, 1 ) === "\t" ) {
                        if( substr( $line, 0, 4 ) === '    ' ) {
                            $indent++;
                            $i += 4;
                        }
                        if( substr( $line, 0, 1 ) === "\t" ) {
                            $indent++;
                            $i++;
                        }
                    }
                    $afterIndent = substr( $line, $i );

                    if( $indent !== $lastIndent ) {
                        $current = &$stack[ $indent ];
                        if( $indent > 0 ) {
                            if( ! array_key_exists( 'val', $current ) ) {
                                $current[ 'val' ] = array();
                            }
                            $current = &$current[ 'val' ];
                        }
                    }

                    if( $afterIndent !== '' ) {
                        if( substr( $afterIndent, 0, 1 ) === '-' ) {
                            if( ! array_key_exists( 'params', $stack[ $indent + 1 ] ) ) {
                                $stack[ $indent + 1 ][ 'params' ] = array();
                            }

                            $words = explode( ':', $afterIndent );
                            $startWord = substr( array_shift( $words ), 2 );
                            $json = implode( ':', $words );

                            $stack[ $indent + 1 ][ 'params' ][ $startWord ] = $json;
                        } else {
                            $current[] = array( 'key' => $afterIndent );

                            $stack[ $indent + 1 ] = &$current[ count( $current ) - 1 ];
                        }
                    }

                    $lastIndent = $indent;
                }
            }

            fclose( $handle );
        }

//        $out = fopen('php://stdout', 'w');
//        fputs($out, "\n######################################################################\n" . print_r( $ssProbeDesciption, true ) . "\n######################################################################\n" );
//        fclose($out);
    }

    ////////////////////////////////////////

    function SetupStory( $name )
    {
        $story = $GLOBALS[ 'story' ] = newStoryFor( 'Wordpress' )
            ->inGroup( $name )
            ->called( 'Test ' . $name . '.' );

        $story->addTestSetup( function ( StoryTeller $st ) {
            $ssStory = $GLOBALS[ 'ssStory' ];
            $ssStory->st = $st;
            $ssStory->ori_story = $GLOBALS[ 'story' ];
            $ssStory->TestSetup();
        } );

        $story->addTestTeardown( function ( StoryTeller $st ) {
            $ssStory = $GLOBALS[ 'ssStory' ];
            $ssStory->st = $st;
            $ssStory->TestTeardown();
        } );

        $story->addAction( function ( StoryTeller $st ) {
            $ssStory = $GLOBALS[ 'ssStory' ];
            $ssStory->st = $st;
            $ssStory->TakeAction();
        } );

        $story->addPostTestInspection( function ( StoryTeller $st ) {
            //    $st->assertsString($this->data->testText)->equals("Akismet");
        } );

        return $story;
    }

    ////////////////////////////////////////

    function TestSetup0()
    {
        $st = $this->st;

        // Can be overwritten in command line, via -D platform=...
        $this->ori_story->setParams( array(
            'platform' => 'local',
//            'wp_version' => '3.9.1',
            'wp_version' => '4.2.2',
            'lang' => 'en'
        ) );
        // get the final list of params
        // this will include any changes made from the command-line
        $this->params = $st->getParams();

        // load the test settings; any settings in private will overrule the same settings in public
        $settingsPublic = json_decode( file_get_contents( dirname( __FILE__ ) . '/settings_public.json' ), true );
        $settingsPublic[ $this->params[ 'platform' ] ] = ( isset( $settingsPublic[ $this->params[ 'platform' ] ] ) && is_array( $settingsPublic[ $this->params[ 'platform' ] ] ) ) ? $settingsPublic[ $this->params[ 'platform' ] ] : array(); // initialize if necessary
        if( file_exists( dirname( __FILE__ ) . '/../../../../../../test/settings_private.json' ) ) {
            $settingsPrivate = json_decode( file_get_contents( dirname( __FILE__ ) . '/../../../../../../test/settings_private.json' ), true );
        } else {
            $settingsPrivate = json_decode( file_get_contents( dirname( __FILE__ ) . '/../../../../../../../test/settings_private.json' ), true );
        }
        $this->data = new stdClass(); // Empty object
        $this->data->testSettings = (object) array_replace_recursive(
            $settingsPublic[ 'default' ],
            $settingsPublic[ $this->params[ 'platform' ] ],
            $settingsPrivate[ 'default' ],
            $settingsPrivate[ $this->params[ 'platform' ] ]
        );
    }

    ////////////////////////////////////////

    function TestSetup1()
    {
        // Sort the settings by order field
        uasort( $this->data->testSettings->setup, function ( $a, $b ) {
            if( $a[ 'order' ] < $b[ 'order' ] ) {
                return -1;
            }
            return 1;
        } );
    }

    ////////////////////////////////////////

    function TestSetup2()
    {
        $st = $this->st;

        $this->wordpress = new Wordpress(
            $this,
            $st,
            $this->params[ 'wp_version' ],
            $this->params[ 'lang' ],
            $this->data->testSettings->wp_user,
            $this->data->testSettings->wp_pass
        );

        // what are we calling this host?
        $this->data->instanceName = 'storyplayer1';

        // What settings name was given? (Use # vendor/bin/storyplayer -D platform=...)
        switch( $this->params[ 'platform' ] ) {
            case 'ec2':
                $this->CreateEc2();
                break;
            case 'local':
                break;
            default:
        }
    }

    ////////////////////////////////////////

    function TestSetup3()
    {
        $this->data->do_phase_after_install = array();
        $this->data->do_phase_after_login = array();
        // Install items defined in settings
        foreach( $this->data->testSettings->setup as $setupItem ) {
            $setupItem = (object) $setupItem;
            if( $setupItem->action == 'install' ) {
                if( $setupItem->type == 'webapp' ) {
                    $this->InstallWebApp( $setupItem );
                    if( $setupItem->after_install == 'setup' ) {
                        array_push( $this->data->do_phase_after_install, $setupItem );
                    }
                }
                if( $setupItem->type == 'wp_plugin' ) {
                    if( isset( $this->params[ 'relpath' ] ) ) {
                        $this->wordpress->InstallPlugin( $this->params[ 'relpath' ], $setupItem->to_abspath, $this->params[ 'plugin_path_1' ], $this->params[ 'plugin_path_2' ] );
                    } else {
                        $this->wordpress->InstallPlugin( $setupItem->relpath, $setupItem->to_abspath, $this->params[ 'plugin_path_1' ], $this->params[ 'plugin_path_2' ] );
                    }
                }
            }
        }

    }

    ////////////////////////////////////////

    function TestTeardown()
    {
        $st = $this->st;

        switch( $this->params[ 'platform' ] ) {
            case 'ec2':
                $this->DestroyEc2( $st );
                break;
            default:
        }
    }

    ////////////////////////////////////////

    function PrepareForTest()
    {
        // Call to this function must be as a first start of the first test

        // Do after install
        foreach( $this->data->do_phase_after_install as $setupItem ) {
            if( $setupItem->type == 'webapp' ) {
                if( $setupItem->after_install == 'setup' ) {
                    $this->SetupWebApp( $setupItem->slug );
                }
            }
        }
    }

    ////////////////////////////////////////

    function CreateEc2()
    {
        $st = $this->st;

        $this->EchoMsg( "Create Amazon AWS EC2 server" );

        // create the VM, based on an AMI
        $st->usingEc2()->createVm( $this->data->instanceName, "centos6", "ami-1f23522f", 't1.micro', "default" );

        // we need to make sure the root filesystem is destroyed on termination
        $st->usingEc2Instance( $this->data->instanceName )->markAllVolumesAsDeleteOnTermination();

        // we need to wait for a bit to allow EC2 to catch up :(
        $st->usingTimer()->waitFor( function ( $st ) {
            // we need to run a command (any command) on the host, to get it added
            // to SSH's known_hosts file
            $st->usingHost( $this->data->instanceName )->runCommandAsUser( "ls", "root" );
        }, 'PT5M' );

        $this->data->testSettings->domain = $st->fromHost( $this->data->instanceName )->getIpAddress();
        //    $this->data->testSettings->domain = $st->fromEc2Instance( $this->data->instanceName )->getPublicDnsName();
        $this->wordpress->SetDomain( $this->data->testSettings->domain );
    }

    ////////////////////////////////////////

    function DestroyEc2()
    {
        $st = $this->st;

        $this->EchoMsg( "Destroy Amazon AWS EC2 server" );

        // destroy the instance we created
        if( isset( $this->data->instanceName ) ) {
            // do we have a test VM to destroy?
            $hostDetails = $st->fromHostsTable()->getDetailsForHost( $this->data->instanceName );
            if( $hostDetails !== null ) {
                // destroy this host
                $st->usingEc2()->destroyVm( $this->data->instanceName );
            }
        }

        // destroy the image that we booted to test
        if( isset( $this->data->imageName ) ) {
            // do we have a test VM to destroy?
            $hostDetails = $st->fromHostsTable()->getDetailsForHost( $this->data->imageName );
            if( $hostDetails !== null ) {
                // destroy this host
                $st->usingEc2()->destroyVm( $this->data->imageName );
            }
        }
    }

    ////////////////////////////////////////

    function InstallWebApp( $setupItem )
    {
        $st = $this->st;

        $this->EchoMsg( "Install Web App" );

        if( $this->params[ 'platform' ] == "ec2" ) {
            if( $setupItem->slug == "wordpress" ) {
                $this->wordpress->Install( $setupItem );
            }
        } else {
            // dorh
        }
    }

    ////////////////////////////////////////

    function SetupWebApp( $slug )
    {
        global $ssStory;

        if( $slug == "wordpress" ) {
            //        ActionSetupWordpress( $st );
            $ssStory->wordpress->Setup();
        }
    }

    ////////////////////////////////////////

    function FindElementsByXpath( $xpath )
    {
        $st = $this->st;

        return $st->fromBrowser()->getElementsByXpath( array( $xpath ) );
        //    $topElement = $st->fromBrowser()->getTopElement();
        //    $elements = $topElement->getElements('xpath', $xpath);
    }

    ////////////////////////////////////////

    function FindElementsByXpathMustExist( $xpath )
    {
        $st = $this->st;

        $elements = $st->fromBrowser()->getElementsByXpath( array( $xpath ) );
        if( count( $elements ) > 0 ) {
            return $elements;
        } else {
            // dorh Throw exception (or something) so teardown will be done correctly
        }
        return null;
    }

    ////////////////////////////////////////

    function FindElementByXpath( $xpath )
    {
        $st = $this->st;

        // Find an element without throwing an error is no element found.
        $elements = $st->fromBrowser()->getElementsByXpath( array( $xpath ) );
        if( count( $elements ) > 0 ) {
            return $elements[ 0 ];
        }
        return null;
    }

    ////////////////////////////////////////

    function FindElementByXpathMustExist( $xpath )
    {
        $st = $this->st;

        // Will throw an error if the element is not found
        return $st->getRunningDevice()->getElement( 'xpath', $xpath );
    }

    ////////////////////////////////////////

    function HoverElementByXpath( $xpath )
    {
        $st = $this->st;

        $element = $this->FindElementByXpathMustExist( $xpath );
        $st->getRunningDevice()->moveto( array( 'element' => $element->getID() ) );
        $st->usingTimer()->wait( 1, "Wait for the hover to take effect (for instance a dropdown)." );
    }

    ////////////////////////////////////////

    function ClickElementByXpath( $xpath, $mode )
    {
        $element = $this->FindElementByXpath( $xpath );
        if( $element || $mode != "graceful" ) {
            $element->click();
        }
    }

    ////////////////////////////////////////

    function __EchoMsg( $s )
    {
        echo $s;
    }

    ////////////////////////////////////////

    function _EchoMsg( $s )
    {
        $this->__EchoMsg( str_replace( '•', '.', $s ) );
    }

    ////////////////////////////////////////

    function EchoMsg( $str )
    {
        $s = '';
        $sp = str_pad( '', 4 * $this->msg_level );

        $s .= "\n";
        $s .= $sp . "----------------------------------------------------------------------\n";
        $s .= $sp . ' ' . $str . "\n";
        $s .= $sp . "----------------------------------------------------------------------\n";

        $this->_EchoMsg( $s );
    }

    ////////////////////////////////////////

    function EchoMsgJs( $str )
    {
        $s = '';
        $sp = str_pad( '', 4 + 4 * $this->msg_level );

        if( strpos( $str, '.Start = ' ) !== false ) {
            $s .= "\n";
        }
//        $s .= $sp . "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n" . $sp . str_replace( "\n" . $sp . "_-EnD_-" , "\n", str_replace( "\n", "\n" . $sp, $str ) . "_-EnD_-" );
        $s .= $sp . str_replace( "\n" . $sp . "_-EnD_-", "\n", str_replace( "\n", "\n" . $sp, $str ) . "_-EnD_-" );

        $this->_EchoMsg( $s );
    }

    ////////////////////////////////////////

    function ContainingClass( $className )
    {
        return "contains(concat(' ',normalize-space(@class),' '),' " . $className . " ')";
    }

    ////////////////////////////////////////

    function ExecuteJs( $functionName, $input, $doName = 'DoStart', $wait = null )
    {
        $js = 'return swiftyProbe.' . $doName . '(arguments);';
        if( $wait ) {
            $ret = $this->st->getRunningDevice()->execute( array( 'script' => $js, 'args' => array( $wait, $functionName, $input ) ) );
        } else {
            $ret = $this->st->getRunningDevice()->execute( array( 'script' => $js, 'args' => array( $functionName, $input ) ) );
        }

        return $ret;
    }

    ////////////////////////////////////////

    function Probe( $functionName, $desc = '', $input = array() )
    {
//        $this->EchoMsgJs( "\nTest: " . $functionName . ' ( ' . $desc . ' ) ' . "\n" );
        $this->EchoMsgJs( "\nTest: " . $functionName . "\n" );

        $this->msg_level++;

        $input[ 'plugin_name' ] = $this->plugin_name;

        $ret = $this->ExecuteJs( $functionName, $input );

        $this->ProbeProcessRet( $functionName, $input, $ret );

        $this->msg_level--;
    }

    ////////////////////////////////////////

    function DoTry( $name, $startWord )
    {
        global $ssProbeDesciption;

        $name_ori = $name;

        if( strpos( $name, '{{' ) !== false ) {
            $name_arr = explode( '{{', $name );
            $name = '';

            foreach( $name_arr as $name_part ) {
                $name_part_arr = explode( '}}', $name_part );
                if( count( $name_part_arr ) == 1 ) {
                    $name .= $name_part;
                } else {
                    $vari_arr = explode( '=', $name_part_arr[ 0 ] );
//                    $this->EchoMsg( 'Var found: ' . $name_part_arr[ 0 ] );
                    if( count( $vari_arr ) > 1 ) {
                        $this->tryVars[ $vari_arr[ 0 ] ] = $vari_arr[ 1 ];
                    } else {
                        $name .= $this->tryVars[ $vari_arr[ 0 ] ];
                    }

                    $name .= $name_part_arr[ 1 ];
                }
            }

//            $this->EchoMsg( 'Parsed commnd: ' . $name );
        }

        $msg = ucfirst( $startWord ) . ': ' . $name_ori;
        if( $name_ori !== $name ) {
            $msg .= ' ==> ' . $name;
        }
        $this->EchoMsg( $msg );

        $this->msg_level++;

        $inTryFunctions = false;
        foreach( $this->tryFunctions as $tryFunction ) {
            if( $tryFunction[ 'name' ] === $name ) {
                $inTryFunctions = true;
                $tryFunction[ 'func' ]();
            }
        }

        if( ! $inTryFunctions ) {
            $ret = $this->FindProbeDescription( $ssProbeDesciption, $name );

            if( is_array( $ret ) ) {
                foreach( $ret as $step ) {
                    $words = explode( ' ', $step[ 'key' ] );
                    $startWord = strtolower( array_shift( $words ) );
                    $stepName = implode( ' ', $words );

                    if( array_key_exists( 'params', $step ) ) {
                        $params = '{';
                        $i = 0;
                        $len = count( $step[ 'params' ] );
                        foreach( $step[ 'params' ] as $key => $json ) {
                            $params .= ' "' . $key . '": ' . $json;
                            if( $i !== $len - 1 ) { // not last
                                $params .= ',';
                            }
                            $i++;
                        }
                        $params .= '}';
                        $stepName .= ' WITH PARAMS ' . $params;
                    }

                    $this->DoTry( $stepName, $startWord );
                }
            } else {
                $input[ 'plugin_name' ] = $this->plugin_name;

                $ret = $this->ExecuteJs( $name, $input, 'DoTry' );

                if( array_key_exists( 'try_name', $ret ) ) {
                    $this->Probe( $ret[ 'try_name' ], '', $ret[ 'try_data' ] );
                } else {
                    $this->Fail( 'Try step not found', $name );
                }
            }
        }

        $this->msg_level--;
    }

    ////////////////////////////////////////

    function RegisterTry( $name, $func )
    {
        $this->tryFunctions[] = array( 'name' => $name, 'func' => $func );
    }

    ////////////////////////////////////////

    function GetTryFlag( $key )
    {
        if( array_key_exists( $key, $this->tryFlags ) ) {
            return $this->tryFlags[ $key ];
        } else {
            return null;
        }
    }

    ////////////////////////////////////////

    function SetTryFlag( $key, $val )
    {
        $this->tryFlags[ $key ] = $val;
    }

    ////////////////////////////////////////

    function RunProbeDescription()
    {
        global $ssProbeDesciption;

        foreach( $ssProbeDesciption as $main ) {
            $words = explode( ' ', $main[ 'key' ] );
            $startWord = strtolower( array_shift( $words ) );
            $stepName = implode( ' ', $words );

            if( $startWord === 'run' ) {
                $this->DoTry( $stepName, $startWord );
            }
        }
    }

    ////////////////////////////////////////

    function FindProbeDescription( $steps, $name )
    {
        $ret = null;

        foreach( $steps as $step ) {
            if( ! $ret ) {
                $words = explode( ' ', $step[ 'key' ] );
                array_shift( $words );
                $stepName = implode( ' ', $words );

                if( array_key_exists( 'val', $step ) ) {
                    if( $name === $stepName ) {
                        $ret = $step[ 'val' ];
                    } else {
                        $ret = $this->FindProbeDescription( $step[ 'val' ], $name );
                    }
                }
            }
        }

        return $ret;
    }

    ////////////////////////////////////////

    function SetPluginName( $pluginName )
    {
        $this->plugin_name = $pluginName;
    }

    ////////////////////////////////////////

    function Fail( $t, $t2 )
    {
        throw new E5xx_ActionFailed( $t, $t2 );
    }

    ////////////////////////////////////////

    function GotoUrl( $input )
    {
        $st = $this->st;

        $st->usingBrowser()->gotoPage( "http://" . $this->data->testSettings->domain . $input[ 'url' ] );
    }

    ////////////////////////////////////////

    function ProbeProcessRet( $functionName, $input, $returned )
    {
        $ret = $returned;

        if( ! isset( $ret[ 'ret' ] ) ) {
            $this->EchoMsgJs( "NO DATA RETURNED:\n" );
//            throw new E5xx_ActionFailed( "JS NO DATA RETURNED", "No data returned" );
            $this->Fail( "JS NO DATA RETURNED", "No data returned" );
        } else {
            if( isset( $ret[ 'ret' ][ 'fail' ] ) ) {
                if( isset( $ret[ 'ret' ][ 'fail_result_html' ] ) ) {
                    // Save the resulting html and the compare html to files on the drive, so they can be compared by a file compare tool.
                    $path = realpath( dirname( __FILE__ ) ) . '/../../../../js/probe/';
                    if( is_dir( $path ) ) {
                        $path .= 'tmp/';
                        if( ! file_exists( $path ) ) {
                            mkdir( $path, 0777, true );
                        }
                        file_put_contents( $path . 'latest_test_result.txt', $ret[ 'ret' ][ 'fail_result_html' ] );
                        file_put_contents( $path . 'latest_test_compare.txt', $ret[ 'ret' ][ 'fail_compare_html' ] );
                    }
                }

                $this->EchoMsgJs( "FAIL:" . $ret[ 'ret' ][ 'fail' ] . "\n" );
//                throw new E5xx_ActionFailed( "JS FAIL", $ret[ 'ret' ][ 'fail' ] );
                $this->Fail( "JS FAIL", $ret[ 'ret' ][ 'fail' ] );
            } else {
                $this->EchoMsgJs( $ret[ 'ret' ][ 'tmp_log' ] );
//                $this->EchoMsg( "DEBUG:\n". print_r( $ret, true ) );

                if( isset( $ret[ 'ret' ][ 'queue' ] ) ) {
//                    $js = 'return swiftyProbe.DoStart(arguments);';

//                    echo "\n\n\neeeeeeeeeeeeeeeeeeeee:\n".$ret[ 'ret' ][ 'queue' ][ 'new_fn_name' ]."\n\n\n";

                    $prevFunctionName = $functionName;
                    $prevInput = $input;
                    $functionName = $ret[ 'ret' ][ 'queue' ][ 'new_fn_name' ];
                    $input = $ret[ 'ret' ][ 'queue' ][ 'new_input' ];
                    $nextFnName = $ret[ 'ret' ][ 'queue' ][ 'next_fn_name' ];
                    $nextFnFunc = $ret[ 'ret' ][ 'queue' ][ 'next_fn_func' ];

                    if( $functionName === 'GotoUrl' ) {
                        $this->GotoUrl( $input );
                    } else {
                        $ret = $this->ExecuteJs( $functionName, $input );
                        $ret = $this->ProbeProcessRet( $functionName, $input, $ret );
                    }
                    $functionName = $prevFunctionName;
                    $input = $prevInput;
                    $input[ 'next_fn_name' ] = $nextFnName;
                    $input[ 'next_fn_func' ] = $nextFnFunc;
                    $ret = $this->ExecuteJs( $functionName, $input, 'DoNext' );
                    $ret = $this->ProbeProcessRet( $functionName, $input, $ret );
                }

                if( isset( $returned[ 'ret' ][ 'wait' ] ) ) {
                    $wait = $returned[ 'ret' ][ 'wait' ];
                    $waiting = true;
                    while( $waiting ) {
                        $prevInput = $input;
                        $input[ 'wait_data' ] = isset( $returned[ 'ret' ][ 'wait' ][ 'wait_data' ] ) ? $returned[ 'ret' ][ 'wait' ][ 'wait_data' ] : "undefined";
                        $ret = $this->ExecuteJs( $functionName, $input, 'DoWait', $wait );
                        $input = $prevInput;
//                        $this->EchoMsg( "DEBUG 2:\n". print_r( $ret, true ) );
                        if( ! isset( $ret[ 'ret' ][ 'wait_status' ] )
                            || $ret[ 'ret' ][ 'wait_status' ] != "waiting"
                            || isset( $ret[ 'ret' ][ 'fail' ] )
                        ) {
                            $waiting = false;
                        }
                    }
                    $ret = $this->ProbeProcessRet( $functionName, $input, $ret );
                }
            }
        }

        return $ret;
    }

    ////////////////////////////////////////

    function WPLogin()
    {
        $this->wordpress->Login();
    }

    ////////////////////////////////////////

    function WPActivateTheme()
    {
        $this->wordpress->ActivateTheme();
    }

    ////////////////////////////////////////

    function SetCookie( $name, $val )
    {
        $js = 'document.cookie = "' . $name . '=' . $val . ';"';
        $this->st->getRunningDevice()->execute( array( 'script' => $js, 'args' => array() ) );
    }

    ////////////////////////////////////////

    function DeleteCookie( $name )
    {
        $js = 'document.cookie = "' . $name . '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;"';
        $this->st->getRunningDevice()->execute( array( 'script' => $js, 'args' => array() ) );
    }
}

////////////////////////////////////////

