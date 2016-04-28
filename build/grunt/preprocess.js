module.exports = function( grunt/*, options*/ ) {
    return {
        dist: {
            //src: '<%= grunt.getDestPathPlugin() %>' + grunt.myCfg.plugin_code + '.php',
            //dest: '<%= grunt.getDestPathPlugin() %>' + grunt.myCfg.plugin_code + '.php'
            src : [ '<%= grunt.getDestPathPlugin() %>**/*.php', '<%= grunt.getDestPathPlugin() %>**/swifty-font.css' ],
            options: {
              inline : true
            }
        }
    };
};