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
            var s = grunt.getDestPath() + '/' + grunt.myCfg.plugin_code;
            if( process.env.PRO_TAG === ' Pro' ) {
                s += '-pro';
            }
            return s + '/';
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
            var cfg = grunt.file.readJSON( grunt.getSourcePath() + 'pro/build/obfuscate_replace.json' );
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

        grunt.registerTask( 'if_rename', function() {
            if( grunt.myCfg.rename.do ) {
                grunt.task.run( [
                    'rename:post_requirejs'
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

        grunt.registerTask( 'check_changelog', function() {
            var fileContent = grunt.file.read( grunt.getSourcePath() + 'readme.txt' );
            if( fileContent.indexOf( grunt.myPkg.version ) < 0 ) {
                grunt.fatal( "\n\n========================================\n\nREADME FILE DOES NOT CONTAIN CHANGELOG FOR " + grunt.myPkg.version + "!!!!!!!!!!!!!!\n\n========================================\n\n\n" );
            }
        } );
    }
};
