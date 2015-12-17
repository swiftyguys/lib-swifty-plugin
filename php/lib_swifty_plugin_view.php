<?php
// Exit if accessed directly
if( ! defined( 'ABSPATH' ) ) exit;

// remove this after new version of SCC is online, otherwise old SCC installs will fail when newer version of swiftylib is
// used in other plugins
require_once plugin_dir_path( __FILE__ ) . 'lib/swifty-captcha.php';

/**
 * Class LibSwiftyPluginView shared functions for view mode
 */
class LibSwiftyPluginView
{
    protected static $instance_view;
    protected static $_ss_mode = null;
    protected static $_valid_modes = array( 'ss', 'wp', 'ss_force' );
    protected static $_default_mode = 'ss';
    protected static $included_view_js = false;
    protected static $included_head_script = false;

    /**
     * Constructor adds action and filter
     */
    public function __construct()
    {
        self::$instance_view = $this;

        // just in case this was not set by an old autoload.php
        global $swifty_lib_dir;
        if( ! isset( $swifty_lib_dir ) ) {
            $swifty_lib_dir = dirname( plugin_dir_path( __FILE__ ) );
        }

        // allow every plugin to get to the initialization part, all plugins and theme should be loaded then
        add_action( 'after_setup_theme', array( $this, 'action_after_setup_theme' ) );
        add_filter( 'swifty_SS2_hosting_name', array( $this, 'filter_swifty_SS2_hosting_name' ) );
    }

    /**
     * Singleton
     *
     * @return LibSwiftyPluginView
     */
    public static function get_instance()
    {
        return self::$instance_view;
    }

    /**
     * array with active plugins
     */
    public static $required_active_plugins = array();

    /**
     * is this plugin active? Keep track of earlier checks to improve speed
     *
     * @param $plugin_name
     * @return bool
     */
    public static function is_required_plugin_active( $plugin_name )
    {
        // do we already know the answer?
        if( array_key_exists( $plugin_name, self::$required_active_plugins ) ) {
            return self::$required_active_plugins[ $plugin_name ];
        }
        // no then we will find out: get all plugins and look for the plugin name in the directory name

        if( ! function_exists( 'get_plugins' ) ) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        $keys = array_keys( get_plugins() );

        $slug = $plugin_name;
        foreach( $keys as $key ) {
            if( preg_match( '|^' . $slug . '/|', $key ) ) {
                $slug = $key;
                break;
            }
        }
        return self::$required_active_plugins[ $plugin_name ] = is_plugin_active( $slug );
    }

    public static $required_plugin_active_swifty_site = false;
    public static $required_theme_active_swifty_site_designer = false;

    /**
     * When all plugins and themes are loaded set some static members, simplyfies testing if ssm and ssd are active
     */
    public function action_after_setup_theme()
    {
        self::$required_plugin_active_swifty_site = defined( 'SWIFTY_MENU_PLUGIN_FILE' );
        self::$required_theme_active_swifty_site_designer = defined( 'SWIFTY_SITE_DESIGNER_THEME_FILE' );
    }

    protected static $filter_swifty_SS2_hosting_name = null;

    /**
     * return the name of the SS2 hoster, when set indicates a full SS2 setup with this name as hosting partner,
     * otherwise returns $default
     *
     * @param $default
     * @return bool
     */
    public function filter_swifty_SS2_hosting_name( $default )
    {
        if( ! isset( self::$filter_swifty_SS2_hosting_name ) ) {
            self::$filter_swifty_SS2_hosting_name = get_option( 'ss2_hosting_name' );
        }
        return $default || self::$filter_swifty_SS2_hosting_name;
    }

    /**
     * Add swifty menu option to the wp-admin bar
     */
    public static function add_swifty_to_admin_bar()
    {

        // make sure that the font is loaded for the swifty icon:
        // wp_enqueue_style( 'font_swiftysiteui.css', $this->this_plugin_url . 'css/font_swiftysiteui.css', false, $scc_version );
        // in a hook of wp_head

        global $wp_admin_bar;

        if( ! $wp_admin_bar->get_node( 'swifty' ) ) {

            $title = '<span class="ab-icon"></span><span class="ab-label">Swifty</span>'; // Do not translate!
            $title .= '<span class="screen-reader-text">Swifty</span>'; // Do not translate!

            $wp_admin_bar->add_menu( array(
                'id' => 'swifty',
                'title' => $title,
            ) );
        }
    }

    /**
     * test if $plugin_name is active
     * All swifty plugins will respond to the 'swifty_active_plugins' filter and it's name
     * to the array.
     *
     * @param $plugin_name
     * @return bool
     */
    public static function is_swifty_plugin_active( $plugin_name )
    {
        return in_array( $plugin_name, apply_filters( 'swifty_active_plugins', array() ) );
    }

    /**
     * is swifty menu active?
     * make sure all plugins are constructed before using this function
     *
     * @return bool|null
     */
    public static function is_ss_mode()
    {
        if( ! isset( self::$_ss_mode ) ) {
            self::$_ss_mode = ( ( ( empty( $_COOKIE[ 'ss_mode' ] ) || $_COOKIE[ 'ss_mode' ] === 'ss' )
                    && self::is_swifty_plugin_active( 'swifty-site' ) )
                || self::is_ss_force() );
        }
        return self::$_ss_mode;
    }

    /**
     * set the ss_mode cookie, use ss_mode Get attribute
     * defaults to ss
     */
    public static function set_ss_mode()
    {
        // reset the ss_mode, after setting cookies the value might change
        self::$_ss_mode = null;

        $mode = '';

        if( ! empty( $_COOKIE[ 'ss_mode' ] ) && in_array( $_COOKIE[ 'ss_mode' ], self::$_valid_modes ) ) {
            $mode = $_COOKIE[ 'ss_mode' ];
        }

        if( ! empty( $_GET[ 'ss_mode' ] ) && in_array( $_GET[ 'ss_mode' ], self::$_valid_modes ) ) {
            $mode = $_GET[ 'ss_mode' ];
        }

        if( ! $mode ) {
            $mode = self::$_default_mode;
        }

        setcookie( 'ss_mode', $mode, 0, '/' );
        $_COOKIE[ 'ss_mode' ] = $mode;
    }

    /**
     * is the ss_mode cookie forced?
     *
     * @return bool
     */
    public static function is_ss_force()
    {
        return ( ! empty( $_COOKIE[ 'ss_mode' ] ) && $_COOKIE[ 'ss_mode' ] === 'ss_force' );
    }

    /**
     * find newer version of post, or return null if there is no newer autosave version
     *
     * @param $pid
     * @return mixed|null
     */
    public function get_autosave_version_if_newer( $pid )
    {
        // Detect if there exists an autosave newer than the post and if that autosave is different than the post
        $autosave = wp_get_post_autosave( $pid );
        $post = get_post( $pid );
        $newer_revision = null;
        if( $autosave && $post && ( mysql2date( 'U', $autosave->post_modified_gmt, false ) >= mysql2date( 'U', $post->post_modified_gmt, false ) ) ) {
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

    /**
     * use ssd enqueue_script method when ssd is the active theme, otherwise use wp_enqueue_script
     *
     * @param $handle
     * @param bool|false $src
     * @param array $deps
     * @param bool|false $ver
     * @param bool|false $in_footer
     */
    public static function lazy_load_js( $handle, $src = false, $deps = array(), $ver = false, $in_footer = false )
    {
        if( self::$required_theme_active_swifty_site_designer ) {
            do_action( 'swifty_lazy_load_js', $handle, $src, $deps, $ver, $in_footer );
        } else {
            wp_enqueue_script( $handle, $src, $deps, $ver, $in_footer );
        }
    }

    /**
     * load minified version of script if possible and use ssd enqueue_script method when ssd is the active theme,
     * otherwise use wp_enqueue_script
     *
     * @param $handle
     * @param bool|false $src
     * @param array $deps
     * @param bool|false $ver
     * @param bool|false $in_footer
     */
    public static function lazy_load_js_min( $handle, $src = false, $deps = array(), $ver = false, $in_footer = false )
    {
        global $swifty_build_use;
        $bust_add = '?swcv=ss2_' . '/*@echo RELEASE_TAG*/';
        $file = $src;
        if( $swifty_build_use == 'build' ) {
            $file = preg_replace( '|\.js$|', '.min.js', $file );
        }
        $file .= $bust_add;
        self::lazy_load_js( $handle, $file, $deps, $ver, $in_footer );
    }

    /**
     * use ssd enqueue_style method when ssd is the active theme,
     * otherwise use wp_enqueue_style
     *
     * @param $handle
     * @param bool|false $src
     * @param array $deps
     * @param bool|false $ver
     * @param string $media
     */
    public static function lazy_load_css( $handle, $src = false, $deps = array(), $ver = false, $media = 'all' )
    {
        if( self::$required_theme_active_swifty_site_designer ) {
            do_action( 'swifty_lazy_load_css', $handle, $src, $deps, $ver, $media );
        } else {
            wp_enqueue_style( $handle, $src, $deps, $ver, $media );
        }
    }

    /**
     * initialise head and footer hooks for swifty scripts
     */
    public function init_script_hooks() {
        // include initialization script in header
        add_action( 'wp_head', array( $this, 'hook_wp_head_include_head_script' ), 1 );
        // include view.js in footer
        add_action( 'wp_footer', array( $this, 'hook_wp_footer_include_view_js' ), 1 );
    }

    /**
     * wp_footer action, include the view.js loading
     */
    public function hook_wp_footer_include_view_js() {
        self::echo_included_view_js();
    }

    /**
     * echo the script that will load the view.js
     */
    public static function echo_included_view_js() {
        if(! self::$included_view_js ) {
            self::$included_view_js = true;

            global $swifty_build_use;
            $bust_add = '?swcv=ssd_' . '/*@echo RELEASE_TAG*/';
            if( $swifty_build_use === 'build' ) {
                $view_file = get_swifty_lib_dir_url( __FILE__ ) . 'js/view.min.js' . $bust_add;
            } else {
                $view_file = get_swifty_lib_dir_url( __FILE__ ) . 'lib/swifty_plugin/js/view.js' . $bust_add;
            }
?>
<script>
    var element = document.createElement("script");
    element.src = '<?php echo$view_file; ?>';
    document.body.appendChild(element);
</script>
<?php

        }
    }

    /**
     * wp_head action, include some js script needed in the head
     */
    public function hook_wp_head_include_head_script() {
        self::echo_include_head_script();
    }

    /**
     * echo some js script needed in the head
     */
    public static function echo_include_head_script() {
        if( ! self::$included_head_script ) {
            self::$included_head_script = true;
?>
<script>
var ssd_status_onload = 0;
var ssd_list_loadCss = [];
var ssd_add_loadCss = function( s ) {
    ssd_list_loadCss.push(s);
    if( typeof swifty_do_loadCSS === 'function' ) {
        swifty_do_loadCSS();
    }
};
var ssd_list_loadJs = [];
var ssd_add_loadJs = function( s ) {
    ssd_list_loadJs.push(s);
    if( typeof swifty_do_loadJs === 'function' ) {
        swifty_do_loadJs();
    }
};
var ssd_list_loadFont = [];
var ssd_add_loadFont = function( s ) {
    ssd_list_loadFont.push(s);
    if( typeof swifty_do_loadFont === 'function' ) {
        swifty_do_loadFont();
    }
};
var swifty_list_exec = [ { 'status': 'hold', 'for': 'page_loaded' } ];
var swifty_add_exec = function( s ) {
    swifty_list_exec.push(s);
    if( typeof swifty_do_exec === 'function' ) {
        swifty_do_exec();
    }
};
</script>
<?php
        }
    }
}

/**
 * load the swifty font, only load the latest version.
 */
if( ! function_exists( 'swifty_lib_view_enqueue_styles' ) ) {

    /**
     * load swifty font only when user is logged in. Use latest version of font
     */
    function swifty_lib_view_enqueue_styles()
    {
        if( is_user_logged_in() ) {
            global $swifty_build_use;

            if( $swifty_build_use == 'build' ) {
                $swifty_font_url = get_swifty_lib_dir_url( __FILE__ ) . 'css/swifty-font.css';
            } else {
                $swifty_font_url = get_swifty_lib_dir_url( __FILE__ ) . 'lib/swifty_plugin/css/swifty-font.css';
            }

            $font_version = (int) '/*@echo FONT_REL_TAG*/';

            wp_enqueue_style(
                'swifty-font.css',
                $swifty_font_url,
                array(),
                $font_version,
                'all'
            );
        }
    }

    // load swifty font in both view and edit
    add_action( 'wp_enqueue_scripts', 'swifty_lib_view_enqueue_styles' );
    add_action( 'admin_enqueue_scripts', 'swifty_lib_view_enqueue_styles' );
}

if( ! function_exists( 'get_swifty_lib_dir_url' ) ) {

    /**
     * returns the plugin or theme url depending on the $file that is used
     * when the lib is used in a theme then the lib is located in the sub folder 'ssd', use this
     * to detect that the $file is used in a theme and not in a plugin
     *
     * @param $file
     * @return string
     */
    function get_swifty_lib_dir_url( $file )
    {
        // we need to work around the plugin dir link we use in our development systems
        $plugin_dir = dirname( dirname( dirname( dirname( $file ) ) ) );
        // get plugin name
        $plugin_basename = basename( $plugin_dir );

        // make sure we do not use the theme sub-folder of 'ssd' as plugin name
        if( $plugin_basename != 'ssd' ) {
            // this is a plugin
            $dir_url = trailingslashit( plugins_url( rawurlencode( $plugin_basename ) ) );
        } else {
            // this is a theme
            global $swifty_build_use;

            // get theme name
            $theme_basename = basename( dirname( $plugin_dir ) );
            $dir_url = trailingslashit( get_template_directory_uri( rawurlencode( $theme_basename ) ) );

            // on non builds we also need this 'ssd' sub folder
            if( $swifty_build_use != 'build' ) {
                $dir_url = trailingslashit( $dir_url . 'ssd' );
            }
        }
        return $dir_url;
    }
}