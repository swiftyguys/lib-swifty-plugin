var swiftyProbe = ( function( $, probe ) {
    probe = probe || {
        tmp_log: '',
        fail: '',

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

        GetElementCenter: function( $el ) {
            var offset = $el.offset();

            return {
                'x': offset.left + $el.width() / 2,
                'y': offset.top + $el.height() / 2
            };
        },

        /**
         * @return bool
         */
        IsVisible: function( $el ) {
            if ( $el.length > 0 ) {
                var xy = this.GetElementCenter( $el );

                // dorh Improve; in viewport?; on top?; hidden?; width>0? height>0?
                if ( xy.x >= 0 && xy.y >= 0 && $el.is( ':visible' ) ) {
                    return true;
                }
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

        Execute: function( args ){
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
        },

        GetExecuteArgs: function( args ){
            var argsArray = $.map( args, function( value /*, index*/ ) {
                return [ value ];
            } );
            var fnArgs = argsArray.slice( 1 );
            var pth = args[ 0 ].split( '.' );

            return [ pth, fnArgs ];
        },

        ExecuteSub: function( pth, args, nm ){
            var ret;

            this.TmpLog( nm + ' = ' + JSON.stringify( args ) );

            if ( pth.length === 1 ) {
                ret = this[ pth[0] ].apply( this, args );
            }

            if ( pth.length === 2 ) {
                if( pth[ 1 ] === 'Start' && typeof this[ pth[0] ] === 'function' ) {
                    ret = this[ pth[ 0 ] ].apply( this, args );
                } else {
                    ret = this[ pth[ 0 ] ][ pth[ 1 ] ].apply( this[ pth[ 0 ] ], args );
                }
            }

            if ( pth.length === 3 ) {
                if( pth[ 2 ] === 'Start' && typeof this[ pth[0] ][ pth[1] ] === 'function' ) {
                    ret = this[ pth[ 0 ] ][ pth[ 1 ] ].apply( this[ pth[ 0 ] ], args );
                } else {
                    ret = this[ pth[ 0 ] ][ pth[ 1 ] ][ pth[ 2 ] ].apply( this[ pth[ 0 ] ][ pth[ 1 ] ], args );
                }
            }

            if ( this.wait ) {
                ret = $.extend( true, { 'wait': this.wait }, ret );
            }

            return $.extend( true, this.GetGenericRetOutput(), ret );
        },

        GetGenericRetOutput: function() {
            var output = {
                'tmp_log': this.tmp_log
            };

            if ( this.fail !== '' ) {
                output.fail = this.fail;
            }

            if ( this.queue ) {
                output.queue = this.queue;
                delete this.queue;
            }

            return output;
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
                    self.wait.fn_func = func;
                }
            };
        },

        WaitForFn: function( waitFnName, fnName, tm, waitData ) {
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
                    self.wait.fn_func = func;
                    return this;
                },
                wait: function( func ) {
                    self.wait.wait_fn_func = func;
                    return this;
                }
            };
        },

        ArgsToArray: function( args ) {
            return $.map( args, function( value /*, index*/ ) {
                return [ value ];
            } );
        },

        DoStart: function( args ) {
            this.StartTmpLog();

            var argsArray = this.ArgsToArray( args );

            argsArray[ 0 ] += '.Start';

            return this.Execute( argsArray );
        },

        DoWait: function( args ) {
            this.StartTmpLog();

            var ret;
            var wait = args[ 0 ];
            var waitCheckResult = false;
            var argsArray = this.ArgsToArray( args );

            argsArray = argsArray.slice( 1 );

            var argsArZero = argsArray[ 0 ];

            if ( wait.tp === 'wait_for_element' ) {
                if ( this.IsVisible( $( wait.sel ) ) ) {
                    waitCheckResult = true;
                }
            }

            if ( wait.tp === 'wait_for_fn' ) {
                if( wait.wait_fn_func ) {
                    eval( 'this.___WaitFunction = ' + wait.wait_fn_func );
                    argsArray[ 0 ] = '___WaitFunction';
                } else {
                    argsArray[ 0 ] = argsArZero + '.' + wait.wait_fn_name;
                }
                ret = this.Execute( argsArray );

                if ( ret.ret.wait_result ) {
                    waitCheckResult = true;
                }
            }

            if ( waitCheckResult ) {
                if( wait.fn_func ) {
                    eval( 'this.___NextFunction = ' + wait.fn_func );
                    argsArray[ 0 ] = '___NextFunction';
                } else {
                    argsArray[ 0 ] = argsArZero + '.' + wait.fn_name;
                }
                ret = this.Execute( argsArray );
            } else if ( Date.now() > wait.tm ) {
                ret = { 'ret': { 'wait_status': 'timeout' } };

                this.TmpLog( 'WAIT TIMEOUT!!!' );
                this.SetFail( 'WAIT TIMEOUT!!!' );
            } else {
                ret = { 'ret': { 'wait_status': 'waiting' } };
            }

            return $.extend( true, { 'DoWait args': args, 'ret': this.GetGenericRetOutput() }, ret );
        },

        DoNext: function( args ) {
            this.StartTmpLog();

            var argsArray = this.ArgsToArray( args );

            if( args[ 1 ].next_fn_func ) {
                eval( 'this.___NextFunction = ' + args[ 1 ].next_fn_func );
                argsArray[ 0 ] = '___NextFunction';
            } else {
                argsArray[ 0 ] += '.' + args[ 1 ].next_fn_name;
            }

            return this.Execute( argsArray );
        },

        QueueStory: function( fnName, newInput, nextFnName ) {
            var self = this;

            this.queue = {
                'new_fn_name': fnName,
                'new_input': newInput,
                'next_fn_name': nextFnName,
                'next_fn_func': null
            };

            return {
                next: function( func ) {
                    self.queue.next_fn_func = func;
                }
            };
        },

        GotoUrl: function( url, waitForSelector ) {
            return this.QueueStory( 'GotoUrl', { 'url': url, 'waitForSelector': waitForSelector } );
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
                tm = 5000;
            }

            return probe.WaitForFn( waitFnName, fnName, tm, waitData );
        },

        WaitForVisible: function( fnName, tm, waitData ) {
            if ( typeof tm === 'undefined' ) {
                tm = 5000;
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