module.exports = function( grunt/*, options*/ ) {
    var cfgOut = {
        test1: {
            command: '~/storyplayer/vendor/bin/storyplayer' +
                     ' -D relpath="../build/<%= grunt.getDestPath() %>"' +
                     ' -D platform=ec2' +
//                         ' -D wp_version=3.7' +
                     ' -D wp_version=3.9.1' +
                     //' -D plugin_path_1="swifty_page_manager"' +
                     ' -D plugin_path_1="swifty_content_creator"' +
                     //' -D plugin_path_2="swifty-page-manager"' +
                     ' -D plugin_path_2="swifty-content-creator-pro"' +
                     ' -D is_pro="pro"' +
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
        import_pot_in_swiftylife: {
            command: 'rm -f temp_<%= grunt.getPluginNameCompact() %>.pot' +
                        '; msgcat ' +
                            '<%= grunt.getSourcePath() %>languages/lang.pot ' +
                            '<%= grunt.getSourcePath() %>pro/languages/lang.pot ' +
                            '<%= grunt.getSourcePath() %>pro/languages/am/lang.pot ' +
                            '<%= grunt.getSourcePath() %>lib/swifty_plugin/languages/lang.pot ' +
                            '> temp_<%= grunt.getPluginNameCompact() %>.pot' +
                        ' && perl -pi -e "s#../plugin/' + grunt.myCfg.plugin_code + '/##g" temp_<%= grunt.getPluginNameCompact() %>.pot' +
                        ' && scp -P 2022 temp_<%= grunt.getPluginNameCompact() %>.pot translate@green.alphamegahosting.com:/var/www/vhosts/translate.swiftylife.com/httpdocs/scripts/temp_<%= grunt.getPluginNameCompact() %>.pot' +
                        ' && ssh -t -p 2022 translate@green.alphamegahosting.com "' +
                                'cd /var/www/vhosts/translate.swiftylife.com/httpdocs/scripts' +
                                '; php import-originals.php -p ' + grunt.myCfg.plugin_code + ' -f temp_<%= grunt.getPluginNameCompact() %>.pot' +
                                '; rm temp_<%= grunt.getPluginNameCompact() %>.pot' +
                            '"' +
                        '; rm -f temp_<%= grunt.getPluginNameCompact() %>.pot',
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        download_po_from_swiftylife: {
            command: 'rm -Rf temp_' + grunt.myCfg.plugin_code +
                        '; ssh -t -p 2022 translate@green.alphamegahosting.com "' +
                                'cd /var/www/vhosts/translate.swiftylife.com/httpdocs' +
                                ' && ./export_po.sh ' + grunt.myCfg.plugin_code + ' "nl"' +
                            '"' +
                        ' && scp -P 2022 translate@green.alphamegahosting.com:/var/www/vhosts/translate.swiftylife.com/httpdocs/temp_' + grunt.myCfg.plugin_code + '.zip ./' +
                        ' && ssh -t -p 2022 translate@green.alphamegahosting.com "' +
                                'rm -f /var/www/vhosts/translate.swiftylife.com/httpdocs/temp_' + grunt.myCfg.plugin_code + '.zip' +
                            '"' +
                        ' && unzip temp_' + grunt.myCfg.plugin_code + '.zip' +
                        '; rm -f temp_' + grunt.myCfg.plugin_code + '.zip',
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        remove_temp_po: {
            command: 'rm -Rf temp_' + grunt.myCfg.plugin_code,
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        split_po: {
            command: function( po ) {
                return 'grep php temp_' + grunt.myCfg.plugin_code + '/' + po + '.po | grep -v php-format | cut --delimiter=":" -f 2 | sort | uniq | cut -b 2-; echo ' + po;
            },
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    var out = stdout.split( "\n" );
                    var last = '';
                    out.forEach( function( o ) {
                        if( o !== '' ) {
                            last = o;
                        }
                    } );
                    out.forEach( function( o ) {
                        if( o !== '' && o !== last ) {
                            var s = o;
                            s = s.replace( /\//g, '_-_-_' );
                            grunt.task.run( [ 'shell:split_po_sub:' + last + ':' + s + ':' + o ] );
                        }
                    } );
                    var po2 = last;
                    if( po2 === 'nl' ) {
                        po2 = 'nl_NL';
                    }
                    grunt.task.run( [ 'shell:split_po_next:' + last + ':' + po2 + ':lib_-_-_swifty_plugin_-_-_:lib/swifty_plugin/languages/' ] );
                    grunt.task.run( [ 'shell:split_po_next:' + last + ':' + po2 + ':pro_-_-_am_-_-_:pro/languages/am/' ] );
                    grunt.task.run( [ 'shell:split_po_next:' + last + ':' + po2 + ':pro_-_-_:pro/languages/' ] );
                    grunt.task.run( [ 'shell:split_po_next:' + last + ':' + po2 + '::languages/' ] );
                    cb();
                }
            }
        },
        split_po_sub: {
            command: function( po, fileOut, file ) {
                //return 'echo bbb' + po + 'ccc' + fileOut + 'ddd' + file;
                return 'mkdir -p temp_' + grunt.myCfg.plugin_code + '/' + po +
                        ' && msggrep -N ' + file + ' -o temp_' + grunt.myCfg.plugin_code + '/' + po + '/' + fileOut + '.po temp_' + grunt.myCfg.plugin_code + '/' + po + '.po';
            },
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        split_po_next: {
            command: function( po, po2, filter, path ) {
                return 'msgcat temp_' + grunt.myCfg.plugin_code + '/' + po + '/' + filter + '* > temp_' + grunt.myCfg.plugin_code + '/' + po + '/' + po + '.po' +
                        ' && mkdir -p <%= grunt.getSourcePath() %>' + path +
                        ' && mv -f temp_' + grunt.myCfg.plugin_code + '/' + po + '/' + po + '.po <%= grunt.getSourcePath() %>' + path + 'swifty-' + po2 + '.po' +
                        ' && msgfmt <%= grunt.getSourcePath() %>' + path + 'swifty-' + po2 + '.po -o <%= grunt.getSourcePath() %>' + path + 'swifty-' + po2 + '.mo' +
                        ' && rm -f temp_' + grunt.myCfg.plugin_code + '/' + po + '/' + filter + '*';
            },
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        join_po: {
            command: function( po ) {
                return 'msgcat ' +
                            ' <%= grunt.getDestPathPlugin() %>languages/' + po + '.po' +
                            ' <%= grunt.getDestPathPlugin() %>pro/languages/' + po + '.po' +
                            ' <%= grunt.getDestPathPlugin() %>pro/languages/am/' + po + '.po' +
                            ' <%= grunt.getDestPathPlugin() %>lib/swifty_plugin/languages/' + po + '.po' +
                            ' > <%= grunt.getDestPathPlugin() %>languages/' + po + '.pot' +
                        ' && rm -f <%= grunt.getDestPathPlugin() %>languages/' + po + '.po' +
                        '; rm -f <%= grunt.getDestPathPlugin() %>languages/' + po + '.mo' +
                        '; rm -f <%= grunt.getDestPathPlugin() %>pro/languages/' + po + '.po' +
                        '; rm -f <%= grunt.getDestPathPlugin() %>pro/languages/' + po + '.mo' +
                        '; rm -f <%= grunt.getDestPathPlugin() %>pro/languages/am/' + po + '.po' +
                        '; rm -f <%= grunt.getDestPathPlugin() %>pro/languages/am/' + po + '.mo' +
                        '; rm -f <%= grunt.getDestPathPlugin() %>lib/swifty_plugin/languages/' + po + '.po' +
                        '; rm -f <%= grunt.getDestPathPlugin() %>lib/swifty_plugin/languages/' + po + '.mo' +
                        '; mv -f <%= grunt.getDestPathPlugin() %>languages/' + po + '.pot <%= grunt.getDestPathPlugin() %>languages/' + po + '.po' +
                        ' && msgfmt <%= grunt.getDestPathPlugin() %>languages/' + po + '.po -o <%= grunt.getDestPathPlugin() %>languages/' + po + '.mo';
            },
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        check_changelog_in_zip: {
            command: 'unzip -c <%= grunt.getDestZip() %> <%= grunt.getDestPathPluginPart() %>readme.txt | grep "= ' + grunt.myPkg.version + ' ="',
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    if( stdout.indexOf( grunt.myPkg.version ) < 0 ) {
                        grunt.fatal( "\n\n========================================\n\nREADME FILE IN THE ZIP DOES NOT CONTAIN CHANGELOG FOR " + grunt.myPkg.version + "!!!!!!!!!!!!!!\n\n========================================\n\n\n" );
                    }
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

    // Create git tasks for ALL repos
    console.log( '' );
    console.log( '========================================' );
    console.log( '========================================' );
    console.log( '========================================' );
    console.log( 'Now working on version: ', grunt.myPkg.version );
    var readmeContent = grunt.file.read( grunt.getSourcePath() + 'readme.txt' );
    var readmeLines = readmeContent.split( "\n" );
    var latestChangelogVersion = '';
    var readmeSearching = 1;
    readmeLines.forEach( function( o ) {
        if( readmeSearching === 2 ) {
            //console.log( '==============', o );
            if( o.indexOf( '= ' ) === 0 && o.indexOf( ' =' ) > 0 ) {
                latestChangelogVersion = o.substring( o.indexOf( '= ' ) + 2, o.indexOf( ' =' ) );
                console.log( 'Found latest changelog version: ', latestChangelogVersion );
                readmeSearching = 3;
            }
        }
        if( readmeSearching === 1 ) {
            if( o.indexOf( '== Changelog ==' ) >= 0 ) {
                readmeSearching = 2;
            }
        }
    } );
    console.log( '========================================' );
    console.log( '========================================' );
    console.log( '========================================' );
    console.log( '' );

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
                        if( stdout.indexOf( 'CONFLICT' ) >= 0 ) {
                            grunt.fatal( "\n\n========================================\n\nTHERE IS A CONFLICT IN THE MERGE!!!!!!!!!!!!!!\n\n========================================\n\n\n" );
                        }
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
            cfgOut[ 'git_sincetag_' + i ] = {
                command: [
                    'echo ""',
                    'echo ""',
                    'echo ""',
                    'echo ""',
                    'echo "========================================"',
                    'echo "========================================"',
                    'echo "========================================"',
                    'echo "Commits since latest version in changelog:"',
                    'git log --pretty=oneline ' + grunt.myCfg.git_pull_all.tagcode + latestChangelogVersion + '..HEAD | less',
                    'echo ""',
                    'echo "========================================"',
                    'echo "========================================"',
                    'echo "========================================"',
                    'echo ""',
                    'echo ""',
                    'echo ""'
                ].join( '; ' ),
                options: {
                    execOptions: {
                        cwd: grunt.myCfg.git_pull_all.paths[ i ]
                    },
                    'callback': function( err, stdout, stderr, cb ) {
                        //console.log( 'aaa', 'git log ' + grunt.myCfg.git_pull_all.tagcode + latestChangelogVersion + '..HEAD' );
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
            cfgOut[ 'git_sincetag_' + i ] = {
                command: ''
            };
        }
    }

    return cfgOut;
};