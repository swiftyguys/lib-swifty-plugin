<?php

class Wordpress
{

    function Wordpress( $story, $st, $version, $lang, $user, $pass )
    {
        $this->story = $story; // The main/global application object
        $this->st = $st; // StoryTeller
        $this->version = $version;
        $this->lang = $lang;
        $this->user = $user;
        $this->pass = $pass;

        $this->tmpl = $this->story->data->testSettings->tmpl[ 'wp_' . $this->version ];
        $tl = $this->story->data->testSettings->tmpl[ 'wp_' . $this->lang . '_' . $this->version ];
        if( isset( $tl ) ) {
            $this->tmpl = $tl;
        }

        $this->strings = array();
        foreach( $this->story->data->testSettings->tmpl as $key => $tmpl ) {
            $l = 5;
            if( substr( $key, 0, $l ) == 's_wp_' ) { // global version
                $v = floatval( substr( $key, $l ) );
                if( $v > 0 && floatval( $this->version ) >= $v ) {
                    $this->strings = array_replace_recursive( $this->strings, $tmpl );
                }
            }
            $l = 6 + strlen( $this->lang );
            if( substr( $key, 0, $l ) == 's_wp_' . $this->lang . '_' ) { // specific lang
                $v = floatval( substr( $key, $l ) );
                if( $v > 0 && floatval( $this->version ) >= $v ) {
                    $this->strings = array_replace_recursive( $this->strings, $tmpl );
                }
            }
        }
    }

    ////////////////////////////////////////

    function SetDomain( $domain )
    {
        $this->domain = $domain;
    }

    ////////////////////////////////////////

    function Install( $setupItem )
    {
        $st = $this->st;

        $this->story->EchoMsg( "Install Wordpress " . $this->version );

        // Settings for Ansible Wordpress install
        // Make sure these settings are not in Ansible's group_vars/all file otherwise those seem to take precedence
        $vmParams = array(
            "install_now" => "wordpress",
            "wp_version" => $this->version,
            "wp_sha256sum" => $this->tmpl[ 'wp_sha256sum' ],
            "wp_subsite" => $this->lang == 'en' ? '' : $this->lang . '.',
            "wp_fileadd" => $this->lang == 'en' ? '' : '-' . $this->lang . '_' . strtoupper( $this->lang ),
            "wp_conf_lang" => $this->lang == 'en' ? '' : $this->lang . '_' . strtoupper( $this->lang ),
            "wp_db_name" => "wordpress",
            "wp_db_user" => "wordpress",
            "wp_db_password" => "secret",
            "mysql_port" => "3306"
        );

        // build up the provisioning definition
        $def = $st->usingProvisioning()->createDefinition();
        $st->usingProvisioningDefinition( $def )->addRole( 'wordpress-server' )->toHost( $this->story->data->instanceName );
        $st->usingProvisioningDefinition( $def )->addParams( $vmParams )->toHost( $this->story->data->instanceName );

        // provision our VM
        $st->usingProvisioningEngine( 'ansible' )->provisionHosts( $def );
    }

    ////////////////////////////////////////

    function Setup()
    {
        $st = $this->st;

        $this->story->EchoMsg( "Setup Wordpress" );

        $st->usingBrowser()->gotoPage( "http://" . $this->domain );

        // Since WP 4.1 (?) First step of setup is language choice
        $st->usingBrowser()->click()->intoFieldWithId( 'language-continue' );

        // Fill out setup fields
        $st->usingBrowser()->type( "storyplayer_test" )->intoFieldWithId( "weblog_title" );
        $st->usingBrowser()->clear()->intoFieldWithId( "user_login" );
        $st->usingBrowser()->type( $this->user )->intoFieldWithId( "user_login" );
        $st->usingBrowser()->type( $this->pass )->intoFieldWithId( "pass1" );
        $st->usingBrowser()->type( $this->pass )->intoFieldWithId( "pass2" );
        $st->usingBrowser()->type( "test@test.test" )->intoFieldWithId( "admin_email" );
        $st->usingBrowser()->click()->fieldWithName( "Submit" );
        $st->usingBrowser()->click()->fieldWithText( $this->strings[ 's_login_button' ] );
    }

    ////////////////////////////////////////

    function Login()
    {
        $st = $this->st;

        $this->story->EchoMsg( "Login Wordpress" );

        // Login
        $st->usingBrowser()->gotoPage( "http://" . $this->story->data->testSettings->domain . "/wp-login.php?loggedout=true" );
        $st->usingBrowser()->type( $this->user )->intoFieldWithId( "user_login" );
        $st->usingBrowser()->type( $this->pass )->intoFieldWithId( "user_pass" );
        $st->usingBrowser()->click()->fieldWithName( 'wp-submit' );

        // Do setup actions that need to be done after login
        foreach( $this->story->data->testSettings->setup as $setupItem ) {
            $setupItem = (object) $setupItem;
            if( $setupItem->type == 'wp_plugin' && $setupItem->after_login == 'activate' ) {
                $this->ActivatePlugin( $setupItem->slug );
            }
        }
    }

    ////////////////////////////////////////

    function ActivateTheme()
    {
        $st = $this->st;

        $this->story->EchoMsg( "Activate theme" );

        $st->usingBrowser()->gotoPage( "http://" . $this->story->data->testSettings->domain . "/wp-admin/themes.php" );

        // Click on he theme
        $this->story->ClickElementByXpath( '//div[@class="theme" and contains(h3, "Swifty Site Designer")]', "graceful" );
        // Wait for the theme dialog to appear
        $st->usingTimer()->wait( 2, "Wait until theme dialog is shown." );
        // Click Activate
        $this->story->ClickElementByXpath( '(//a[contains(text(),"Activate")])[last()]', "graceful" );
        // Wait until the them is activated
        $st->usingTimer()->wait( 5, "Wait until theme is installed." );
    }

    ////////////////////////////////////////

    function Activate_License()
    {
        $st = $this->st;

        $this->story->EchoMsg( "Active License" );

        $s = $this->strings[ 's_submenu_swifty_content_creator' ];
        $sp = '';
        if( $this->story->params[ 'is_pro' ] === 'pro' ) {
            $sp = ' Pro';
        }
        $s = str_replace( '{pro}', $sp, $s );

        $this->OpenSwiftySubMenu( $s );
        $st->usingTimer()->wait( 1, "Wait for Swifty Content Creator page." );

        // Do setup actions that need to be done after activation
        foreach( $this->story->data->testSettings->setup as $setupItem ) {
            $setupItem = (object) $setupItem;
            if( $setupItem->type == 'api-manager' && $setupItem->action == 'activate' ) {
                $this->ActivateSwiftyLicense( $setupItem->slug, $setupItem->plugin_prefix, $setupItem->email, $setupItem->key );
            }
        }
    }

    ////////////////////////////////////////

    function InstallPlugin( $relpath, $toAbspath, $plugin_path_1, $plugin_path_2 )
    {
        $st = $this->st;

        $this->story->EchoMsg( "Install plugin: " . $relpath );

        if( $this->story->params[ 'platform' ] == "ec2" ) {
            // Copy plugin to remote server via Ansible

            $plugin_or_theme = 'plugin';
            $wp_plugin_path_full = $plugin_path_1 . '/' . $plugin_or_theme . '/' . $relpath . '/' . $plugin_path_2;
            if( ! file_exists( '/home/sysadmin/repos/' . $wp_plugin_path_full ) ) {
                $plugin_or_theme = 'theme';
                $wp_plugin_path_full = $plugin_path_1 . '/' . $plugin_or_theme . '/' . $relpath . '/' . $plugin_path_2;
            }

            // create the parameters for Ansible
            $vmParams = array(
                "install_now" => "plugin",
                "code" => "swifty-page-manager",
                "wp_plugin_relpath" => $relpath,
                "wp_plugin_path_1" => $plugin_path_1,
                "wp_plugin_path_2" => $plugin_path_2,
                "wp_plugin_path_full" => $wp_plugin_path_full,
                "wp_plugin_path_plugin_or_theme" => $plugin_or_theme
            );

            // build up the provisioning definition
            $def = $st->usingProvisioning()->createDefinition();
            $st->usingProvisioningDefinition( $def )->addRole( 'wordpress-server' )->toHost( $this->story->data->instanceName );
            $st->usingProvisioningDefinition( $def )->addParams( $vmParams )->toHost( $this->story->data->instanceName );

            // provision our VM
            $st->usingProvisioningEngine( 'ansible' )->provisionHosts( $def );
        } else {
            // Copy plugin locally
            shell_exec( 'cp -a ' . dirname( __FILE__ ) . '/' . $relpath . ' ' . $toAbspath );
        }
    }

    ////////////////////////////////////////

    function ActivatePlugin( $pluginCode )
    {
        $st = $this->st;

        $this->story->EchoMsg( "Activate plugin: " . $pluginCode );

        $this->OpenAdminSubMenu( 'plugins', $this->strings[ 's_submenu_installed_plugins' ] );
        $st->usingTimer()->wait( 1, "Wait for Installed Plugin page." );

        if( ! $this->IsPluginActivated( $pluginCode ) ) {
            $this->story->ClickElementByXpath( 'descendant::a[contains(@href, "plugin=' . $pluginCode . '") and normalize-space(text()) = "' . $this->strings[ 's_activate' ] . '"]', "graceful" );
            $st->usingTimer()->wait( 1, "Wait for plugin activation finished." );
        }
    }

    function IsPluginActivated( $pluginCode )
    {
        $element = $this->story->FindElementsByXpath( 'descendant::a[contains(@href, "plugin=' . $pluginCode . '") and normalize-space(text()) = "' . $this->strings[ 's_deactivate' ] . '"]' );

        return ( $element && count( $element ) === 1 );
    }

    ////////////////////////////////////////

    function ActivateSwiftyLicense( $page, $plugin_prefix, $email, $key )
    {
        $st = $this->st;

        $st->usingBrowser()->click()->linkWithText( $this->strings[ 's_tab_license' ] );
        $st->usingTimer()->wait( 1, "Wait for Swifty Content Creator License tab." );

        if( ! $this->IsSwiftyLicenseActivated( $page, $plugin_prefix ) ) {
            $st->usingBrowser()->type( $email )->intoFieldWithId( "activation_email" );
            $st->usingBrowser()->type( $key )->intoFieldWithId( "api_key" );
            $st->usingBrowser()->click()->fieldWithName( 'submit' );
        }
    }

    // only valid when the plugin page is active
    function IsSwiftyLicenseActivated( $page, $plugin_prefix )
    {
        $element = $this->story->FindElementsByXpath( 'descendant::a[contains(@href, "page=' . $page . '_admin&tab=' . $plugin_prefix . '_deactivation")]' );

        return ( $element && count( $element ) === 1 );
    }

    ////////////////////////////////////////

    function OpenAdminSubMenu( $pluginCode, $submenuText )
    {
        $st = $this->st;

        $this->story->EchoMsg( "Open admin sub-menu: " . $pluginCode . " -> " . $submenuText );

        $this->OpenAdminSubMenuGeneric( 'menu-' . $pluginCode, $submenuText );
    }

    ////////////////////////////////////////

    function OpenSwiftySubMenu( $submenuText )
    {
        $st = $this->st;

        $this->story->EchoMsg( "Open swifty sub-menu: " . $submenuText );

        $this->OpenAdminSubMenuGeneric( 'toplevel_page_swifty_admin', $submenuText );
    }

    function OpenAdminSubMenuGeneric( $menuId, $submenuText )
    {
        $st = $this->st;

        // Xpath for main menu button
        $xpathMainmenuItem = 'descendant::li[@id = "' . $menuId . '"]';
        // Open the admin page
        $st->usingBrowser()->gotoPage( "http://" . $this->story->data->testSettings->domain . "/wp-admin" );

        // Check if the WP menu is collapsed (to one icon) ( happens on small screens )
        $elements = $this->story->FindElementsByXpath( 'descendant::li[@id = "wp-admin-bar-menu-toggle"]' );
        if( count( $elements ) > 0 && $elements[ 0 ]->displayed() ) {
            // Click on the collapse menu button, so the menu will appear
            $elements[ 0 ]->click();
        }

        // Click on the main menu button, as on other screens (sizes or touch ) a click is needed
        $elements = $this->story->FindElementsByXpathMustExist( $xpathMainmenuItem );
        $elements[ 0 ]->click();
        // Hover the main menu button, as on some screens (sizes or touch) a hover is needed
        $this->story->HoverElementByXpath( $xpathMainmenuItem );

        // Click on the sub menuu
        $st->usingBrowser()->click()->linkWithText( $submenuText );

//        $this->story->Probe( 'WP.AdminOpenSubmenu', array( "plugin_code" => $pluginCode, "submenu_text" => $submenuText ) );
    }


    ////////////////////////////////////////

//    function DeleteAllPages()
//    {
//        $st = $this->st;
//
//        $this->story->EchoMsg( 'Delete All Pages' );
//
//        $this->OpenAdminSubMenu( 'pages', $this->strings[ 's_submenu_all_pages' ] );
//        $st->usingTimer()->wait( 1, 'Wait for Wordpress Pages page' );
//        $st->usingBrowser()->click()->fieldWithId( 'cb-select-all-1' );
//        $st->usingBrowser()->select( $this->strings[ 's_wp_pages_actions_delete' ] )->fromDropdownWithName( 'action' );
//        $st->usingBrowser()->click()->buttonWithId( 'doaction' );
//    }

    ////////////////////////////////////////

//    function EmptyTrash()
//    {
//        $st = $this->st;
//
//        $this->story->EchoMsg( 'Empty trash' );
//
//        $this->OpenAdminSubMenu( 'pages', $this->strings[ 's_submenu_all_pages' ] );
//        $st->usingTimer()->wait( 1, 'Wait for Wordpress Pages page' );
//        $elements = $this->story->FindElementsByXpathMustExist( '//li[@class="trash"]/a' );
//
//        if ( count( $elements ) > 0 && $elements[0]->displayed() ) {
//            $elements[0]->click();   // Click on the trash link
//            $st->usingBrowser()->click()->buttonWithText( $this->strings[ 's_wp_pages_empty_trash' ] );
//            $elements = $st->fromBrowser()->getElementsByClass( 'no-items' );
//            $this->st->assertsInteger( count( $elements ) )->equals( 1 );
//        }
//    }

    ////////////////////////////////////////

//    function CreateXDraftPages( $total = 1 )
//    {
//        $st = $this->st;
//
//        $this->story->EchoMsg( 'Create x draft pages' );
//
//        $this->OpenAdminSubMenu( 'pages', $this->strings[ 's_submenu_all_pages' ] );
//        $st->usingTimer()->wait( 1, 'Wait for Wordpress Pages page' );
//
//        for ( $i = 1; $i <= $total; $i++ ) {
//            $st->usingBrowser()->click()->linkWithText( $this->strings[ 's_wp_pages_create_new' ] );
//            $st->usingTimer()->wait( 1, 'Wait for Wordpress New Page page' );
//            $st->usingBrowser()->type( 'WP Pagina ' . $i )->intoFieldWithName( 'post_title' );
//            $st->usingBrowser()->click()->buttonWithText( $this->strings[ 's_wp_pages_save_concept' ] );
//            $st->usingTimer()->wait( 1, 'Wait for Wordpress Edit Page page' );
//        }
//    }

    ////////////////////////////////////////
}