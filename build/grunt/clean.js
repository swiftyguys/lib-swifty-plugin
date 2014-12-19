module.exports = function( grunt/*, options*/ ) {
    return {
        dist: [ '<%= grunt.getDestPath() %>', '<%= grunt.getDestZip() %>' ],
        unwanted: grunt.myCfg.clean.unwanted, // [ '<%= grunt.getDestPathPlugin() %>js/probe' ]
        svn: [ 'svn' ],
        svn_trunk: [ 'svn/' + grunt.myCfg.plugin_code + '/trunk' ],
        languages: [
            '<%= grunt.getDestPathPlugin() %>**/lang.pot',
            '<%= grunt.getDestPathPlugin() %>pro/languages',
            '<%= grunt.getDestPathPlugin() %>lib/swifty_plugin/languages'
        ]
    };
};