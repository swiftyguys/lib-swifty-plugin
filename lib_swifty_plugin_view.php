<?php
// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) exit;

class LibSwiftyPluginView
{
    protected static $instance;

    public function __construct()
    {
        self::$instance = $this;

        // allow every plugin to get to the initialization part, all plugins should be loaded then
        add_action( 'plugins_loaded', array($this, 'action_plugins_loaded') );
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

    // is swifty menu active?
    public function is_ss_mode()
    {
        return ( ! empty( $_COOKIE[ 'ss_mode' ] ) && $_COOKIE[ 'ss_mode' ] === 'ss' );
    }
}
