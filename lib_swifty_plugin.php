<?php
// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) exit;

require_once plugin_dir_path( __FILE__ ) . 'lib_swifty_plugin_view.php';
require_once plugin_dir_path( __FILE__ ) . 'php/lib/swifty_class-tgm-plugin-activation.php';

class LibSwiftyPlugin extends LibSwiftyPluginView
{
    protected $swifty_plugins = array();

    public function __construct()
    {
        parent::__construct();


    }

    public function admin_add_swifty_menu( $name, $key, $func, $register_plugin ) {
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
        $page = add_submenu_page(
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
        return $page;
    }

    // The Swifty admin main menu page (For ALL Swifty plugins)
    function admin_swifty_menu_page() {
        echo "<h1>Swifty plugins</h1>";

        echo "<h4><br>Active Swifty plugins:</h4>";

        foreach( $this->swifty_plugins as $plugin ) {
            echo '<a href="' . admin_url( 'admin.php?page=' . $plugin[ 'key' ] ) . '">' . $plugin[ 'name' ] . '</a><br>';
        }
    }

    // change the permalink to postname option. Call this on plugin activation:
    //register_activation_hook( __FILE__, array( LibSwiftyPlugin::get_instance(), 'change_permalinks' ) );
    public function change_permalinks()
    {
        add_action( 'permalink_structure_changed', array( &$this, 'action_permalink_structure_changed'), 10, 2 );

        global $wp_rewrite;
        $wp_rewrite->set_permalink_structure( '/%postname%/' );

        remove_action( 'permalink_structure_changed', array( &$this, 'action_permalink_structure_changed' ) );
    }

    // helper function
    public function action_permalink_structure_changed( $old_permalink_structure, $permalink_structure )
    {
        // make sure that the functions needed for writing htaccess are available
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/misc.php');

        // is only triggered when something actually has changed
        global $wp_rewrite;
        $wp_rewrite->flush_rules();
    }
}
