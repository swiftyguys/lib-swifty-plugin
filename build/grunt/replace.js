module.exports = function( grunt/*, options*/ ) {
    return {
        readme: {
            src: [ '<%= grunt.getSourcePath() %>readme.txt' ],
            dest: '<%= grunt.getDestPathPlugin() %>readme.txt',
            replacements: [
                {
                    from: 'RELEASE_TAG',
                    to: grunt.myPkg.version
                },
                {
                    from: 'LICENSE_NAME',
                    to: '<%= grunt.getLicenseName() %>'
                },
                {
                    from: 'LICENSE_URI',
                    to: '<%= grunt.getLicenseURI() %>'
                }
            ]
        },
        lib_version: {
            src: '<%= grunt.getDestPathPlugin() %>**/swifty_version.txt',
            overwrite: true,
            replacements: [
                {
                    from: 'SWIFTY_LIB_VERSION',
                    to: new Date().getTime()
                }
            ]
        },
        lib: {
            src: '<%= grunt.getDestPathPlugin() %>**/*.php',
            overwrite: true,
            replacements: [
                {
                    from: 'LibSwiftyPluginView',
                    to: '<%= grunt.getPluginNameCompact() %>LibSPluginView'
                },
                {
                    from: 'LibSwiftyPlugin',
                    to: '<%= grunt.getPluginNameCompact() %>LibSPlugin'
                }
            ]
        },
        obfuscate: {
            src: '<%= grunt.getDestPathPlugin() %>**/*.php',
            overwrite: true,
            replacements: grunt.getObfuscateReplaceDef()

        },
        obfuscate_pre: {
            src: '<%= grunt.getDestPathPlugin() %>**/*.php',
            overwrite: true,
            replacements: [
                { 'from': 'global $', 'to': 'goto SkIpthIsGLObaL' }
            ]
        },
        obfuscate_post: {
            src: '<%= grunt.getDestPathPlugin() %>**/*.php',
            overwrite: true,
            replacements: [
                { 'from': 'goto SkIpthIsGLObaL', 'to': 'global $' }
            ]
        },
        obfuscate_insert_comment: {
            src: '<%= grunt.getDestPathPlugin() %>*.php',
            overwrite: true,
            replacements: [
                { 'from': '<?php', 'to': '<%= grunt.getObfuscateFirstComment() %>' }
            ]
        },
        lang_js: {
            src: '<%= grunt.getSourcePath() %>languages/lang_js.pot',
            overwrite: true,
            replacements: [
                { 'from': 'msgid "', 'to': '#: <%= grunt.getSourcePath() %>js.php:1\nmsgid "' }
            ]
        }
    };
};