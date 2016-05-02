module.exports = function( grunt/*, options*/ ) {
    return {
        dist: {
            options: {
                name: grunt.myCfg.requirejs.src,
                baseUrl: '<%= grunt.getDestPathPlugin() %>',
                mainConfigFile: grunt.myCfg.requirejs.mainCfg,
                out: grunt.myCfg.requirejs.dst,

                namespace: 'swifty',

                include: [ 'requireLib' ], // Include RequireJs itself
                optimize: 'none',

                // css:
                exclude: grunt.myCfg.requirejs.exclude, /*[
                    'js/libs/css_normalize',
                    'js/libs/css-builder',
                    'js/libs/css_normalize'//,
//                    'js/libs/requirejs_plugin_css',
//                    'js/libs/requirejs_plugin_stache',
//                    'js/libs/requirejs_plugin_text',
//                    'js/libs/requirejs_plugin_json'
                ],*/
                stubModules : [ // So these will not be in the build
                    'json',
                    'text',
//                    'css', // Needed
                    'stache'
                ],
                separateCSS: grunt.myCfg.requirejs.separateCSS,
                pragmasOnSave: {
                    excludeRequireCss: false // can not be true because we have dynamically required css()fontawesome)
                }
            }
        },
        two: {
            options: {
                name: grunt.myCfg.requirejs2.src,
                baseUrl: '<%= grunt.getDestPathPlugin() %>',
                mainConfigFile: grunt.myCfg.requirejs2.mainCfg,
                out: grunt.myCfg.requirejs2.dst,

                namespace: 'swifty_two',

                include: [ 'requireLib' ], // Include RequireJs itself
                optimize: 'none',

                // css:
                exclude: grunt.myCfg.requirejs2.exclude,
                stubModules : [ // So these will not be in the build
                    'json',
                    'text',
//                    'css', // Needed
                    'stache'
                ],
                separateCSS: grunt.myCfg.requirejs2.separateCSS,
                pragmasOnSave: {
                    excludeRequireCss: false // can not be true because we have dynamically required css()fontawesome)
                }
            }
        }
    };
};