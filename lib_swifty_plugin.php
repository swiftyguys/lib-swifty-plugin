<?php
// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) exit;

class LibSwiftyPlugin
{
    private static $instance;

    protected $swifty_plugins = array();

    public function __construct()
    {
        self::$instance = $this;

        add_action( 'swifty_hook_admin_add_swifty_menu', array( &$this, 'hook_admin_add_swifty_menu' ), 99, 4 );
    }

    public static function get_instance() {

        if ( ! isset( self::$instance ) && ! ( self::$instance instanceof LibSwiftyPlugin ) ) {
            self::$instance = new LibSwiftyPlugin();
        }
        return self::$instance;
    }

    function hook_admin_add_swifty_menu( $name, $key, $func, $register_plugin ) {
        // Add the Swifty main admin menu (once for all plugins).
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
            $name,
            $name,
            'manage_options',
            $key,
            $func
        );

        if ( $register_plugin ) {
            $this->swifty_plugins[] = array('key' => $key, 'name' => $name);
        }
    }

    // The Swifty admin main menu page (For ALL Swifty plugins)
    function admin_swifty_menu_page() {
        echo "<h1>Swifty plugins</h1>";

        echo "<h4><br>Active Swifty plugins:</h4>";

        foreach( $this->swifty_plugins as $plugin ) {
            echo '<a href="' . admin_url( 'admin.php?page=' . $plugin[ 'key' ] ) . '">' . $plugin[ 'name' ] . '</a><br>';
        }
    }

}
