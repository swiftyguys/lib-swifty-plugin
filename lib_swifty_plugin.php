<?php
// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) exit;

class LibSwiftyPlugin
{
    protected $swifty_plugins = array();

    public function __construct()
    {
        add_filter( 'swifty_hook_admin_add_swifty_menu', array( &$this, 'hook_admin_add_swifty_menu' ), 99, 3 );
    }

    function hook_admin_add_swifty_menu( $name, $key, $func ) {
        // Add the Swifty main admin menu. This same menu is used by ALL Swifty plugins!
        if ( empty ( $GLOBALS[ 'admin_page_hooks' ][ 'swifty_admin' ] ) ) {
            add_menu_page(
                'Swifty',
                'Swifty',
                'manage_options',
                'swifty_admin',
                array( &$this, 'admin_swifty_menu_page' )
            );
        }

        // Add the admin submenu for our plugin
        add_submenu_page(
            'swifty_admin',
            'Plugins',
            'Plugins',
            'manage_options',
            'swifty_admin',
            array( &$this, 'admin_swifty_menu_page' )
        );

        // Add the admin submenu for our plugin
        add_submenu_page(
            'swifty_admin',
            $name,
            $name,
            'manage_options',
            $key,
            $func
        );

        $this->swifty_plugins[] = array( 'key' => $key, 'name' => $name );

        return true;
    }

    // The Swifty admin main menu page (For ALL Swifty plugins.
    function admin_swifty_menu_page() {
        echo "<h1>Swifty</h1>";

        echo "<h4><br>Active Swifty plugins:</h4>";

        foreach( $this->swifty_plugins as $plugin ) {
            echo '<a href="' . admin_url( 'admin.php?page=' . $plugin[ 'key' ] ) . '">' . $plugin[ 'name' ] . '</a><br>';
        }
    }

}
