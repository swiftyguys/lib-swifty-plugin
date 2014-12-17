module.exports = function( grunt/*, options*/ ) {
    return {
        dist : {
            PROBE: 'none', // 'none', 'include'
            RELEASE_TAG: grunt.myPkg.version,
            BUILDUSE: 'build',
            LICENSE_NAME: 'GPLv2 or later',
            LICENSE_URI: 'http://www.gnu.org/licenses/gpl-2.0.html'
        },
        dist_pro : {
            PROBE: 'none', // 'none', 'include'
            RELEASE_TAG: grunt.myPkg.version,
            PRO_TAG: ' Pro',
            PRO_URLPART: '-pro/',
            BUILDUSE: 'build',
            PROT: 'api',
            LICENSE_NAME: 'Commercial',
            LICENSE_URI: 'http://www.swiftylife.com'
        },
        test : {
            PROBE: 'include',
            BUILDUSE: 'source'//,
            //RELEASE_TAG: grunt.myPkg.version,
            //PROT: ''
        }
    };
};