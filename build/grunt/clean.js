module.exports = function( grunt/*, options*/ ) {
    return {
        dist: [ '<%= grunt.getDestPath() %>', '<%= grunt.getDestZip() %>' ],
        unwanted: grunt.myCfg.clean.unwanted,
        unwanted2: grunt.myCfg.clean.unwanted2,
        svn: [ 'svn' ],
        svn_trunk: [ 'svn/' + grunt.myCfg.plugin_code + '/trunk' ],
        languages: [
            '<%= grunt.getDestPathPlugin() %>**/lang.pot',
            '<%= grunt.getDestPathPlugin() %>pro/languages',
            '<%= grunt.getDestPathPlugin() %>lib/swifty_plugin/languages'
        ]
    };
};