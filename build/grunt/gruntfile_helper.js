module.exports = {

    init: function( grunt ) {

        //console.log( '==================' );

        // dorh TODO in mycfg.json: uglify, csslint, cssmin, shell

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
            var s = grunt.getDestBasePath() + grunt.myPkg.name;
            if( process.env.PRO_TAG === ' Pro' ) {
                s += '-Pro';
            }
            return s + '_' + grunt.myPkg.version + '.zip';
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
            return grunt.myCfg.base_path.replace( /-/g, '_' );
        };

        grunt.getFontReleaseTag = function() {
            var file = '../plugin/' + grunt.myCfg.plugin_code + '/lib/swifty_plugin/css/swifty-font.css';
            var filemod = ( require( 'fs' ).statSync( file ) ).mtime;
            //console.log( 'aaa', file, filemod, filemod.getTime() );
            return filemod.getTime();
        };

        grunt.getForTestIsPro = function() {
            var s = '';
            if( process.env.PRO_TAG === ' Pro' ) {
                s += 'pro';
            }
            return s;
        };

        grunt.getCommandImportPotInSwiftylife = function() {
            var s = 'rm -f temp_<%= grunt.getPluginNameCompact() %>.pot' +
                    '; msgcat ' +
                        '<%= grunt.getSourcePath() %>languages/lang.pot ';
                if( grunt.file.isDir( grunt.getSourcePath() + 'pro' ) ) {
                    s +=
                        '<%= grunt.getSourcePath() %>pro/languages/lang.pot ' +
                        '<%= grunt.getSourcePath() %>pro/languages/am/lang.pot ';
                }
                s +=
                        '<%= grunt.getSourcePath() %>lib/swifty_plugin/languages/lang.pot ' +
                        '> temp_<%= grunt.getPluginNameCompact() %>.pot' +
                    ' && perl -pi -e "s#../plugin/' + grunt.myCfg.plugin_code + '/##g" temp_<%= grunt.getPluginNameCompact() %>.pot' +
                    ' && scp -P 2022 temp_<%= grunt.getPluginNameCompact() %>.pot translate@green.alphamegahosting.com:/var/www/vhosts/translate.swiftylife.com/httpdocs/scripts/temp_<%= grunt.getPluginNameCompact() %>.pot' +
                    ' && ssh -t -p 2022 translate@green.alphamegahosting.com "' +
                            'cd /var/www/vhosts/translate.swiftylife.com/httpdocs/scripts' +
                            '; php import-originals.php -p ' + grunt.myCfg.plugin_code + ' -f temp_<%= grunt.getPluginNameCompact() %>.pot' +
                            '; rm temp_<%= grunt.getPluginNameCompact() %>.pot' +
                        '"' +
                    '; rm -f temp_<%= grunt.getPluginNameCompact() %>.pot';
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
                        ' <%= grunt.getDestPathPlugin() %>lib/swifty_plugin/languages/' + po + '.po' +
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
                    '; rm -f <%= grunt.getDestPathPlugin() %>lib/swifty_plugin/languages/' + po + '.po' +
                    '; rm -f <%= grunt.getDestPathPlugin() %>lib/swifty_plugin/languages/' + po + '.mo' +
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
                grunt.task.run( [ 'dorh' ] );
            }
        } );

        grunt.registerTask( 'if_helper_obfuscate', function() {
            if( process.env.PRO_TAG === ' Pro' ) {
                grunt.task.run( [ 'helper_obfuscate' ] );
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
            grunt.file.recurse( grunt.getDestPathPlugin() + 'languages/', function( abspath, rootdir, subdir, filename ) {
                var ar = filename.split( '.p' );
                if( ar.length > 1 && ar[ 1 ] === 'o' ) {
                    grunt.task.run( [ 'shell:join_po:' + ar[ 0 ] ] );
                }
            } );
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

    }
};
