module.exports = function( grunt/*, options*/ ) {
    return {
        post_requirejs: grunt.myCfg.rename.post_requirejs,
        pro_license: { files: [ {
            src: '<%= grunt.getDestPathPlugin() %>pro/license.txt',
            dest: '<%= grunt.getDestPathPlugin() %>license.txt'
        } ] }
    };
};