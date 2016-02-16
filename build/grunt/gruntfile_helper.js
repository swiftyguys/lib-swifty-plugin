module.exports = {

    init: function( grunt ) {

        //console.log( '==================' );

        grunt.myCfg = grunt.file.readJSON( 'mycfg.json' );
        grunt.myPkg = grunt.file.readJSON( 'package.json' );
    //    console.log( 'aaa', grunt.myCfg );

        grunt.getSourcePath = function() {
            return grunt.myCfg.base_path;
        };
        grunt.getDestBasePath = function() {
            return 'generated/dist/';
        };
        grunt.getDestPath = function() {
    //        return grunt.getDestBasePath() + '<%= pkg.version %>';
            return grunt.getDestBasePath() + grunt.myPkg.version;
        };
        grunt.getDestPathPlugin = function() {
            return grunt.getDestPath() + '/' + grunt.getDestPathPluginPart();
        };
        grunt.getDestPathPluginPart = function() {
            return grunt.getDestPathPluginPartNoSlash() + '/';
        };
        grunt.getDestPathPluginPartNoSlash = function() {
            var s = grunt.myCfg.plugin_code;
            if( process.env.PRO_TAG === ' Pro' ) {
                s += '-pro';
            }
            return s;
        };
        grunt.getPluginNameCompact = function() {
            var s = grunt.myPkg.name;
            if( process.env.PRO_TAG === ' Pro' ) {
                s += 'Pro';
            }
            s = s.replace( /-/g, 'D' );
            return s;
        };
        grunt.getDestZip = function() {
            //var s = grunt.getDestBasePath() + grunt.myPkg.name;
            var s = grunt.getDestBasePath() + grunt.myCfg.plugin_code;
            if( process.env.PRO_TAG === ' Pro' ) {
                //s += '-Pro';
                s += '-pro';
            }
            //return s + '_' + grunt.myPkg.version + '.zip';
            return s + '.' + grunt.myPkg.version + '.zip';
        };
        grunt.getObfuscateConfigFN = function() {
            return grunt.getSourcePath() + 'pro/build/obfuscate_cfg.yml';
        };
        grunt.getObfuscateConfigTempFN = function() {
            return 'temp_obfuscate_cfg.yml';
        };
        grunt.getObfuscateReplaceDef = function() {
            var cfg = [];
            var fn = grunt.getSourcePath() + 'pro/build/obfuscate_replace.json';
            if( grunt.file.exists( fn ) ) {
                cfg = grunt.file.readJSON( fn );
            }
            //console.log( '=====', cfg );
            return cfg;
        };
        grunt.getObfuscateCommand = function() {
            var s = '';
            var path = grunt.getDestPathPlugin();
            if( process.env.PRO_TAG === ' Pro' ) {
                s += '../../php-obfuscator/bin/obfuscate obfuscate ' + path + ' ' + path.substr( 0, path.length -1 ) + '_OBS/  --config="' + grunt.getObfuscateConfigTempFN() + '"';
                s += ' && rm -Rf ' + path;
                s += ' && mv ' + path.substr( 0, path.length -1 ) + '_OBS/' + ' ' + path;
                s += ' && rm ' + grunt.getObfuscateConfigTempFN();
                s += ' && mv ' + path + grunt.myCfg.plugin_code + '.php ' + path + grunt.myCfg.plugin_code + '-pro.php ';
            }
            return s;
        };
        grunt.getObfuscateFirstComment = function() {
            return grunt.myCfg.temp_comment_for_obfuscate;
        };
        grunt.getYyyyMmDd = function() {
            var rightNow = new Date();
            return rightNow.toISOString().slice(0,10);
        };
        grunt.getLicenseName = function() {
            return process.env.LICENSE_NAME;
        };
        grunt.getLicenseURI = function() {
            return process.env.LICENSE_URI;
        };
        grunt.getSourcePathTest1 = function() {
            return grunt.myCfg.plugin_code.replace( /-/g, '_' );
        };

        grunt.getFontReleaseTag = function() {
            if( ! grunt.myCfg.rel_swifty_plugin ) {
                return '';
            } else {
                var file = grunt.myCfg.base_path + grunt.myCfg.rel_swifty_plugin + 'css/swifty-font.css';
                var filemod = ( require( 'fs' ).statSync( file ) ).mtime;
                //console.log( 'aaa', file, filemod, filemod.getTime() );
                return filemod.getTime();
            }
        };

        grunt.getForTestIsPro = function() {
            var s = '';
            if( process.env.PRO_TAG === ' Pro' ) {
                s += 'pro';
            }
            return s;
        };

        // Get language files from diverse directories and upload them to swiftylife language site
        //
        // If poIn !== '':
        //     Upload all individual translated language files to Glotpress.
        //     Translations in Glotpress that exist there will be overwritten, unless the string in our local file is not yet translated ("").
        //     Use with great care!!!!!!!!!!!!!!!!!!
        grunt.getCommandImportPotInSwiftylife = function( poIn, locale ) {
            var po = 'lang';
            var ext = 'pot';
            if( poIn !== '' ) {
                po = 'swifty-' + poIn;
                ext = 'po';
            }

            var s = '';
                //if( po !== 'lang' ) {
                //    s +=
                //        // Hardcoded copy lib lang files from SPM to this repo
                //        'cp <%= grunt.getSourcePath() %>../../../swifty_page_manager/plugin/swifty-page-manager/' + grunt.myCfg.rel_swifty_plugin + 'languages/' + po + '.* <%= grunt.getSourcePath() %>' + grunt.myCfg.rel_swifty_plugin + 'languages/; ';
                //}
                s +=
                    'rm -f temp_<%= grunt.getPluginNameCompact() %>.' + ext +
                    '; msgcat ' +
                        '<%= grunt.getSourcePath() %>languages/' + po + '.' + ext + ' ';
                if( po === 'lang' ) {
                    s +=
                        '<%= grunt.getSourcePath() %>languages/lang_js.pot ';
                }
                if( grunt.file.isDir( grunt.getSourcePath() + 'pro' ) ) {
                    s +=
                        '<%= grunt.getSourcePath() %>pro/languages/' + po + '.' + ext + ' ' +
                        '<%= grunt.getSourcePath() %>pro/languages/am/' + po + '.' + ext + ' ';
                }
                if( grunt.file.isDir( grunt.getSourcePath() + grunt.myCfg.po.rel_pack_goodies ) ) {
                    s +=
                        '<%= grunt.getSourcePath() %>' + grunt.myCfg.po.rel_pack_goodies + 'languages/' + po + '.' + ext + ' ';
                }
                s +=
                        '<%= grunt.getSourcePath() %>' + grunt.myCfg.rel_swifty_plugin + 'languages/' + po + '.' + ext + ' ' +
                        '> temp_<%= grunt.getPluginNameCompact() %>.' + ext +
                    //' && perl -pi -e "s#../plugin/' + grunt.myCfg.plugin_code + '/##g" temp_<%= grunt.getPluginNameCompact() %>.' + ext +
                    ' && perl -pi -e "s#' + grunt.myCfg.base_path + '##g" temp_<%= grunt.getPluginNameCompact() %>.' + ext +
                    ' && scp -P 2022 temp_<%= grunt.getPluginNameCompact() %>.' + ext + ' translate@pink.alphamegahosting.com:/var/www/vhosts/translate.swiftylife.com/httpdocs/scripts/temp_<%= grunt.getPluginNameCompact() %>.' + ext +
                    ' && ssh -t -p 2022 translate@pink.alphamegahosting.com "' +
                            'cd /var/www/vhosts/translate.swiftylife.com/httpdocs/scripts';
                if( po === 'lang' ) {
                    s +=
                            '; php import-originals.php -p ' + grunt.myCfg.plugin_code + ' -f temp_<%= grunt.getPluginNameCompact() %>.' + ext;
                } else {
                    s +=
                            '; php import.php -p ' + grunt.myCfg.plugin_code + ' -f temp_<%= grunt.getPluginNameCompact() %>.' + ext + ' -l ' + locale;
                }
                s +=
                            '; rm temp_<%= grunt.getPluginNameCompact() %>.' + ext +
                        '"' +
                    //'; cat temp_<%= grunt.getPluginNameCompact() %>.' + ext +
                    '; rm -f temp_<%= grunt.getPluginNameCompact() %>.' + ext;

            return s;
        };

        grunt.getCommandJoinPO = function( po ) {
            var s = 'msgcat ' +
                        ' <%= grunt.getDestPathPlugin() %>languages/' + po + '.po';
                if( grunt.file.isDir( grunt.getSourcePath() + 'pro' ) ) {
                    s +=
                        ' <%= grunt.getDestPathPlugin() %>pro/languages/' + po + '.po' +
                        ' <%= grunt.getDestPathPlugin() %>pro/languages/am/' + po + '.po';
                }
                s +=
                        ' <%= grunt.getDestPathPlugin() %>' + grunt.myCfg.rel_swifty_plugin + 'languages/' + po + '.po' +
                        ' > <%= grunt.getDestPathPlugin() %>languages/' + po + '.pot' +
                    ' && rm -f <%= grunt.getDestPathPlugin() %>languages/' + po + '.po' +
                    '; rm -f <%= grunt.getDestPathPlugin() %>languages/' + po + '.mo';
                if( grunt.file.isDir( grunt.getSourcePath() + 'pro' ) ) {
                    s +=
                    '; rm -f <%= grunt.getDestPathPlugin() %>pro/languages/' + po + '.po' +
                    '; rm -f <%= grunt.getDestPathPlugin() %>pro/languages/' + po + '.mo' +
                    '; rm -f <%= grunt.getDestPathPlugin() %>pro/languages/am/' + po + '.po' +
                    '; rm -f <%= grunt.getDestPathPlugin() %>pro/languages/am/' + po + '.mo';
                }
                s +=
                    '; rm -f <%= grunt.getDestPathPlugin() %>' + grunt.myCfg.rel_swifty_plugin + 'languages/' + po + '.po' +
                    '; rm -f <%= grunt.getDestPathPlugin() %>' + grunt.myCfg.rel_swifty_plugin + 'languages/' + po + '.mo' +
                    '; mv -f <%= grunt.getDestPathPlugin() %>languages/' + po + '.pot <%= grunt.getDestPathPlugin() %>languages/' + po + '.po' +
                    ' && msgfmt <%= grunt.getDestPathPlugin() %>languages/' + po + '.po -o <%= grunt.getDestPathPlugin() %>languages/' + po + '.mo';
            return s;
        };

        // Project configuration.
        grunt.initConfig( {
            pkg: grunt.file.readJSON( 'package.json' )
        } );

    },

    addHelpers: function( grunt ) {
        // Helper tasks.
        grunt.registerTask( 'if_requirejs', function() {
            if( grunt.myCfg.requirejs.do ) {
                grunt.task.run( [
                    'requirejs'
                ] );
            }
        } );

        grunt.registerTask( 'if_clean_unwanted', function() {
            if( process.env.PROBE === 'none' ) {
                grunt.task.run( [
                    'clean:unwanted'
                ] );
            }
        } );

        grunt.registerTask( 'if_clean_unwanted2', function() {
            if( process.env.PROBE === 'none' ) {
                grunt.task.run( [
                    'clean:unwanted2'
                ] );
            }
        } );

        grunt.registerTask( 'if_license', function() {
            if( process.env.PRO_TAG === ' Pro' ) {
                grunt.task.run( [ 'rename:pro_license' ] );
            }
        } );

        grunt.registerTask( 'if_check_version_exists', function() {
            if( process.env.PRO_TAG === ' Pro' ) {
                grunt.task.run( [ 'shell:mysql_check_version' ] );
            } else {
                grunt.task.run( [ 'shell:svn_check_tags' ] );
            }
        } );

        grunt.registerTask( 'if_release', function() {
            if( process.env.PRO_TAG === ' Pro' ) {
                grunt.task.run( [ 'helper_release_swiftylife' ] );
            } else {
                grunt.task.run( [ 'helper_release_wporg' ] );
            }
        } );

        grunt.registerTask( 'if_helper_obfuscate', function() {
            if( process.env.PRO_TAG === ' Pro' ) {
                grunt.task.run( [ 'helper_obfuscate' ] );
            }
        } );

        // Upload all individual translated language files to Glotpress.
        // Translations in Glotpress that exist there will be overwritten, unless the string in our local file is not yet translated ("").
        // Use with great care!!!!!!!!!!!!!!!!!!
        grunt.registerTask( 'loop_import_po_languages', function() {
            for( var key in grunt.myCfg.po.languages ) {
                console.log( '===', key );
                grunt.task.run( [ 'shell:import_pot_one_language_in_swiftylife:' + grunt.myCfg.po.languages[ key ] + ':' + key ] );
            }
        } );

        grunt.registerTask( 'loop_split_po', function() {
            grunt.file.recurse( 'temp_' + grunt.myCfg.plugin_code, function( abspath, rootdir, subdir, filename ) {
                console.log( '===', filename );
                var ar = filename.split( '.po' );
                grunt.task.run( [ 'shell:split_po:' + ar[ 0 ] ] );
            } );
        } );

        grunt.registerTask( 'loop_join_po', function() {
            if( grunt.file.isDir( grunt.getDestPathPlugin() + 'languages' ) ) {
                grunt.file.recurse( grunt.getDestPathPlugin() + 'languages/', function( abspath, rootdir, subdir, filename ) {
                    var ar = filename.split( '.p' );
                    if( ar.length > 1 && ar[ 1 ] === 'o' ) {
                        grunt.task.run( [ 'shell:join_po:' + ar[ 0 ] ] );
                    }
                } );
            }
        } );

        grunt.registerTask( 'check_changelog', function() {
            var fileContent = grunt.file.read( grunt.getSourcePath() + 'readme.txt' );
            if( fileContent.indexOf( grunt.myPkg.version ) < 0 ) {
                grunt.fatal( "\n\n========================================\n\nREADME FILE DOES NOT CONTAIN CHANGELOG FOR " + grunt.myPkg.version + "!!!!!!!!!!!!!!\n\n========================================\n\n\n" );
            }
        } );

        grunt.registerTask( 'if_pot_pro', function() {
            if( grunt.file.isDir( grunt.getSourcePath() + 'pro' ) ) {
                grunt.task.run( [
                    'pot:pro'
                ] );
            }
        } );

        grunt.registerTask( 'if_pot_am', function() {
            if( grunt.file.isDir( grunt.getSourcePath() + 'pro' ) ) {
                grunt.task.run( [
                    'pot:am'
                ] );
            }
        } );

        grunt.registerTask( 'if_pot_lib', function() {
            if( grunt.file.isDir( grunt.getSourcePath() + grunt.myCfg.rel_swifty_plugin ) ) {
                grunt.task.run( [
                    'pot:lib'
                ] );
            }
        } );

        grunt.registerTask( 'if_pot_pack_goodies', function() {
            if( grunt.file.isDir( grunt.getSourcePath() + grunt.myCfg.po.rel_pack_goodies ) ) {
                grunt.task.run( [
                    'pot:pack_goodies'
                ] );
            }
        } );

        // Abort if language actions are not allowed
        grunt.registerTask( 'if_pot_allowed', function() {
            if( grunt.myCfg.po.allowed === false ) {
                grunt.fatal( "\n\n========================================\n\nLANGUAGE ACTIONS NOT ALLOWED FOR THIS PROJECT!\n\n========================================\n\n\n" );
            }
        } );

    }
};
