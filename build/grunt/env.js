module.exports = function( grunt/*, options*/ ) {
    return {
        dist : {
            PROBE: 'none', // 'none', 'include'
            RELEASE_TAG: grunt.myPkg.version,
            BUILDUSE: 'build'//,
            //PROT: ''
        },
        dist_pro : {
            PROBE: 'none', // 'none', 'include'
            RELEASE_TAG: grunt.myPkg.version,
            PRO_TAG: ' Pro',
            PRO_URLPART: '-pro/',
            BUILDUSE: 'build',
            PROT: 'api'
        },
        test : {
            PROBE: 'include',
            RELEASE_TAG: grunt.myPkg.version,
            BUILDUSE: 'source',
            PROT: ''
        }
    };
};