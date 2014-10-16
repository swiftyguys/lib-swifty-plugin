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

    public static $required_plugin_active_ninja_forms = false;
    public static $required_plugin_active_shortcodes_ultimate = false;
    public static $required_plugin_active_wordpress_canvas_gallery = false;
    public static $required_plugin_active_swifty_site = false;

    public function action_plugins_loaded()
    {
        self::$required_plugin_active_ninja_forms = defined( 'NF_PLUGIN_VERSION' );
        self::$required_plugin_active_shortcodes_ultimate = defined( 'SU_PLUGIN_FILE' );
        self::$required_plugin_active_wordpress_canvas_gallery = defined( 'WC_GALLERY_VERSION' );
        self::$required_plugin_active_swifty_site = defined( 'SWIFTY_SITE_PLUGIN_URL' );
    }
}
