module.exports = function( grunt/*, options*/ ) {
    var cfgOut = {
        test1: {
            command: '~/storyplayer/vendor/bin/storyplayer' +
                     ' -D relpath="../build/<%= grunt.getDestPath() %>"' +
                     ' -D platform=ec2' +
//                         ' -D wp_version=3.7' +
                     ' -D wp_version=3.9.1' +
                     ' -D lang=en' +
                     ' -d sl_ie9_win7' +
                     ' test_dist.php',
            options: {
                stderr: false,
                execOptions: {
                    cwd: '../test/'
                },
                'callback': function(err, stdout, stderr, cb) {
                    if( stderr.indexOf( "action: COMPLETED" ) >= 0 ) {
                        console.log( "\n\n========================================\nTEST SUCCESFUL\n========================================\n\n\n" );
                    } else {
                        grunt.fatal( "\n\n========================================\n\nTEST FAILED!!!!!!!!!!!!!!\n\n" + stderr + "\n\n========================================\n\n\n" );
                    }
                    cb();
                }
            }
        },
        svn_co: {
            command: 'svn co http://plugins.svn.wordpress.org/swifty-page-manager/ svn/swifty-page-manager',
            options: {
                execOptions: {
                    cwd: '../build/'
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        svn_stat: {
            command: 'svn stat',
            options: {
                execOptions: {
                    cwd: 'svn/swifty-page-manager/'
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        svn_add: {
            command: 'svn status | grep "^\\?" | sed -e \'s/? *//\' | sed -e \'s/ /\\\\ /g\' | xargs svn add',
            options: {
                execOptions: {
                    cwd: 'svn/swifty-page-manager/'
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        svn_ci: {
            command: 'svn ci -m "v' + grunt.myPkg.version + '" --username "SwiftyLife" --force-interactive',
            options: {
                execOptions: {
                    cwd: 'svn/swifty-page-manager/'
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        svn_cp_trunk: {
            command: 'svn cp trunk tags/' + grunt.myPkg.version,
            options: {
                execOptions: {
                    cwd: 'svn/swifty-page-manager/'
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        svn_ci_tags: {
            command: 'svn ci -m "Tagging version ' + grunt.myPkg.version + '" --username "SwiftyLife" --force-interactive',
            options: {
                execOptions: {
                    cwd: 'svn/swifty-page-manager/'
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        svn_check_tags: {
            command: 'svn ls ' + grunt.myCfg.svn_check_tags.url /*'svn ls http://plugins.svn.wordpress.org/swifty-page-manager/tags'*/,
            options: {
                stdout: false,
                execOptions: {
                    cwd: 'svn/' + grunt.myCfg.plugin_code + '/'
                },
                'callback': function(err, stdout, stderr, cb) {
                    if( stdout.indexOf( grunt.myPkg.version ) >= 0 ) {
                        grunt.fatal( "\n\n========================================\n\nCURRENT RELEASETAG ALREADY EXISTS IN SVN " + grunt.myPkg.version + "!!!!!!!!!!!!!!\n\n========================================\n\n\n" );
                    }
                    cb();
                }
            }
        },
        git_check_status: {
            command: 'git status',
            options: {
                stdout: false,
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    if( stdout.indexOf( 'nothing to commit' ) < 0 ) {
                        grunt.fatal( "\n\n========================================\n\nGIT HAS UNCOMITTED FILES. PLEASE COMMIT FIRST!!!!!!!!!!!!!!\n\n========================================\n\n\n" );
                    }
                    cb();
                }
            }
        },
        git_tag: {
            command: 'git tag v' + grunt.myPkg.version,
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        git_push_tags: {
            command: 'git push origin --tags',
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        obfuscate: {
            command: '<%= grunt.getObfuscateCommand() %>',
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        mysql_update_version: {
            command: "mysql -D AMH_swif_wp838 -h green.alphamegahosting.com -e \"update wp_postmeta set meta_value='" + grunt.myPkg.version + "' where meta_key='_api_new_version' and post_id='2455';\";",
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        mysql_update_date: {
            command: "mysql -D AMH_swif_wp838 -h green.alphamegahosting.com -e \"update wp_postmeta set meta_value='" + grunt.getYyyyMmDd() + "' where meta_key='_api_last_updated' and post_id='2455';\";",
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        mysql_check_version: {
            command: "mysql -D AMH_swif_wp838 -h green.alphamegahosting.com -e \"select meta_value from wp_postmeta where meta_key='_api_new_version' and post_id='2455';\";",
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    if( stdout.indexOf( grunt.myPkg.version ) >= 0 ) {
                        grunt.fatal( "\n\n========================================\n\nCURRENT RELEASETAG ALREADY EXISTS ON swiftylife.com " + grunt.myPkg.version + "!!!!!!!!!!!!!!\n\n========================================\n\n\n" );
                    }
                    cb();
                }
            }
        },
        copy_zip_swiftylife: {
            command: 'scp -P 2022 <%= grunt.getDestZip() %> swiftylife@green.alphamegahosting.com:/var/www/vhosts/swiftylife.com/httpdocs/download/swifty-content-creator-alpha-latest.zip',
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        find_globals: {
            command: "find  ../plugin/swifty-content-creator/. -name '*.php' | while read FILE;do perl -l -ne '/global (.*);/ and print $1' \"$FILE\";done",
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    //console.log(stdout);
                    var out = stdout.split( "\n" );
                    // Make unique
                    out = out.reduce(function(p, c) {
                        if (p.indexOf(c) < 0) p.push(c);
                        return p;
                    }, []);
                    var sOut = '';
                    out.forEach( function( o ) {
                        if( o.substr( 0, 1 ) === '$' ) {
                            //console.log( '===' + o.substr( 1 ) + '===' );
                            sOut += '        - ' + o.substr( 1 ) + "\n";
                        }
                    } );
                    var cfg = grunt.file.read( grunt.getObfuscateConfigFN() );
                    cfg = cfg.replace( '#__REPLACE_VARS__', sOut );
                    //console.log( '---', cfg );
                    grunt.file.write( grunt.getObfuscateConfigTempFN(), cfg );
                    cb();
                }
            }
        },
        find_first_comment: {
            //command: 'perl -e "' + "$/=undef;print<>=~/((?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:\/\/.*))/;" + '" < <%= grunt.getDestPathPlugin() %>' + grunt.myCfg.plugin_code + '.php',
            //command: "perl -0777ne 'print m!/\*(?:.|[\r\n])*?\*/!g;' < <%= grunt.getDestPathPlugin() %>" + grunt.myCfg.plugin_code + '.php',
            command: "perl -l -ne '/(.*)/ and print $1' <%= grunt.getDestPathPlugin() %>" + grunt.myCfg.plugin_code + '.php',
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    //console.log('===',stdout);
                    var out = stdout.split( "\n" );
                    var sOut = '';
                    var searching = 1;
                    out.forEach( function( o ) {
                        if( searching === 1 ) {
                            sOut += o + "\n";
                            if( o === '*/' ) {
                                searching = 0;
                            }
                        }
                    } );
                    //console.log( '---', sOut );
                    grunt.myCfg.temp_comment_for_obfuscate = sOut;
                    cb();
                }
            }
        },
        send_mail: {
            command: 'echo "<%= myTask.send_mail_msg %>" | mail -s "' + grunt.myPkg.description + ' - new build" ' + grunt.myCfg.send_mail.to,
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        upload_gdrive: {
            command: 'gdrive upload -f <%= grunt.getDestZip() %> -p 0B9usKfgdtpwIZ3VFcVpZYmY5VUU --share',
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    var s = '';
                    var sc = 'readable by everyone @ ';
                    var i = stdout.indexOf( sc );
                    if( i > 0 ) {
                        s = stdout.substr( i + sc.length );
                        grunt.config.set(
                            'myTask.send_mail_msg',
                            'A new plugin was build on Cactus:\n\n' +
                                grunt.myPkg.description + process.env.PRO_TAG + '\n' +
                                'Version: ' + grunt.myPkg.version + '\n\n' +
                                'This is NOT a public release. For testing only.\n\n' +
                                'Downdload: \n' +
                                s
                        );
                        grunt.task.run( 'shell:send_mail' );
                    }
                    cb();
                }
            }
        }
    };

    for( var i = 0; i < 5; i++ ) {
        if( i < grunt.myCfg.git_pull_all.paths.length ) {
            cfgOut[ 'git_pull_' + i ] = {
                //command: grunt.myCfg.git_pull_all.cmd,
                command: [
                    'git fetch',
                    'git pull',
                    'git submodule update --init --recursive'
                ].join( '&&' ),
                options: {
                    execOptions: {
                        cwd: grunt.myCfg.git_pull_all.paths[ i ]
                    },
                    'callback': function( err, stdout, stderr, cb ) {
                        cb();
                    }
                }
            };
            cfgOut[ 'git_merge_' + i ] = {
                //command: grunt.myCfg.git_pull_all.cmd,
                command: [
                    'git fetch',
                    'git pull origin master',
                    'git merge origin/develop',
                    //'git merge origin/inarticle',
                    'git submodule update --init --recursive'
                ].join( '&&' ),
                options: {
                    execOptions: {
                        cwd: grunt.myCfg.git_pull_all.paths[ i ]
                    },
                    'callback': function( err, stdout, stderr, cb ) {
                        cb();
                    }
                }
            };
            cfgOut[ 'git_tag_' + i ] = {
                //command: grunt.myCfg.git_pull_all.cmd,
                command: [
                    'git commit -am "Building ' + grunt.myPkg.version + '"',
                    'git tag -a ' + grunt.myCfg.git_pull_all.tagcode + grunt.myPkg.version + ' -m "' + grunt.myCfg.git_pull_all.tagcode + grunt.myPkg.version + '"',
                    'git push',
                    'git push --tags'
                ].join( '; ' ),
                options: {
                    execOptions: {
                        cwd: grunt.myCfg.git_pull_all.paths[ i ]
                    },
                    'callback': function( err, stdout, stderr, cb ) {
                        cb();
                    }
                }
            };
        } else {
            cfgOut[ 'git_pull_' + i ] = {
                command: ''
            };
            cfgOut[ 'git_merge_' + i ] = {
                command: ''
            };
            cfgOut[ 'git_tag_' + i ] = {
                command: ''
            };
        }
    }

    return cfgOut;
};