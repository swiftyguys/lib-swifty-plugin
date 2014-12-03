<?php
// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) exit;

if ( ! class_exists( 'LibSwiftyPluginView' ) ) {
    require_once plugin_dir_path( __FILE__ ) . 'lib_swifty_plugin_view.php';
}
require_once plugin_dir_path( __FILE__ ) . 'php/lib/swifty_class-tgm-plugin-activation.php';

class LibSwiftyPlugin extends LibSwiftyPluginView
{
    protected $our_swifty_plugins = array();

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
            $this->our_swifty_plugins[] = array('key' => $key, 'name' => $name);
        }
        return $page;
    }

    // The Swifty admin main menu page (For ALL Swifty plugins)
    function admin_swifty_menu_page() {
        echo "<h1>Swifty plugins</h1>";

        echo "<h4><br>Active Swifty plugins:</h4>";

        foreach( $this->our_swifty_plugins as $plugin ) {
            echo '<a href="' . admin_url( 'admin.php?page=' . $plugin[ 'key' ] ) . '">' . $plugin[ 'name' ] . '</a><br>';
        }
    }

    // Our plugin admin menu page
    function admin_options_menu_page( $admin_page_title, $admin_page, $tab_general_title, $tab_general_method )
    {
        // example:
        //global $scc_oLocale;
        //$admin_page_title = $scc_oLocale[ 'Swifty Content Creator' ];
        //$admin_page = $this->swifty_admin_page;
        //$tab_general_title = 'General';
        //$tab_general_method = array( $this, 'scc_tab_options_content' );

        $settings_tabs = array( 'scc_options' => array( 'title' => $tab_general_title, 'method' => $tab_general_method ) );
        $settings_tabs = apply_filters( 'swifty_admin_page_tabs_' . $admin_page, $settings_tabs );

        // make sure the selected tab exists, last active might be not added this time for some reason
        $tab = isset( $_GET[ 'tab' ] ) && array_key_exists( $_GET[ 'tab' ], $settings_tabs ) ? $_GET[ 'tab' ] : 'scc_options';

        ?>
        <div class='wrap'>
            <h2><?php echo $admin_page_title; ?></h2>

            <h2 class="nav-tab-wrapper">
                <?php
                foreach( $settings_tabs as $tab_page => $tab_info ) {
                    $active_tab = $tab == $tab_page ? 'nav-tab-active' : '';
                    echo '<a class="nav-tab ' . $active_tab . '" href="?page=' . $admin_page . '&tab=' . $tab_page . '">' . $tab_info[ 'title' ] . '</a>';
                }
                ?>
            </h2>

            <form action='options.php' method='post'>
                <div class="main">
                    <?php
                    call_user_func( $settings_tabs[ $tab ][ 'method' ] );
                    ?>
                </div>
            </form>
        </div>
    <?php
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

    // find newer version of post, or return null if there is no newer autosave version
    public function get_autosave_version_if_newer( $pid)
    {
        // Detect if there exists an autosave newer than the post and if that autosave is different than the post
        $autosave = wp_get_post_autosave( $pid );
        $post = get_post( $pid );
        $newer_revision = null;
        if( $autosave && mysql2date( 'U', $autosave->post_modified_gmt, false ) > mysql2date( 'U', $post->post_modified_gmt, false ) ) {
            foreach( _wp_post_revision_fields() as $autosave_field => $_autosave_field ) {
                if( normalize_whitespace( $autosave->$autosave_field ) != normalize_whitespace( $post->$autosave_field ) ) {
                    if( $autosave_field === 'post_content' ) {
                        $newer_revision = $autosave->$autosave_field;
                    }
                }
            }
            unset( $autosave_field, $_autosave_field );
        }

        return $newer_revision;
    }

}
