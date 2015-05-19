( function( $, probe ) {
    probe.Utils = probe.Utils || {};

    $.extend( probe.Utils, {
        setValues: function ( values, key ) {
            var self = this;
            var fields = this.getFieldProps( values );
            var dfd = $.Deferred();
            var dfdArray = [];

            if ( key ) {
                if ( fields[ key ] ) {
                    dfdArray.push( self.setSingleValue( key, fields[ key ] ) );
                }
            } else {
                $.each( fields, function ( field, props ) {
                    dfdArray.push( self.setSingleValue( field, props ) );
                } );
            }

            $.when.apply( $, dfdArray ).done( function () {
                dfd.resolve();
            } );

            return dfd;
        },

        setSingleValue: function ( field, props ) {
            var type = props.type;
            var val = props.value;
            var selector = '[name="' + field + '"]:visible';
            var dfd = $.Deferred();

            // Enter or select the form values
            switch ( type ) {
                case 'text':
                    $( selector ).simulate( 'click' );
                    setTimeout( function() {
                        $( selector ).simulate( 'key-sequence', {
                            'sequence': '{selectall}{del}' + val,
                            'delay': 50,
                            'callback': function() {
                                setTimeout( function() {
                                    dfd.resolve();
                                }, 100 );
                            }
                        } );
                    }, 100 );

                    break;
                case 'radio':
                    selector += '[value="' + val + '"]';

                    setTimeout( function() {
                        $( selector ).simulate( 'click' );

                        setTimeout( function() {
                            dfd.resolve();
                        }, 100 );
                    }, 100 );

                    break;
                case 'select':
                    selector += ' option:contains("' + val + '")';

                    setTimeout( function() {
                        $( selector ).prop( 'selected', true );

                        setTimeout( function() {
                            dfd.resolve();
                        }, 100 );
                    }, 100 );

                    break;
            }

            return dfd;
        },

        getFieldProps: function ( values ) {
            return JSON.parse( values );
        },

        getPageSelector: function ( input ) {
            var selector = '.spm-page-tree-element';

            if ( input && typeof input === 'string' ) {
                selector += ':contains("' + input + '")';
            }

            return selector;
        }
    } );

    ////////////////////////////////////////

} )( jQuery, swiftyProbe );