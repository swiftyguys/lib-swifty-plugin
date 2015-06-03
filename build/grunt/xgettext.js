module.exports = function( grunt/*, options*/ ) {
    return {
        dist: {
            options: {
                functionName: '__',
                potFile: '<%= grunt.getSourcePath() %>languages/lang_js.pot'
            },
            files: grunt.myCfg.po.files
        }
    };
};