var swiftyProbe = ( function( $, probe ) {
    probe = probe || {
        tmp_log: '',
        fail: '',
        dfds_done: [],
        try_list: [],
        __: {},

        TypeText: function( $el, $txt ) {
            this.Click( $el );
            $el.val( $txt ); // dorh Do via keypress events
        },

        Click: function( $el ) {
            var xy = this.GetElementCenter( $el );

            this.ClickXY( xy.x, xy.y );
        },

        ClickXY: function( x, y ){
            this.SendEventXY( x, y, 'click' );
        },

        SendEventXY: function( x, y, name ){
//            this.TmpLog( 'Clixk XY: ' + x + ',' + y );

            var ev = document.createEvent( 'MouseEvent' );
            var el = document.elementFromPoint( x, y );

            ev.initMouseEvent(
                name,
                true /* bubble */, true /* cancelable */,
                window, null,
                x, y, 0, 0, /* coordinates */
                false, false, false, false, /* modifier keys */
                0 /*left*/, null
            );

            if ( el ) {
                el.dispatchEvent( ev );
            }
        },

        FrameEvt: function( cmd, data, dfd ){
            var win = document.querySelectorAll( 'iframe.swifty_event_frame' )[ 0 ].contentWindow;
            var can2 = win.can;

            if( can2 ) {
                can2.trigger(
                    win,
                    'evt_swc_' + cmd,
                    [ data, dfd ]
                );
            }
        },

        GetElementCenter: function( $el ) {
            var offset = $el.offset();

            return {
                'x': offset.left + $el.width() / 2,
                'y': offset.top + $el.height() / 2
            };
        },

        FrameGetElementCenter: function( sel ) {
            var $el = $( 'iframe' ).contents().find( sel );

            var offset = $el.offset();
            if( offset ) {
                return {
                    'x': offset.left + $el.width() / 2,
                    'y': offset.top + $el.height() / 2,
                    '$el': $el
                };
            } else {
                return { x: -1, y: -1, '$el': $el };
            }
        },

        /**
         * @return bool
         */
        IsVisible: function( $el ) {
            if ( $el.length > 0 ) {
                var xy = this.GetElementCenter( $el );

                // dorh Improve; on top?; hidden?; width>0? height>0?
                if ( xy.x >= 0 && xy.y >= 0 && xy.x <= $(window).width() && xy.y <= $(window).height() && $el.is( ':visible' ) ) {
                    return true;
                }
            }

            return false;
        },

        FrameIsVisible: function( sel ) {
            var xy = this.FrameGetElementCenter( sel );

            // dorh Improve; on top?; hidden?; width>0? height>0?
            if ( xy.x >= 0 && xy.y >= 0 && xy.x <= $(window).width() && xy.y <= $(window).height() && xy.$el.is( ':visible' ) ) {
                return true;
            }

            return false;
        },

        StartTmpLog: function(){
            this.tmp_log = '';
        },

        TmpLog: function( s ){
            this.tmp_log += s + '\n';
        },

        SetFail: function( s ){
            this.fail = s;
        },

        SaveContentMatchFail: function( resultHTML, compareHTML, path ) {
            resultHTML = resultHTML.replace( /==-_=LINEND/g, '\n' );
            compareHTML = compareHTML.replace( /==-_=LINEND/g, '\n' );

            this.fail_result_html = resultHTML;
            this.fail_compare_html = compareHTML;
            this.fail_result_path = path;
        },

        Execute: function( args ) {
            try{
    //            this.StartTmpLog();
    //            this.TmpLog( JSON.stringify( args ) );
                var ret;
                var pth = this.GetExecuteArgs( args );

                delete this.wait;

                ret = this.ExecuteSub( pth[ 0 ], pth[ 1 ], args[ 0 ] );

                return {
                    'args': args,
                    'fnArgs': pth[ 1 ],
                    'ret': ret
                };
            } catch( e ) {
                this.TmpLog( '=== ERROR in Execute!!! === ' + e.message + ' ===' );
            }
        },

        GetExecuteArgs: function( args ){
            var argsArray = $.map( args, function( value /*, index*/ ) {
                return [ value ];
            } );
            var fnArgs = argsArray.slice( 1 );
            var pth = args[ 0 ].split( '.' );

            return [ pth, fnArgs ];
        },

        ExecuteSub: function( pth, args, nm ) {
            try{
                var ret;

                this.TmpLog( nm + ' = ' + JSON.stringify( args ) );

                if( typeof this[ pth[ 0 ] ] === 'function' || typeof this[ pth[ 0 ] ] === 'object' ) {

                    if( pth.length === 1 ) {
                        ret = this[ pth[ 0 ] ].apply( this, args );
                    }

                    if( pth.length === 2 ) {
                        if( pth[ 1 ] === 'Start' && typeof this[ pth[ 0 ] ] === 'function' ) {
                            ret = this[ pth[ 0 ] ].apply( this, args );
                        } else {
                            ret = this[ pth[ 0 ] ][ pth[ 1 ] ].apply( this[ pth[ 0 ] ], args );
                        }
                    }

                    if( pth.length === 3 ) {
                        if( pth[ 2 ] === 'Start' && typeof this[ pth[ 0 ] ][ pth[ 1 ] ] === 'function' ) {
                            ret = this[ pth[ 0 ] ][ pth[ 1 ] ].apply( this[ pth[ 0 ] ], args );
                        } else {
                            ret = this[ pth[ 0 ] ][ pth[ 1 ] ][ pth[ 2 ] ].apply( this[ pth[ 0 ] ][ pth[ 1 ] ], args );
                        }
                    }
                } else {
                    this.SetFail( '##### pth[ 0 ] NOT EXIST IN THIS!!! ' + pth[ 0 ] + ' === ' + JSON.stringify( pth ) + ' === ' + JSON.stringify( args ) );
                }

                if ( this.wait ) {
                    ret = $.extend( true, { 'wait': this.wait }, ret );
                }

                return $.extend( true, this.GetGenericRetOutput(), ret );
            } catch( e ) {
                this.TmpLog( '=== ERROR in ExecuteSub!!! === ' + e.message + ' ===' );
            }
        },

        GetGenericRetOutput: function() {
            var output = {
                'tmp_log': this.tmp_log
            };

            if ( this.fail !== '' ) {
                output.fail = this.fail;
                output.fail_result_html = this.fail_result_html;
                output.fail_compare_html = this.fail_compare_html;
                output.fail_result_path = this.fail_result_path;
            }

            if ( this.queue ) {
                output.queue = this.queue;
                delete this.queue;
            }

            return output;
        },

        Sleep: function( fnName, tm, waitData ) {
            var self = this;

            this.wait = {
                'tp': 'wait_for_time',
                'sel': null,
                'tm': Date.now() + tm + 2000,
                'tm_wait': Date.now() + tm,
                'fn_name': fnName,
                'wait_data': waitData,
                'fn_func': null
            };

            return {
                next: function( func ) {
                    if( typeof func === 'string' ) {
                        self.wait.fn_name = func;
                    } else {
                        self.wait.fn_func = func;
                    }
                }
            };
        },

        WaitForElementVisible: function( sel, fnName, tm, waitData ) {
            var self = this;

            this.wait = {
                'tp': 'wait_for_element',
                'sel': sel,
                'tm': Date.now() + tm,
                'fn_name': fnName,
                'wait_data': waitData,
                'fn_func': null
            };

            return {
                next: function( func ) {
                    if( typeof func === 'string' ) {
                        self.wait.fn_name = func;
                    } else {
                        self.wait.fn_func = func;
                    }
                }
            };
        },

        FrameWaitForVisible: function( sel, fnName, tm, waitData ) {
            if ( typeof tm === 'undefined' ) {
                tm = 15000;
            }

            return this.WaitForElementVisible( '.FRAME' + sel, fnName, tm, waitData );
        },

        WaitForFn: function( waitFnName, fnName, tm, waitData ) {
            try{
                var self = this;

                this.wait = {
                    'tp': 'wait_for_fn',
                    'wait_fn_name': waitFnName,
                    'tm': Date.now() + tm,
                    'fn_name': fnName,
                    'wait_data': waitData,
                    'fn_func': null,
                    'wait_fn_func': null
                };

                return {
                    next: function( func ) {
                        if( typeof func === 'string' ) {
                            self.wait.fn_name = func;
                        } else {
                            self.wait.fn_func = func;
                        }
                        return this;
                    },
                    wait: function( func ) {
                        if( typeof func === 'string' ) {
                            self.wait.wait_fn_name = func;
                        } else {
                            self.wait.wait_fn_func = func;
                        }
                        return this;
                    }
                };
            } catch( e ) {
                this.TmpLog( '=== ERROR in WaitForFn!!! === ' + e.message + ' ===' );
            }
        },

        WaitForDfds: function( dfds, fnName, tm, waitData ) {
            try{
                var self = this;
                var doneIndex = self.dfds_done.length;
                self.dfds_done.push( false );

                $.when.apply( $, dfds ).done( function () {
                    setTimeout( function() {
                        self.dfds_done[ doneIndex ] = true;
                    }, 1000 );
                } );

                if ( typeof waitData === 'undefined' ) {
                    waitData = {};
                }

                waitData.done_index = doneIndex;

                //return this.WaitForFn( 'probe.__WaitForDfds:' + doneIndex, fnName, tm, waitData );
                return this.WaitForFn( 'probe.__WaitForDfds', fnName, tm, waitData );
            } catch( e ) {
                this.TmpLog( '=== ERROR in WaitForDfds!!! === ' + e.message + ' ===' );
            }
        },

        __WaitForDfds: function( input ) {
            return { 'wait_result': this.dfds_done[ input.wait_data.done_index ] };
        },

        __Done: function() {
            // intentionally empty
        },

        ArgsToArray: function( args ) {
            return $.map( args, function( value /*, index*/ ) {
                return [ value ];
            } );
        },

        RegisterTry: function( regex, func, data ) {
            if ( typeof data === 'undefined' ) {
                data = {};
            }

            if( typeof func === 'object' ) {
                var regexName = regex;
                if( regexName instanceof RegExp ) {
                    regexName = '' + regexName;
                    regexName = regexName.replace( /\./g, '•' );
                }
                this.__[ regexName ] = func;
                func = '__.' + regexName;
            }

            this.try_list.push( {
                'regex': regex,
                'func': func,
                'data': data
            } );
        },

        DoTry: function( args ) {
            var self = this;
            var ret = {};

            self.StartTmpLog();

            try{
                var argsArray = self.ArgsToArray( args );

                $.each( self.try_list, function( ii, tryItem ) {
                    if( tryItem.regex instanceof RegExp ) {
                        var match = tryItem.regex.exec( argsArray[ 0 ] );
                        if( match ) {
                            ret.try_name = tryItem.func;
                            ret.try_data = tryItem.data;
                            $.each( ret.try_data, function( key, val ) {
                                if( val === '{{match 0}}' ) {
                                    ret.try_data[ key ] = match[ 1 ];
                                }
                                if( val === '{{match 1}}' ) {
                                    ret.try_data[ key ] = match[ 2 ];
                                }
                                if( val === '{{match 2}}' ) {
                                    ret.try_data[ key ] = match[ 3 ];
                                }
                            } );
                        }
                    } else {
                        if( tryItem.regex === argsArray[ 0 ] ) {
                            ret.try_name = tryItem.func;
                            ret.try_data = tryItem.data;
                        }
                    }
                } );
            } catch( e ) {
                this.TmpLog( '=== ERROR in DoTry!!! === ' + e.message + ' ===' );
            }

            return ret;
        },

        DoStart: function( args ) {
            this.StartTmpLog();

            try{
                var argsArray = this.ArgsToArray( args );

                argsArray[ 0 ] += '.Start';

                return this.Execute( argsArray );
            } catch( e ) {
                this.TmpLog( '=== ERROR in DoStart!!! === ' + e.message + ' ===' );
            }
        },

        DoWait: function( args ) {
            this.StartTmpLog();

            try {
                var ret;
                var wait = args[ 0 ];
                var waitCheckResult = false;
                var argsArray;
                var argsArZero;

                try {
                    argsArray = this.ArgsToArray( args );
                    argsArray = argsArray.slice( 1 );
                    argsArZero = argsArray[ 0 ];
                } catch( e ) {
                    this.TmpLog( '=== ERROR in DoWait ArgsToArray!!! === ' + e.message + ' ===' );
                }

                if( wait.tp === 'wait_for_time' ) {
                    if( Date.now() > wait.tm_wait ) {
                        waitCheckResult = true;
                    }
                }

                if( wait.tp === 'wait_for_element' ) {
                    try {
                        if( wait.sel.indexOf( '.FRAME' ) === 0 ) {
                            if( this.FrameIsVisible( wait.sel.substr( 6 ) ) ) {
                                waitCheckResult = true;
                            }
                        } else {
                            if( this.IsVisible( $( wait.sel ) ) ) {
                                waitCheckResult = true;
                            }
                        }
                    } catch( e ) {
                        this.TmpLog( '=== ERROR in DoWait wait_for_element!!! === ' + e.message + ' ===' );
                    }
                }

                if( wait.tp === 'wait_for_fn' ) {
                    try {
                        if( wait.wait_fn_func ) {
                            eval( 'this.___WaitFunction = ' + wait.wait_fn_func );
                            argsArray[ 0 ] = '___WaitFunction';
                        } else if( wait.wait_fn_name.indexOf( 'probe.' ) === 0 ) {
                            argsArray[ 0 ] = wait.wait_fn_name.substr( 'probe.'.length );
                        } else if( wait.wait_fn_name === '' ) {
                            argsArray[ 0 ] = '__Done';
                        } else {
                            argsArray[ 0 ] = argsArZero + '.' + wait.wait_fn_name;
                        }
                        ret = this.Execute( argsArray );

                        if( ret.ret.wait_result ) {
                            waitCheckResult = true;
                        }
                    } catch( e ) {
                        this.TmpLog( '=== ERROR in DoWait wait_for_fn!!! === ' + e.message + ' ===' );
                    }
                }

                if( waitCheckResult ) {
                    try {
                        if( wait.fn_func ) {
                            try {
                                eval( 'this.___NextFunction = ' + wait.fn_func );
                                argsArray[ 0 ] = '___NextFunction';
                            } catch( e ) {
                                this.TmpLog( '=== ERROR in DoWait ___NextFunction!!! === ' + e.message + ' ===' );
                            }
                        } else if( wait.fn_name === '' ) {
                            argsArray[ 0 ] = '__Done';
                        } else {
                            argsArray[ 0 ] = argsArZero + '.' + wait.fn_name;
                        }

                        try {
                            ret = this.Execute( argsArray );
                        } catch( e ) {
                            this.TmpLog( '=== ERROR in DoWait Execute!!! === ' + e.message + ' === ' + argsArray[ 0 ] + ' ===' );
                        }
                    } catch( e ) {
                        this.TmpLog( '=== ERROR in DoWait waitCheckResult!!! === ' + e.message + ' ===' );
                    }
                } else if( Date.now() > wait.tm ) {
                    ret = { 'ret': { 'wait_status': 'timeout' } };

                    this.TmpLog( 'WAIT TIMEOUT!!! ' + JSON.stringify( args ) );
                    this.SetFail( 'WAIT TIMEOUT!!! ' + JSON.stringify( args ) );
                } else {
                    ret = { 'ret': { 'wait_status': 'waiting' } };
                }
            } catch( e ) {
                this.TmpLog( '=== ERROR in DoWait!!! === ' + e.message + ' ===' );
            }

            return $.extend( true, { 'DoWait args': args, 'ret': this.GetGenericRetOutput() }, ret );
        },

        DoNext: function( args ) {
            this.StartTmpLog();

            try{
                var argsArray = this.ArgsToArray( args );

                if( args[ 1 ].next_fn_func ) {
                    eval( 'this.___NextFunction = ' + args[ 1 ].next_fn_func );
                    argsArray[ 0 ] = '___NextFunction';
                } else if( args[ 1 ].next_fn_name === '' ) {
                    argsArray[ 0 ] = '__Done';
                } else {
                    argsArray[ 0 ] += '.' + args[ 1 ].next_fn_name;
                }

                return this.Execute( argsArray );
            } catch( e ) {
                this.TmpLog( '=== ERROR in DoNext!!! === ' + e.message + ' ===' );
            }
        },

        QueueStory: function( fnName, newInput, nextFnName ) {
            var self = this;

            try{
                if ( typeof nextFnName === 'undefined' ) {
                    nextFnName = '';
                }

                this.queue = {
                    'new_fn_name': fnName,
                    'new_input': newInput,
                    'next_fn_name': nextFnName,
                    'next_fn_func': null
                };

                return {
                    next: function( func ) {
                        if( typeof func === 'string' ) {
                            self.queue.next_fn_name = func;
                        } else {
                            self.queue.next_fn_func = func;
                        }
                    }
                };
            } catch( e ) {
                this.TmpLog( '=== ERROR in QueueStory!!! === ' + e.message + ' ===' );
            }
        },

        GotoUrl: function( url, waitForSelector ) {
            return this.QueueStory( 'GotoUrl', { 'url': url, 'waitForSelector': waitForSelector } );
        },

        // Create and return a new array for deferreds

        NewDfds: function() {
            // create an array constructor
            var Array2 = function() {
                // initialise the array
                var x = [], a = arguments;
                for( var i = 0; i < a.length; i++ ) {
                    x.push( a[ i ] )
                }
                for( i in this ) {
                    x[ i ] = this[ i ]
                }
                return x;
            };

            // inherit from Array
            Array2.prototype = [];

            Array2.prototype.add = function( dfd ) {
                this.push( dfd );
            };

            Array2.prototype.done = function( doneFunction ) {
                $.when.apply( $, this ).done( doneFunction );
            };

            return new Array2();
        }
    };

    ////////////////////////////////////////

    jQuery.fn.extend( {
        // Function names start with a capital by design!
        // That way they will not conflict with native jQuery functions (for instance Click() vs click())

        MustExist: function() {
            return this.MustExistTimes( 1, false );
        },

        MustExistOnce: function() {
            return this.MustExistTimes( 1 );
        },

        MustExistTimes: function( count, exact ) {
            count = + count; // Make sure it's an integer

            if ( typeof exact === 'undefined' ) {
                exact = true;
            }

            if ( ( exact && this.length !== count ) || ( !exact && this.length < count ) ) {
                this.prb_valid = false;

                probe.SetFail( 'Element does not exist (or not enough times: ' + count + ' needed; ' + this.length + ' found): ' + this.selector );
            } else {
                this.prb_valid = true;
            }

            return this;
        },

        MustBeVisible: function() {
            if ( ! probe.IsVisible( this ) ) {
                this.prb_valid = false;
                probe.SetFail( 'Element is not visible: ' + this.selector );
            }

            return this;
        },

        IfVisible: function() {
            if ( this._CheckValid() ) {
                if ( ! probe.IsVisible( this ) ) {
                    this.prb_valid = false;
                }
            }

            return this;
        },

        OtherIfNotVisible: function( selector ) {
            if ( this._CheckValid() ) {
                if ( probe.IsVisible( $( selector ) ) ) {
                    this.prb_valid = false;
                }
            }

            return this;
        },

        /**
         * @return mixed
         */
        IsVisible: function() {
            if ( this._CheckValid() ) {
                return probe.IsVisible( this );
            }

            return false;
        },

        Click: function() {
            if ( this._CheckValid() ) {
                probe.Click( this );
            }

            return this;
        },

        AddClass: function( cls ) {
            if ( this._CheckValid() ) {
                this.addClass( cls );
            }

            return this;
        },

        WaitForFn: function( waitFnName, fnName, tm, waitData ) {
            if ( typeof tm === 'undefined' ) {
                tm = 15000;
            }

            return probe.WaitForFn( waitFnName, fnName, tm, waitData );
        },

        WaitForVisible: function( fnName, tm, waitData ) {
            if ( typeof tm === 'undefined' ) {
                tm = 15000;
            }

            return probe.WaitForElementVisible( this.selector, fnName, tm, waitData );
        },

        // Functions for internal use only

        _CheckValid: function() {
            return ( typeof this.prb_valid === 'undefined' || this.prb_valid );
        }
    } );

    ////////////////////////////////////////

    return probe;
} )( jQuery, swiftyProbe );