module.exports = function( grunt/*, options*/ ) {
    return {
        dist: {
            options: {
                functionName: '__',
                potFile: '<%= grunt.getSourcePath() %>languages/lang_js.pot'
            },
            files: {
                handlebars: [ '<%= grunt.getSourcePath() %>**/*.*' ], // Can be in .stache AND .php files!
                javascript: [ '<%= grunt.getSourcePath() %>**/*.js' ]
            }
        }
    };
};