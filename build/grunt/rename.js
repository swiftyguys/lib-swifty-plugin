module.exports = function( grunt/*, options*/ ) {
    return {
        post_requirejs: {
            src: '<%= grunt.getDestPathPlugin() %>js/swifty-content-creator.css',
            dest: '<%= grunt.getDestPathPlugin() %>css/swifty-content-creator.css'
        },
        pro_license: {
            src: '<%= grunt.getDestPathPlugin() %>pro/license.txt',
            dest: '<%= grunt.getDestPathPlugin() %>license.txt'
        }
    };
};