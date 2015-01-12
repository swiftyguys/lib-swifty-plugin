<?php
// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) exit;

class LibSwiftyPluginView
{
    protected static $instance;
    protected static $_valid_modes = array( 'ss', 'wp' );
    protected static $_default_mode = 'ss';

    public function __construct()
    {
        self::$instance = $this;

        // allow every plugin to get to the initialization part, all plugins should be loaded then
        add_action( 'plugins_loaded', array( $this, 'action_plugins_loaded' ) );
    }

    public static function get_instance()
    {
        return self::$instance;
    }

    public static $required_active_plugins = array();

    public static function is_required_plugin_active( $plugin_name )
    {
        // do we already know the answer?
        if( array_key_exists ( $plugin_name, self::$required_active_plugins ) ) {
            return self::$required_active_plugins[ $plugin_name ];
        }
        // no then we will find out: get all plugins and look for the plugin name in the directory name

        if ( ! function_exists( 'get_plugins' ) ) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        $keys = array_keys( get_plugins() );

        $slug = $plugin_name;
        foreach ( $keys as $key ) {
            if ( preg_match( '|^' . $slug .'/|', $key ) ) {
                $slug = $key;
                break;
            }
        }
        return self::$required_active_plugins[ $plugin_name ] = is_plugin_active( $slug );
    }

    public static $required_plugin_active_swifty_site = false;

    public function action_plugins_loaded()
    {
        self::$required_plugin_active_swifty_site = defined( 'SWIFTY_SITE_PLUGIN_URL' );
    }

    public static function add_swifty_to_admin_bar() {

        // make sure that the font is loaded for the swifty icon:
        // wp_enqueue_style( 'font_swiftysiteui.css', $this->this_plugin_url . 'css/font_swiftysiteui.css', false, $scc_version );
        // in a hook of wp_head

        global $wp_admin_bar;
        global $scc_oLocale;

        if( ! $wp_admin_bar->get_node( 'swifty' ) ) {

            $title = '<span class="ab-icon"></span><span class="ab-label">' . __( 'Swifty', 'swifty-plugin' ) . '</span>';
            $title .= '<span class="screen-reader-text">' . __( 'Swifty', 'swifty-plugin' ) . '</span>';

            $wp_admin_bar->add_menu( array(
                'id' => 'swifty',
                'title' => $title,
                'meta' => array(
                    'title' => __( 'Swifty', 'swifty-plugin' ),
                ),
            ) );
        }
    }

    // is swifty menu active?
    public static function is_ss_mode()
    {
        return ( empty( $_COOKIE[ 'ss_mode' ] ) || $_COOKIE[ 'ss_mode' ] === 'ss' );
    }

    public static function set_ss_mode()
    {
        $mode = '';

        if ( ! empty( $_COOKIE[ 'ss_mode' ] ) && in_array( $_COOKIE[ 'ss_mode' ], self::$_valid_modes ) ) {
            $mode = $_COOKIE[ 'ss_mode' ];
        }

        if ( ! empty( $_GET[ 'ss_mode' ] ) && in_array( $_GET[ 'ss_mode' ], self::$_valid_modes ) ) {
            $mode = $_GET[ 'ss_mode' ];
        }

        if ( ! $mode ) {
            $mode = self::$_default_mode;
        }

        setcookie( 'ss_mode', $mode, 0, '/' );
        $_COOKIE[ 'ss_mode' ] = $mode;
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

// load the swifty font, only load the latest version.

function enqueue_styles()
{
    if ( is_user_logged_in() ) {
        global $swifty_font_url;
        global $swifty_font_version;

        wp_enqueue_style(
            'swifty-font.css',
            $swifty_font_url,
            array(),
            $swifty_font_version,
            'all'
        );
    }
}

$font_version = (int)'/*@echo FONT_RELEASE_TAG*/';

global $swifty_font_version;
global $swifty_font_url;

if( !isset( $swifty_font_version ) || ( $swifty_font_version < $font_version ) ) {
    $swifty_font_version = $font_version;

    // we need to work around the plugin dir link we use in our development systems
    $plugin_dir      = dirname( dirname( dirname( __FILE__ ) ) );
    // get plugin name
    $plugin_basename = basename( $plugin_dir );
    $plugin_dir_url  = trailingslashit( plugins_url( rawurlencode( $plugin_basename ) ) );

    $swifty_font_url = $plugin_dir_url . 'lib/swifty_plugin/css/swifty-font.css';
}

// load swifty font in both view and edit
add_action( 'wp_enqueue_scripts', 'enqueue_styles' );
add_action( 'admin_enqueue_scripts', 'enqueue_styles' );