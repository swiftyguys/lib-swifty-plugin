module.exports = function( grunt/*, options*/ ) {
    return {
        export_docs: {
            files: {
                // src: [ '<%= grunt.getDestPath() %>**/*' ]
                src: [ '<%= grunt.getSourcePath() %>**/*.*' ]
            },
            options: {
                searchString: /\s*\/\/\s*.*/,
                logFormat: 'custom',
                customLogFormatCallback: function( params ) {
                    var parseMode = 0;
                    var parseObjDef = {
                        id_fd: 0,
                        title: '',
                        tags: '',
                        content: ''
                    };
                    var parseObj = JSON.parse( JSON.stringify( parseObjDef ) );
                    console.log( "\n\n======================================== SEARCH\n" + params.results );
                    for( var key in params.results ) {
                        var fle = params.results[ key ];
                        console.log( "== K:" + key + "\n" );
                        parseObj.file = key;
                        parseObjDef.file = key;
                        // console.log( "== F:" + typeof fle + "\n" );
                        for( var key2 in fle ) {
                            var fle2 = fle[ key2 ];
                            // console.log( "== K2:" + key2 + "\n" );
                            // console.log( "== F2:" + typeof fle2 + "\n" );
                            for( var key3 in fle2 ) {
                                var found = fle2[ key3 ];
                                // console.log( "== K3:" + key3 + " == V:" + found );
                                if( key3 === 'match' ) {
                                    found = found.trimLeft();
                                    if( found.indexOf( 'SS_DOC_END' ) > 0 ) {
                                        // console.log( "=======\n", parseObj );
                                        console.log( "== SS_DOC_END" );
                                        grunt.myExportDocsDocs.push( JSON.parse( JSON.stringify( parseObj ) ) );
                                        parseMode = 0;
                                        parseObj = JSON.parse( JSON.stringify( parseObjDef ) );
                                    }
                                    if( parseMode === 1 ) {
                                        var s = found.substr( 3 );
                                        if( s.indexOf( 'id_fd: ' ) === 0 ) {
                                            parseObj.id_fd = s.substr( 7 );
                                        } else if( s.indexOf( 'id_sol: ' ) === 0 ) {
                                            parseObj.id_sol = s.substr( 8 );
                                        } else if( s.indexOf( 'id_parent_sol: ' ) === 0 ) {
                                            parseObj.id_parent_sol = s.substr( 15 );
                                        } else if( s.indexOf( 'title: ' ) === 0 ) {
                                            parseObj.title = s.substr( 7 );
                                        } else if( s.indexOf( 'tags: ' ) === 0 ) {
                                            parseObj.tags = s.substr( 6 );
                                        } else {
                                            parseMode = 2;
                                        }
                                    }
                                    if( parseMode === 2 ) {
                                        var s = found.substr( 3 );
                                        var enter = "\n";
                                        // s = s.replace( /(?:\r\n|\r|\n)/g, '' );
                                        // console.log( "=======s " + s );
                                        if( s.indexOf( '<nobr>' ) >= 0 ) {
                                            s = s.replace( /<nobr>/g, '' );
                                            enter = '';
                                        } else {
                                            // if( parseObj.content !== '' ) {
                                            //     parseObj.content += "\n";
                                            // }
                                        }
                                        parseObj.content += s + enter;
                                    }
                                    if( found.indexOf( 'SS_DOC_ARTICLE' ) > 0 ) {
                                        console.log( "== SS_DOC_ARTICLE" );
                                        parseMode = 1;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
};