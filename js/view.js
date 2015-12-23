//
// Responsive images
//

function swifty_findAncestor( el, cls ) {
    while( ( el = el.parentElement ) && !swifty_hasClass( el, cls ) ) {}
    return el;
}

function swifty_hasClass( el, cls ) {
    return ( ' ' + el.className + ' ' ).indexOf( ' ' + cls + ' ' ) > -1;
}

function swifty_fixSideMenu() {
    if( document.documentElement.clientWidth <= 639 ) {
        var menus = document.getElementsByClassName( 'swifty_main_menu' );
        var frames = document.getElementsByClassName( 'swifty_area_inner_content_frame' );
        var hubs = document.getElementsByClassName( 'swifty_area_hub' );

        if( menus.length > 0 && frames.length > 0 && hubs.length > 0 ) {
            var area = swifty_findAncestor( menus[ 0 ], 'swifty_vertical_area' );
            if( area ) {
                var order = parseInt( swifty_getStyle( hubs[ 0 ], 'order' ), 10 );
                var areaClone = area.cloneNode( false );

                frames[ 0 ].appendChild( areaClone );
                areaClone.appendChild( menus[ 0 ] );

                areaClone.style.order = order - 1;
            }
        }
    }
}

function swifty_checkImages() {
    if( ssd_status_onload > 0 ) {
        setTimeout( function() { // Needed, because in Firefox I would otherwise come to soon on SCC page edit.
            var elements = document.getElementsByTagName( 'img' );
            for( var i = 0; i < elements.length; i++ ) {
                var el = elements[ i ];
                if( typeof el.getAttribute( 'swifty_src' ) !== 'undefined' && el.getAttribute( 'swifty_src' ) && el.getAttribute( 'swifty_src' ) !== '' ) {
                    var w = el.clientWidth;
                    var win;
                    var mw;
                    if( w === 0 ) {
                        win = document.defaultView || window;
                        mw = window.getComputedStyle( el )[ 'max-width' ];
                        if( win.getComputedStyle ) {
                            var wm = parseInt( mw, 10 );
                            if( wm > 0 && mw.indexOf( 'px' ) >= 0 ) {
                                w = wm;
                            }
                        }
                    }
                    //if( w === 0 ) { // Disabled for now, to force logo's to always size based on max-width. Because IE already has a (incorrect) width from el.clientWidth.
                        var logo = swifty_findAncestor( el, 'swifty_ssd_item_logo' );
                        if( logo ) {
                            win = document.defaultView || window;
                            mw = window.getComputedStyle( logo )[ 'max-width' ];
                            if( win.getComputedStyle ) {
                                var wm = parseInt( mw, 10 );
                                if( wm > 0 && mw.indexOf( 'px' ) >= 0 ) {
                                    w = wm;
                                }
                            }
                        }
                    //}
                    if( w > 0 ) {
                        var url = el.getAttribute( 'swifty_src' ) + '&ssw=' + w; // + '&ssh=' + h;
                        if( typeof window.devicePixelRatio !== 'undefined' && window.devicePixelRatio > 0 ) {
                            url += '&sspr=' + window.devicePixelRatio;
                        }
                        el.src = url;
                    } else {
                        el.src = el.getAttribute( 'swifty_src' );
                    }
                    el.removeAttribute( 'swifty_src' );
                }
            }
        }, 1 );
    }
}

// Try to make text items fit on one line.

function swifty_checkTextItems() {
    if( ssd_status_onload > 0 ) {
        setTimeout( function() {
            var title = document.querySelectorAll( '.swifty_ssd_item_title' )[ 0 ];
            var slogan = document.querySelectorAll( '.swifty_ssd_item_slogan' )[ 0 ];

            swifty_fitTextElement( title, 'div.swifty_ssd_item_title' );
            swifty_fitTextElement( slogan, 'div.swifty_ssd_item_slogan' );
        }, 1 );
    }
}

// Add a style tag to the head

function swifty_addStylesheet( style ) {
    var el = document.createElement( 'style' );
    el.type = 'text/css';
    document.getElementsByTagName( 'head' )[ 0 ].appendChild( el );
    el.appendChild( document.createTextNode( style ) );
}

// Try to fit a text element into the viewport width by reducing the fontsize.

function swifty_fitTextElement( el, sel ) {
    if( el ) {
        var r = el.getBoundingClientRect();
        var fs = parseInt( swifty_getStyle( el, 'font-size' ), 10 );
        while( fs > 10 && r.height > 1.5 * swifty_getLineHeight( el ) ) {
            fs--;
            // The style below will override the style defined in the swifty stylesheet.
            // It can not be done via inline style on the text, because of a bug in chrome.
            swifty_addStylesheet( sel + ' { font-size:' + fs + 'px !important }' );
            r = el.getBoundingClientRect();
        }
    }
}

// Get the line-height of an element, or 9999 if no height in px found

function swifty_getLineHeight( el ) {
    var h = Math.floor( parseFloat( swifty_getStyle( el, 'font-size' ) ) * 1.5 ); // Best guess. Because trying via line-height fails in IE.
    if( h <= 0 ) {
        h = 9999;
    }
    return h;
}

// Get an element's applied style property

function swifty_getStyle( el, styleProp )  {
    var y = null;
    if( el.currentStyle )
        y = el.currentStyle[ styleProp ];
    else if( window.getComputedStyle )
        y = document.defaultView.getComputedStyle( el, null ).getPropertyValue( styleProp );
    return y;
}

function swifty_set_breakout( row, breakout, contentBreakout ) {
    var wLeft = 0;
    var wRight = 0;

    var attr = [ 'swc_padding_left', 'swc_padding_right' ];
    for( var i = 0; i < attr.length; i++ ) {
        var key = 'data-' + attr[ i ];
        if( typeof row.getAttribute( key ) !== 'undefined' && row.getAttribute( key ) ) {
            var val = parseInt( row.getAttribute( key ), 10 );
            if( val > 0 || val < 0 ) {
                switch( attr[ i ] ) {
                    case 'swc_padding_left':
                        wLeft += val;
                        break;
                    case 'swc_padding_right':
                        wRight += val;
                        break;
                }
            }
        }
    }

    row.style.width = '100%';
    row.style.marginLeft = 0;
    row.style.paddingLeft = wLeft + 'px';
    row.style.marginRight = 0;
    row.style.paddingRight = wRight + 'px';

    if( breakout === 1 || contentBreakout === 1 ) {
        var xContent = row.getBoundingClientRect().left;
        var wContent = parseInt( window.getComputedStyle( row.parentNode ).width, 10 );
        var wViewport = document.compatMode === 'BackCompat' ? document.body.clientWidth : document.documentElement.clientWidth;

        row.style.width = wViewport + 'px';
        row.style.marginLeft = '-' + xContent + 'px';
        row.style.marginRight = '-' + ( wViewport - xContent - wContent ) + 'px';
        if( contentBreakout !== 1 ) {
            row.style.paddingLeft = ( xContent + wLeft ) + 'px';
            row.style.paddingRight = ( wViewport - xContent - wContent + wRight ) + 'px';
        }
    }
}

function swifty_check_breakouts() {
    // Run multiple times after delays, to make sure the breakouts are always applied.
    __swifty_check_breakouts();
    setTimeout( function() {
        __swifty_check_breakouts();
    }, 100 );
    setTimeout( function() {
        __swifty_check_breakouts();
    }, 1000 );
    setTimeout( function() {
        __swifty_check_breakouts();
    }, 5000 );
}

function __swifty_check_breakouts() {
    var breakouts = document.getElementsByClassName( 'swc_breakout' );
    for( var i = 0; i < breakouts.length; i++ ) {
        swifty_set_breakout( breakouts[ i ], 1, swifty_hasClass( breakouts[ i ], 'swc_content_breakout' ) ? 1 : 0 );
    }
}

// CSS Lazy load method suggested by Google PageSpeed Insights.
// https://developers.google.com/speed/docs/insights/OptimizeCSSDelivery

function swifty_loadCSS( href ) {
    var cb = function() {
        var l = document.createElement( 'link' );
        l.rel = 'stylesheet';
        l.href = href;
        var h = document.getElementsByTagName( 'head' )[ 0 ];
        h.parentNode.insertBefore( l, h );
    };
    var raf = requestAnimationFrame || mozRequestAnimationFrame || webkitRequestAnimationFrame || msRequestAnimationFrame;
    if( raf ) raf( cb );
    else window.addEventListener( 'load', cb );
}

// CSS Lazy load method by Filament Group. Works well, but sometimes PageSpeed Inaight shows false positives. So we will be using Google's function for now.
// https://github.com/filamentgroup/loadCSS/blob/master/loadCSS.js

//function swifty_loadCSS( href, before, media, callback ){
//	"use strict";
//	// Arguments explained:
//	// `href` is the URL for your CSS file.
//	// `before` optionally defines the element we'll use as a reference for injecting our <link>
//	// By default, `before` uses the first <script> element in the page.
//	// However, since the order in which stylesheets are referenced matters, you might need a more specific location in your document.
//	// If so, pass a different reference element to the `before` argument and it'll insert before that instead
//	// note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
//	var ss = window.document.createElement( "link" );
//	var ref = before || window.document.getElementsByTagName( "script" )[ 0 ];
//	var sheets = window.document.styleSheets;
//	ss.rel = "stylesheet";
//	ss.href = href;
//	// temporarily, set media to something non-matching to ensure it'll fetch without blocking render
//	ss.media = "only x";
//	// DEPRECATED
//	if( callback ) {
//		ss.onload = callback;
//	}
//
//	// inject link
//	ref.parentNode.insertBefore( ss, ref );
//	// This function sets the link's media back to `all` so that the stylesheet applies once it loads
//	// It is designed to poll until document.styleSheets includes the new sheet.
//	ss.onloadcssdefined = function( cb ){
//		var defined;
//		for( var i = 0; i < sheets.length; i++ ){
//			if( sheets[ i ].href && sheets[ i ].href === ss.href ){
//				defined = true;
//			}
//		}
//		if( defined ){
//			cb();
//		} else {
//			setTimeout(function() {
//				ss.onloadcssdefined( cb );
//			});
//		}
//	};
//	ss.onloadcssdefined(function() {
//        // dorh This causes Chrome to load the css twice it seems, but see original remark above
//        ss.media = media || "all";
//	});
//	return ss;
//}

function swifty_loadJs( src, returnData, cb ) {
    var head = document.getElementsByTagName( 'head' )[ 0 ] || document.documentElement;
    var script = document.createElement( 'script' );
    script.src = src;

    // Handle Script loading
    var done = false;

    // Attach handlers for all browsers
    script.onload = script.onreadystatechange = function() {
        if( ! done && ( ! this.readyState || this.readyState === 'loaded' || this.readyState === 'complete' ) ) {
            done = true;
            if( cb ) {
                cb( returnData );
            }

            // Handle memory leak in IE
            script.onload = script.onreadystatechange = null;
            if( head && script.parentNode ) {
                head.removeChild( script );
            }
        }
    };

    // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
    // This arises when a base node is used (#2709 and #4378).
    head.insertBefore( script, head.firstChild );
}

function swifty_loadJsHelper( scrpt, index ) {
    var depsDone = true;
    if( scrpt.deps ) {
        for( var i = 0; i < scrpt.deps.length; i++ ) {
            var dep = ssd_list_loadJs[ scrpt.deps[ i ] ];
            if( ! dep.done ) {
                depsDone = false;
            }
        }
    }
    if( depsDone && ! scrpt.done && ! scrpt.loading ) {
        scrpt.loading = true;
        swifty_loadJs( scrpt.src, index , function( index2 ) {
            ssd_list_loadJs[ index2 ].done = true;
            swifty_downloadJSAtOnload();
        } );
    }
}

function swifty_downloadJSAtOnload() {
    var i;
    var scrpt;

    if( typeof ssd_list_loadJs !== 'undefined' ) {

        // Make all items objects
        for( i = 0; i < ssd_list_loadJs.length; i++ ) {
            scrpt = ssd_list_loadJs[ i ];

            if( typeof scrpt === 'string' ) {
                scrpt = ssd_list_loadJs[ i ] = { 'src': scrpt };
            }

            if( ! scrpt.hasOwnProperty( 'done' ) ) {
                scrpt.done = false;
            }
            if( ! scrpt.hasOwnProperty( 'loading' ) ) {
                scrpt.loading = false;
            }
        }

        // Turn all dependencies into an index into the array
        for( i = 0; i < ssd_list_loadJs.length; i++ ) {
            scrpt = ssd_list_loadJs[ i ];

            if( scrpt.deps ) {
                for( var k = 0; k < scrpt.deps.length; k++ ) {
                    var dep = scrpt.deps[ k ];
                    if( typeof dep === 'string' ) {
                        for( var j = 0; j < ssd_list_loadJs.length; j++ ) {
                            var sr = ssd_list_loadJs[ j ];
                            if( sr.handle === dep ) {
                                dep = scrpt.deps[ k ] = j;
                            }
                        }
                        if( typeof dep === 'string' ) {
                            var obj = { 'handle': dep };
                            if( dep === 'jquery' ) {
                                if( typeof jQuery !== 'undefined' ) {
                                    obj.done = true;
                                } else {
                                    obj.src = '//ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js';
                                }
                            }
                            ssd_list_loadJs.push( obj );
                            scrpt.deps[ k ] = ssd_list_loadJs.length - 1;
                        }
                    }
                }
            }
        }

        // Load the item
        for( i = 0; i < ssd_list_loadJs.length; i++ ) {
            scrpt = ssd_list_loadJs[ i ];

            if( ! scrpt.done && ! scrpt.loading ) {
                swifty_loadJsHelper( scrpt, i );
            }
        }
    }
}

function swifty_triggerOnload() {
    ssd_status_onload++;
    swifty_add_exec( { 'status': 'release', 'for': 'page_loaded' } );
    swifty_check_breakouts();
    swifty_checkImages();
    swifty_checkTextItems();
    swifty_downloadJSAtOnload();
}

function swifty_initOnLoadJs() {
    if( window.addEventListener )
        window.addEventListener( "load", swifty_triggerOnload, false );
    else if( window.attachEvent )
        window.attachEvent( "onload", swifty_triggerOnload );
    else window.onload = swifty_triggerOnload;
}

function swifty_loadFonts() {
    var ssdWebfonts = {
        google: {
            families: ssd_list_loadFont
        }
    };
    WebFont.load( ssdWebfonts );
}

function swifty_wait_loadFonts() {
    // dorh Quit trying after ... seconds
    if( typeof WebFont !== 'undefined' ) {
        swifty_loadFonts();
    } else {
        setTimeout( swifty_wait_loadFonts, 50 );
    }
}

function swifty_send_event( element, name ) {
    name = 'evt_swc_' + name;

    var event; // The custom event that will be created

    if( document.createEvent ) {
      event = document.createEvent( 'HTMLEvents' );
      event.initEvent( name, true, true );
    } else {
      event = document.createEventObject();
      event.eventType = name;
    }

    event.eventName = name;

    if( document.createEvent ) {
      element.dispatchEvent( event );
    } else {
      element.fireEvent( 'on' + event.eventType, event );
    }
}

function swifty_do_execFindRelease( fr ) {
    for( var i = 0; i < swifty_list_exec.length; i++ ) {
        var ex = swifty_list_exec[ i ];
        if( ex.status === 'release' && ex.for === fr ) {
            return ex;
        }
    }
    return null;
}

function swifty_do_execFindDone( dn ) {
    for( var i = 0; i < swifty_list_exec.length; i++ ) {
        var ex = swifty_list_exec[ i ];
        if( ex.done === dn ) {
            return ex;
        }
    }
    return null;
}

var swifty_do_loadCSS = function() {
    if( typeof ssd_list_loadCss !== 'undefined' ) {
        var item;
        while( item = ssd_list_loadCss.pop() ) {
            swifty_loadCSS( item );
        }
    }
};

var swifty_do_loadJs = function() {
    // dorh
};

var swifty_do_loadFont = function() {
    swifty_wait_loadFonts();
};

var swifty_do_exec = function() {
    var onHold = false;
    var i;
    var ex;
    for( i = 0; i < swifty_list_exec.length; i++ ) {
        ex = swifty_list_exec[ i ];
        if( ex.status === 'hold' ) {
            if( ! swifty_do_execFindRelease( ex.for ) ) {
                onHold  =true;
            }
        }
    }
    if( ! onHold ) {
        for( i = 0; i < swifty_list_exec.length; i++ ) {
            ex = swifty_list_exec[ i ];
            if( ! ex.done ) {
                if( !ex.hasOwnProperty( 'wait_done' ) || swifty_do_execFindDone( ex.wait_done ) ) {
                    if( ex.evt ) {
                        swifty_send_event( window, ex.evt );
                        ex.done = true;
                    }
                    if( ex.fn && typeof window[ ex.fn ] === 'function' ) {
                        window[ ex.fn ]();
                        ex.done = true;
                    }
                }
            }
        }
    }
};

swifty_initOnLoadJs();
swifty_do_loadCSS();
swifty_do_loadFont();
swifty_do_loadJs();
swifty_do_exec();
swifty_checkImages();
swifty_checkTextItems();
swifty_fixSideMenu();