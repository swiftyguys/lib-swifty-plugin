module.exports = function( grunt/*, options*/ ) {
    var cfgOut = {
        test1: {
            command: '~/storyplayer/vendor/bin/storyplayer' +
                     ' -D relpath="../build/<%= grunt.getDestPath() %>"' +
                     ' -D platform=ec2' +
//                         ' -D wp_version=3.7' +
//                     ' -D wp_version=3.9.1' +
                     ' -D wp_version=4.2.2' +
                     ' -D plugin_path_1="<%= grunt.getSourcePathTest1() %>"' +
                     ' -D plugin_path_2="<%= grunt.getDestPathPluginPartNoSlash() %>"' +
                     ' -D is_pro="<%= grunt.getForTestIsPro() %>"' +
                     ' -D lang=en' +
                     //' -d sl_ie9_win7' +
                     //' -d sl_chrome31_win7' +
                     ' -d sl_firefox37_win8_1' +
                     //' ../../../../../../test/test_dist.php',
                    ' test_dist.php',
            options: {
                stderr: false,
                execOptions: {
                    //cwd: '../plugin/' + grunt.myCfg.plugin_code + '/' + grunt.myCfg.rel_swifty_plugin + 'php/probe'
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
            // command: 'svn co http://plugins.svn.wordpress.org/swifty-page-manager/ svn/swifty-page-manager',
            // command: 'svn co ' + grunt.myCfg.svn.url + ' ' + grunt.myCfg.svn.path + ' --ignore-externals --quiet && svn stat',
            // command: 'svn co ' + grunt.myCfg.svn.url + ' ' + grunt.myCfg.svn.path + ' --ignore-externals',
            command: 'rm -Rf ' + grunt.myCfg.svn.path + ' && svn co -q ' + grunt.myCfg.svn.url + ' ' + grunt.myCfg.svn.path + ' --ignore-externals',
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
            // command: 'sleep 15; svn stat',
            // command: 'sleep 5; svn stat',
            // command: 'sleep 5; svn cleanup; svn resolved -R .; svn update; sleep 5; svn stat',
            command: 'svn stat',
            options: {
                execOptions: {
                    cwd: grunt.myCfg.svn.path //'svn/swifty-page-manager/'
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        svn_add: {
            // command: 'sleep 5; svn status | grep "^\\?" | sed -e \'s/? *//\' | sed -e \'s/ /\\\\ /g\' | xargs svn add',
            command: 'svn status | grep "^\\?" | sed -e \'s/? *//\' | sed -e \'s/ /\\\\ /g\' | xargs svn add',
            options: {
                execOptions: {
                    cwd: grunt.myCfg.svn.path //'svn/swifty-page-manager/'
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        svn_ci: {
            // command: 'sleep 5; svn update; sleep 5; svn ci -m "v' + grunt.myPkg.version + '" --username "SwiftyOnline" --force-interactive',
            command: 'svn ci -m "v' + grunt.myPkg.version + '" --username "SwiftyOnline" --force-interactive',
            options: {
                execOptions: {
                    cwd: grunt.myCfg.svn.path //'svn/swifty-page-manager/'
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        svn_cp_trunk: {
            // command: 'sleep 5; svn cp trunk tags/' + grunt.myPkg.version,
            command: 'svn cp trunk tags/' + grunt.myPkg.version,
            options: {
                execOptions: {
                    cwd: grunt.myCfg.svn.path //'svn/swifty-page-manager/'
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        svn_ci_tags: {
            // command: 'sleep 5; svn ci -m "Tagging version ' + grunt.myPkg.version + '" --username "SwiftyOnline" --force-interactive',
            command: 'svn ci -m "Tagging version ' + grunt.myPkg.version + '" --username "SwiftyOnline" --force-interactive',
            options: {
                execOptions: {
                    cwd: grunt.myCfg.svn.path //'svn/swifty-page-manager/'
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        svn_check_tags: {
            // command: 'svn ls ' + grunt.myCfg.svn_check_tags.url /*'svn ls http://plugins.svn.wordpress.org/swifty-page-manager/tags'*/,
            // command: 'sleep 5; svn ls ' + grunt.myCfg.svn.url + 'tags' /*'svn ls http://plugins.svn.wordpress.org/swifty-page-manager/tags'*/,
            command: 'svn ls ' + grunt.myCfg.svn.url + 'tags' /*'svn ls http://plugins.svn.wordpress.org/swifty-page-manager/tags'*/,
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
            //command: 'git tag v' + grunt.myPkg.version,
            command: 'git tag ' + grunt.myCfg.git_pull_all.tagcode + grunt.myPkg.version,
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
            // command: "mysql -D swiftylife -h swiftylife.cxbgadkmkhqf.eu-central-1.rds.amazonaws.com -e \"update wp_postmeta set meta_value='" + grunt.myPkg.version + "' where meta_key='_api_new_version' and post_id='<%= grunt.myCfg.release.id_product %>';\";",
            command: "mysql -D swiftylife -h database.alphamegahosting.com -e \"update wp_postmeta set meta_value='" + grunt.myPkg.version + "' where meta_key='_api_new_version' and post_id='<%= grunt.myCfg.release.id_product %>';\";",
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        mysql_update_date: {
            // command: "mysql -D swiftylife -h swiftylife.cxbgadkmkhqf.eu-central-1.rds.amazonaws.com -e \"update wp_postmeta set meta_value='" + grunt.getYyyyMmDd() + "' where meta_key='_api_last_updated' and post_id='<%= grunt.myCfg.release.id_product %>';\";",
            command: "mysql -D swiftylife -h database.alphamegahosting.com -e \"update wp_postmeta set meta_value='" + grunt.getYyyyMmDd() + "' where meta_key='_api_last_updated' and post_id='<%= grunt.myCfg.release.id_product %>';\";",
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        mysql_update_zip_woo: {
            command: 'OUTPT=$(curl -L "https://stuff.swifty.online/stuff/data/get.php?do=getencurl&file=releases/' + grunt.myCfg.git_pull_all.tagcode + '/' + grunt.myCfg.plugin_code + '.' + grunt.myPkg.version + '.zip")' +
                " ; OUTP2=$(php -r 'echo serialize(array(md5($argv[1])=>array(\"name\"=>\"" + grunt.myCfg.plugin_txt_name + "\",\"file\"=>\"$argv[1]\")));' -- ${OUTPT})" +
                // " ; mysql -D swiftylife -h swiftylife.cxbgadkmkhqf.eu-central-1.rds.amazonaws.com -e \"update wp_postmeta set meta_value='${OUTP2}' where meta_key='_downloadable_files' and post_id='<%= grunt.myCfg.release.id_product %>';\";",
                " ; mysql -D swiftylife -h database.alphamegahosting.com -e \"update wp_postmeta set meta_value='${OUTP2}' where meta_key='_downloadable_files' and post_id='<%= grunt.myCfg.release.id_product %>';\";",
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        mysql_update_zip_stuff: {
            command: 'OUTPT=$(curl -L "https://stuff.swifty.online/stuff/data/get.php?do=getencurl&file=releases/' + grunt.myCfg.git_pull_all.tagcode + '/' + grunt.myCfg.plugin_code + '.' + grunt.myPkg.version + '.zip")' +
                // " ; mysql -D swiftylife -h swiftylife.cxbgadkmkhqf.eu-central-1.rds.amazonaws.com -e \"insert into stuff_releases (code,version,url) values ('" + grunt.myCfg.git_pull_all.tagcode + "','" + grunt.myPkg.version + "','${OUTPT}');\";",
                " ; mysql -D swiftylife -h database.alphamegahosting.com -e \"insert into stuff_releases (code,version,url) values ('" + grunt.myCfg.git_pull_all.tagcode + "','" + grunt.myPkg.version + "','${OUTPT}');\";",
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        mysql_check_version: {
            // command: "mysql -D swiftylife -h swiftylife.cxbgadkmkhqf.eu-central-1.rds.amazonaws.com -e \"select meta_value from wp_postmeta where meta_key='_api_new_version' and post_id='2455';\";",
            command: "mysql -D swiftylife -h database.alphamegahosting.com -e \"select meta_value from wp_postmeta where meta_key='_api_new_version' and post_id='2455';\";",
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    if( stdout.indexOf( grunt.myPkg.version ) >= 0 ) {
                        grunt.fatal( "\n\n========================================\n\nCURRENT RELEASETAG ALREADY EXISTS ON swifty.online " + grunt.myPkg.version + "!!!!!!!!!!!!!!\n\n========================================\n\n\n" );
                    }
                    cb();
                }
            }
        },
        copy_zip_swiftylife: {
            // command: 'scp -P 2022 <%= grunt.getDestZip() %> swiftylife@green.alphamegahosting.com:/var/www/vhosts/swifty.online/httpdocs/download/swifty-content-creator-alpha-latest.zip',
            // command: 'scp -P 2022 <%= grunt.getDestZip() %> root@stuff2.swifty.online:/var/www/vhosts/stuff.swifty.online/httpdocs/static/releases/' + grunt.myCfg.git_pull_all.tagcode + '/' + grunt.myCfg.plugin_code + '.' + grunt.myPkg.version + '.zip',
            // command: 'scp -P 2022 <%= grunt.getDestZip() %> stuffsw@stuff.swifty.online:/var/www/vhosts/stuff.swifty.online/httpdocs/static/releases/' + grunt.myCfg.git_pull_all.tagcode + '/' + grunt.myCfg.plugin_code + '.' + grunt.myPkg.version + '.zip',
            command: 'scp -P 2022 <%= grunt.getDestZip() %> stuffsw@spring.alphamegahosting.com:/var/www/vhosts/stuff.swifty.online/httpdocs/static/releases/' + grunt.myCfg.git_pull_all.tagcode + '/' + grunt.myCfg.plugin_code + '.' + grunt.myPkg.version + '.zip',
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        find_globals: {
            command: "find  " + grunt.myCfg.base_path + ". -name '*.php' | while read FILE;do perl -l -ne '/global (.*);/ and print $1' \"$FILE\";done",
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
            command: grunt.getCommandImportPotInSwiftylife( '', '' ),
            options: {
                execOptions: {
                },
                'callback': function(err, stdout, stderr, cb) {
                    cb();
                }
            }
        },
        // Use with great care!!!!!!!!!!!!!!!!!!
        // Upload all individual translated language files to Glotpress.
        // Translations in Glotpress that exist there will be overwritten, unless the string in our local file is not yet translated ("").
        import_pot_one_language_in_swiftylife: {
            command: function( p1, p2 ) {
                return grunt.getCommandImportPotInSwiftylife( p1, p2 );
            },
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
                        '; ssh -t -p 2022 translate@pink.alphamegahosting.com "' +
                                'cd /var/www/vhosts/translate.swiftylife.com/httpdocs' +
                                ' && ./export_po.sh ' + grunt.myCfg.plugin_code + " '" + Object.keys( grunt.myCfg.po.languages ).join( ' ' ) + "'" +
                            '"' +
                        ' && scp -P 2022 translate@pink.alphamegahosting.com:/var/www/vhosts/translate.swiftylife.com/httpdocs/temp_' + grunt.myCfg.plugin_code + '.zip ./' +
                        ' && ssh -t -p 2022 translate@pink.alphamegahosting.com "' +
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
                            s = s.replace( /\.\./g, '_=_=_' );
                            grunt.task.run( [ 'shell:split_po_sub:' + last + ':' + s + ':' + o ] );
                        }
                    } );
                    var po2 = last;
                    for( var key in grunt.myCfg.po.languages ) {
                        if( po2 === key ) {
                            po2 = grunt.myCfg.po.languages[ key ];
                        }
                    }
                    grunt.task.run( [ 'shell:split_po_next:' + last + ':' + po2 + ':lib_-_-_swifty_plugin_-_-_:' + grunt.myCfg.rel_swifty_plugin + 'languages/' ] );
                    if( grunt.file.isDir( grunt.getSourcePath() + 'pro' ) ) {
                        grunt.task.run( [ 'shell:split_po_next:' + last + ':' + po2 + ':pro_-_-_am_-_-_:pro/languages/am/' ] );
                        grunt.task.run( [ 'shell:split_po_next:' + last + ':' + po2 + ':pro_-_-_:pro/languages/' ] );
                    }
                    if( grunt.file.isDir( grunt.getSourcePath() + grunt.myCfg.po.rel_pack_goodies ) ) {
                        grunt.task.run( [ 'shell:split_po_next:' + last + ':' + po2 + ':_=_=__-_-__=_=__-_-_swifty_content_goodies_pack_-_-_plugin_-_-_swifty-content-goodies-pack_-_-_:' + grunt.myCfg.po.rel_pack_goodies + 'languages/' ] );
                    }
                    if( grunt.file.isDir( grunt.getSourcePath() + grunt.myCfg.po.rel_pack_visuals ) ) {
                        grunt.task.run( [ 'shell:split_po_next:' + last + ':' + po2 + ':_=_=__-_-__=_=__-_-_swifty_content_visuals_pack_-_-_plugin_-_-_swifty-content-visuals-pack_-_-_:' + grunt.myCfg.po.rel_pack_visuals + 'languages/' ] );
                    }
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
                //return 'msgcat temp_' + grunt.myCfg.plugin_code + '/' + po + '/' + filter + '* > temp_' + grunt.myCfg.plugin_code + '/' + po + '/' + po + '.po' +
                //        ' && mkdir -p <%= grunt.getSourcePath() %>' + path +
                //        ' && mv -f temp_' + grunt.myCfg.plugin_code + '/' + po + '/' + po + '.po <%= grunt.getSourcePath() %>' + path + 'swifty-' + po2 + '.po' +
                //        ' && msgfmt <%= grunt.getSourcePath() %>' + path + 'swifty-' + po2 + '.po -o <%= grunt.getSourcePath() %>' + path + 'swifty-' + po2 + '.mo' +
                //        ' && rm -f temp_' + grunt.myCfg.plugin_code + '/' + po + '/' + filter + '*';

                var source_base = '<%= grunt.getSourcePath() %>' + path;
                //var source_fp = source_base + 'swifty-' + po2;
                var source_fp = source_base + grunt.myCfg.po.file_slug + po2;
                if( filter.indexOf( 'swifty_plugin' ) >= 0 ) {
                    source_fp = source_base + 'swifty-' + po2;
                }
                if( path === grunt.myCfg.po.rel_pack_goodies + 'languages/' ) {
                    source_fp = source_base + grunt.myCfg.po.pack_goodies_file_slug + po2;
                }
                if( path === grunt.myCfg.po.rel_pack_visuals + 'languages/' ) {
                    source_fp = source_base + grunt.myCfg.po.pack_visuals_file_slug + po2;
                }
                var source_po = source_fp + '.po';
                var source_mo = source_fp + '.mo';
                var temp_base = 'temp_' + grunt.myCfg.plugin_code + '/' + po + '/';
                var glotpress_po = temp_base + po + '.po';
                //var glotpress_translated_po = temp_base + 'glotpress_only_translated_strings.po';
                var merged_po = temp_base + 'glotpress_source_merged.po';

                //return '' +
                //    // ??? Merge all files into 1 po file. ???
                //    'msgcat ' + temp_base + filter + '* > ' + glotpress_po +
                //    // Remove untranslated strings from glotpress po.
                //    ' && msgattrib --translated ' + glotpress_po + ' -o ' + glotpress_translated_po +
                //    ' && cat ' + glotpress_translated_po +
                //    // Add strings from the local source po file.
                //    ' && msgmerge ' + source_po + ' ' + glotpress_translated_po + ' --no-fuzzy-matching > ' + merged_po +
                //    //' && cat ' + merged_po +
                //    // Make sure this dir exists.
                //    ' && mkdir -p ' + source_base +
                //    // Overwrite the old po file in out git sources with the new po file.
                //    ' && mv -f ' + merged_po + ' ' + source_po +
                //    // Create a new mo file based on the new po file.
                //    ' && msgfmt ' + source_po + ' -o ' + source_mo +
                //    // Remove the temp files.
                //    ' && rm -f ' + temp_base + filter + '*';

                // console.log( 'aaa=====', temp_base );
                // console.log( 'bbb=====', filter );
                // console.log( 'ccc=====', glotpress_po );
                return '' +
                    // 'ls -lah temp_swifty-content-creator/nl/ && ' +
                    // ??? Merge all files into 1 po file. ???
                    'msgcat ' + temp_base + filter + '* > ' + glotpress_po +
                    // Add strings from the local source po file.
                    ' && msgmerge ' + glotpress_po + ' ' + glotpress_po + ' --compendium ' + source_po + ' --no-fuzzy-matching --sort-by-file > ' + merged_po +
                    // Make sure this dir exists.
                    ' && mkdir -p ' + source_base +
                    // Overwrite the old po file in out git sources with the new po file.
                    ' && mv -f ' + merged_po + ' ' + source_po +
                    // Create a new mo file based on the new po file.
                    ' && msgfmt ' + source_po + ' -o ' + source_mo +
                    // Remove the temp files.
                    ' && rm -f ' + temp_base + filter + '*';
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
                return grunt.getCommandJoinPO( po );
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
            // command: 'unzip -c <%= grunt.getDestZip() %> <%= grunt.getDestPathPluginPart() %>readme.txt | grep "= ' + grunt.myPkg.version + ' ="',
            command: 'unzip -c <%= grunt.getDestZip() %> <%= grunt.getDestPathPluginPart() %>readme.txt | grep "= ' + grunt.myPkg.version + ' "',
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
        },
        get_changelog_from_readme: {
            // command: 'sed -n "/== Changelog ==/,/== Upgrade Notice ==/p" <%= grunt.getDestPath() %>/<%= grunt.getDestPathPluginPart() %>readme.txt',
            // command: 'sed -n "0,/== Changelog ==/ d; /== Upgrade Notice ==/,$ d; /^$/d; p" <%= grunt.getDestPath() %>/<%= grunt.getDestPathPluginPart() %>readme.txt',
            command: 'sed -n "0,/== Changelog ==/ d; /== Upgrade Notice ==/,$ d; /^$/d; p" <%= grunt.getSourcePath() %>readme.txt',
            options: {
                execOptions: {
                },
                'stdout': false,
                'callback': function(err, stdout, stderr, cb) {
                    // console.log( '========================================' );
                    // console.log( stdout );
                    // console.log( '========================================' );

                    var content = stdout;
                    content = content.replace( /(?:\r\n\r\n)/g, '&nbsp;<br>&nbsp;<br>' );
                    content = content.replace( /(?:\r\n|\r|\n)/g, '<br>' );
                    // console.log( 'aaa', content );
                    content = content.replace( /(= (.*?) =)/g, '<h4>$2</h4>' );

                    var parseObj = {
                        id_sol: grunt.myCfg.docs.changelog_id_sol,
                        id_parent_sol: 5945, // Changelogs
                        id_fd: grunt.myCfg.docs.changelog_id_fd,
                        id_parent_fd: 11000002769, // Swifty changelogs
                        title: 'Changelog for ' + grunt.myPkg.name.replace( /-/g, ' ' ),
                        tags: 'changelog',
                        content: content,
                        file: 'readme'
                    };
                    grunt.myExportDocsDocs.push( JSON.parse( JSON.stringify( parseObj ) ) );
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
                if( latestChangelogVersion.indexOf( ' - 20' ) > 0 ) {
                    latestChangelogVersion = latestChangelogVersion.substr( 0, latestChangelogVersion.indexOf( ' - 20' ) );
                }
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
                    'echo',
                    'echo "=== Trying: git pull for dir ' + grunt.myCfg.git_pull_all.paths[ i ] + '"',
                    'echo',
                    'git fetch',
                    'git pull --rebase',
                    'git submodule update --init --recursive'
                ].join( ' && ' ),
                options: {
                    execOptions: {
                        cwd: grunt.myCfg.git_pull_all.paths[ i ]
                    },
                    'callback': function( err, stdout, stderr, cb ) {
                        if( stdout.indexOf( 'CONFLICT' ) >= 0 || stdout.indexOf( 'Aborting' ) >= 0 || stdout.indexOf( 'error:' ) >= 0 || stdout.indexOf( 'fatal:' ) >= 0 || stdout.indexOf( 'Cannot pull with rebase' ) >= 0 ||
                            stderr.indexOf( 'CONFLICT' ) >= 0 || stderr.indexOf( 'Aborting' ) >= 0 || stderr.indexOf( 'error:' ) >= 0 || stdout.indexOf( 'fatal:' ) >= 0 || stdout.indexOf( 'Cannot pull with rebase' ) >= 0
                        ) {
                            grunt.fatal( "\n\n========================================\n\nTHERE IS A CONFLICT OR ABORTING PROBLEM IN THE MERGE!!!!!!!!!!!!!!\n\n========================================\n\n\n" );
                        }
                        cb();
                    }
                }
            };
            cfgOut[ 'git_merge_' + i ] = {
                //command: grunt.myCfg.git_pull_all.cmd,
                command: [
                    'echo',
                    'echo "=== Trying: git pull master and merge develop for dir ' + grunt.myCfg.git_pull_all.paths[ i ] + '"',
                    'echo',
                    'git fetch',
                    //'git pull origin master',
                    'git merge origin/master',
                    'git merge origin/develop',
                    //'git merge origin/inarticle',
                    'git submodule update --init --recursive'
                ].join( ' && ' ),
                options: {
                    execOptions: {
                        cwd: grunt.myCfg.git_pull_all.paths[ i ]
                    },
                    'callback': function( err, stdout, stderr, cb ) {
                        if( stdout.indexOf( 'CONFLICT' ) >= 0 || stdout.indexOf( 'Aborting' ) >= 0 || stdout.indexOf( 'error:' ) >= 0 || stdout.indexOf( 'fatal:' ) >= 0 || stdout.indexOf( 'Cannot pull with rebase' ) >= 0 ||
                            stderr.indexOf( 'CONFLICT' ) >= 0 || stderr.indexOf( 'Aborting' ) >= 0 || stderr.indexOf( 'error:' ) >= 0 || stdout.indexOf( 'fatal:' ) >= 0 || stdout.indexOf( 'Cannot pull with rebase' ) >= 0
                        ) {
                            grunt.fatal( "\n\n========================================\n\nTHERE IS A CONFLICT OR ABORTING PROBLEM IN THE MERGE!!!!!!!!!!!!!!\n\n========================================\n\n\n" );
                        }
                        cb();
                    }
                }
            };
            cfgOut[ 'git_tag_' + i ] = {
                //command: grunt.myCfg.git_pull_all.cmd,
                command: [
                    'git commit -am "Building ' + grunt.myCfg.git_pull_all.tagcode + grunt.myPkg.version + '"',
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
                    'echo "Commits since latest version in changelog: (' + grunt.myCfg.git_pull_all.tagcode + latestChangelogVersion + ')"',
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