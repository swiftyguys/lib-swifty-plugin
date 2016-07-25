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

function swifty_addClass( el, cls ) {
    if( ! swifty_hasClass( el, cls ) ) el.className += ' ' + cls;
}

function swifty_removeClass( el, cls ) {
    if( swifty_hasClass( el, cls ) ) {
        var reg = new RegExp( '(\\s|^)' + cls + '(\\s|$)' );
        el.className = el.className.replace( reg, ' ' );
    }
}

/**
 * Returns true when page is loaded, all scripts are loaded and no commands waiting for executing.
 * @returns {boolean}
 */
function swifty_is_page_loaded() {
    if( ( ssd_status_onload > 0 ) && ssd_list_loadJs_done ) {
        // To be sure all scripts are actually loaded.
        var i, scrpt;
        for( i = 0; i < ssd_list_loadJs.length; i ++ ) {
            scrpt = ssd_list_loadJs[i];

            if( ( typeof scrpt === 'string' ) || ! scrpt.done && ! scrpt.loading ) {
                return false;
            }
        }
        return true;
    }
    return false;
}

function swifty_fixSideMenu() {
    try {
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
    } catch( e ) {}
}

function swifty_checkImages() {
    try {
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
                        if( typeof scc_data !== 'undefined' ) {
                            el.setAttribute( 'swifty_src_org', el.getAttribute( 'swifty_src' ) );
                        }

                        el.removeAttribute( 'swifty_src' );
                    }
                }
            }, 1 );
        }
    } catch( e ) {}
}

function swifty_startScrolleffect() {
    try {
        var scrollTimer;
        window.onscroll = function() {
            if( ! scrollTimer ) {
                scrollTimer = setTimeout( function() {
                    swifty_updateScrolleffect();
                    scrollTimer = null;
                }, 20 );
            }
        };
        swifty_updateScrolleffect();
    } catch( e ) {}
}

function swifty_updateScrolleffect() {
    try {
        if( typeof JSON !== 'undefined' && typeof JSON.parse !== 'undefined' ) {
            var wV = window.innerWidth;
            var hV = window.innerHeight;
            var sY = window.pageYOffset;
            var els = document.querySelectorAll( '[data-swc_scrolleffect]' );
            for( var i = 0; i < els.length; i++ ) {
                try {
                    var el = els[ i ];
                    var scrD = el.getAttribute( 'data-swc_scrolleffect' );
                    if( typeof scrD === 'string' && scrD.substr( 0, 1 ) === '{' ) {
                        scrD = JSON.parse( scrD );
                        var viewportOffset = el.getBoundingClientRect();
                        var mx = swifty_parseMatrix( getComputedStyle( el, null ).transform );
                        var xEl = viewportOffset.left - mx.m41;
                        var yEl = viewportOffset.top - mx.m42;
                        var wEl = el.clientWidth;
                        var hEl = el.clientHeight;
                        var f = parseFloat( scrD.factor );
                        var o = parseFloat( scrD.offset );
                        var bpx = el.style.backgroundPosition.split( ' ' );
                        var p;
                        if( scrD.effect === 'stick' ) {
                            var bodyRect = document.body.getBoundingClientRect();
                            var elRect = el.getBoundingClientRect();
                            var yAbsY = elRect.top - bodyRect.top;
                            var spAttr = 'data-swc_screff_id';
                            var spId = el.getAttribute( spAttr );
                            var spacer = null;
                            var remStick = 0;
                            if( spId && spId + '' !== '' ) {
                                spacer = document.getElementById( spId );
                                var spacerRect = spacer.getBoundingClientRect();
                                yAbsY = spacerRect.top - bodyRect.top;
                            }
                            if( sY >= yAbsY ) {
                                el.style.position = 'fixed';
                                if( ! spacer ) {
                                    var htmlMarginTop = parseInt( swifty_getStyle( document.documentElement, 'margin-top' ), 10 );
                                    if( ! ( htmlMarginTop >= 0 ) ) {
                                        htmlMarginTop = 0;
                                    }
                                    el.style.zIndex = '1000';
                                    el.style.top = htmlMarginTop + 'px';
                                    spId = 'swc_body_spacer_' + Math.random();
                                    var spParent = el.parentElement;
                                    spacer = document.createElement( 'div' );
                                    spacer.setAttribute( 'id', spId );
                                    el.setAttribute( spAttr, spId );
                                    spParent.insertBefore( spacer, spParent.firstChild );
                                    spacer.style.height = hEl + 'px';
                                    spacer.style.order =  window.getComputedStyle( el )[ 'order' ];
                                    swifty_addClass( el, 'swifty_is_sticked' );
                                }
                            } else {
                                if( spacer ) {
                                    remStick = 1;
                                }
                            }
                            if( scrD.do === 'remove' ) {
                                el.removeAttribute( 'data-swc_scrolleffect' );
                                remStick = 1;
                            }
                            if( remStick === 1 ) {
                                el.parentElement.removeChild( spacer );
                                el.style.position = 'relative';
                                el.style.top = 'initial';
                                el.setAttribute( 'data-swc_screff_id', '' );
                                swifty_removeClass( el, 'swifty_is_sticked' );
                            }
                        }
                        if( scrD.effect === 'parallax0' ) {
                            el.style.backgroundAttachment = 'fixed';
                            // el.style.backgroundPosition = xEl + 'px ' + bpx[ 1 ];
                            // el.style.backgroundSize = wEl + 'px';
                        }
                        if( scrD.effect === 'parallax1' ) {
                            p = 1 - ( yEl + hEl ) / ( hV + hEl );
                            p = 100.0 * ( f * ( p ) + o );
                            el.style.backgroundPosition = bpx[ 0 ] + ' ' + p + '%';
                        }
                        if( ! ( document.documentElement.clientWidth <= 639 ) ) {
                            // Do not move on smaller screens for now. Causes some problems with swipe scroll.
                            if( scrD.effect === 'move' || scrD.effect === 'movefade' ) {
                                var yf = f * 2 * ( ( yEl / hV ) - .5 ) + o;
                                p = f * ( yEl - ( .5 - ( o / 2 ) ) * hV );
                                if( scrD.direction === 'down' ) {
                                    p = -2 * f * ( yEl - ( .5 - ( o / 2 ) ) * hV );
                                }
                                if( scrD.direction === 'left' ) {
                                    p = ( wV - xEl ) * yf;
                                }
                                if( scrD.direction === 'right' ) {
                                    p = -( xEl + wEl ) * yf;
                                }
                                if( scrD.direction === 'up' || scrD.direction === 'left' ) {
                                    if( scrD.motion === 'in' && p < 0 ) {
                                        p = 0;
                                    }
                                    if( scrD.motion === 'out' && p > 0 ) {
                                        p = 0;
                                    }
                                } else {
                                    if( scrD.motion === 'in' && p > 0 ) {
                                        p = 0;
                                    }
                                    if( scrD.motion === 'out' && p < 0 ) {
                                        p = 0;
                                    }
                                }
                                if( scrD.direction === 'down' || scrD.direction === 'up' ) {
                                    el.style.transform = 'translate(0px,' + p + 'px)';
                                } else {
                                    el.style.transform = 'translate(' + p + 'px,0px)';
                                }
                                el.style.zIndex = '999';
                            }
                        }
                        if( scrD.effect === 'fade' || scrD.effect === 'movefade' ) {
                            p = f * ( yEl - ( .5 - ( o / 2 ) ) * hV );
                            p /= hV / 2;
                            if( scrD.motion === 'out' ) {
                                p = - p;
                            }
                            if( scrD.motion === 'both' ) {
                                p = Math.abs( p );
                            } else {
                                if( p < 0 ) {
                                    p = 0;
                                }
                            }
                            if( scrD.reverse === 'reverse' ) {
                                p = 1 - p;
                            }
                            el.style.opacity = Math.min( Math.max( 1 - p, 0 ), 1 );
                        }
                    }
                } catch( e ) {}
            }
        }
    } catch( e ) {}
}

function swifty_resetScrolleffect( tp ) {
    try {
        var els = document.querySelectorAll( '[data-swc_scrolleffect]' );
        for( var i = 0; i < els.length; i++ ) {
            try {
                var el = els[ i ];
                var scrD = el.getAttribute( 'data-swc_scrolleffect' );
                if( typeof scrD === 'string' && scrD.substr( 0, 1 ) === '{' ) {
                    if( tp === 1 ) {
                        el.style.backgroundAttachment = 'scroll';
                        el.style.backgroundPosition = '	0% 0%';
                    }
                    if( tp === 2 ) {
                        el.style.transform = 'translate(0px,0px)';
                        el.style.opacity = 1;
                    }
                }
            } catch( e ) {}
        }
    } catch( e ) {}
}

// Parses a matrix string and returns a 4x4 matrix.

function swifty_parseMatrix( matrixString ) {
    var c = matrixString.split( /\s*[(),]\s*/ ).slice( 1, -1 ),
        matrix;

    if( c.length === 6 ) {
        // 'matrix()' (3x2)
        matrix = {
            m11: +c[ 0 ], m21: +c[ 2 ], m31: 0, m41: +c[ 4 ],
            m12: +c[ 1 ], m22: +c[ 3 ], m32: 0, m42: +c[ 5 ],
            m13: 0, m23: 0, m33: 1, m43: 0,
            m14: 0, m24: 0, m34: 0, m44: 1
        };
    } else if( c.length === 16 ) {
        // matrix3d() (4x4)
        matrix = {
            m11: +c[ 0 ], m21: +c[ 4 ], m31: +c[ 8 ], m41: +c[ 12 ],
            m12: +c[ 1 ], m22: +c[ 5 ], m32: +c[ 9 ], m42: +c[ 13 ],
            m13: +c[ 2 ], m23: +c[ 6 ], m33: +c[ 10 ], m43: +c[ 14 ],
            m14: +c[ 3 ], m24: +c[ 7 ], m34: +c[ 11 ], m44: +c[ 15 ]
        };

    } else {
        // handle 'none' or invalid values.
        matrix = {
            m11: 1, m21: 0, m31: 0, m41: 0,
            m12: 0, m22: 1, m32: 0, m42: 0,
            m13: 0, m23: 0, m33: 1, m43: 0,
            m14: 0, m24: 0, m34: 0, m44: 1
        };
    }
    return matrix;
}

// Try to make text items fit on one line.

function swifty_checkTextItems() {
    try {
        if( ssd_status_onload > 0 ) {
            setTimeout( function() {
                var title = document.querySelectorAll( '.swifty_ssd_item_title' )[ 0 ];
                var slogan = document.querySelectorAll( '.swifty_ssd_item_slogan' )[ 0 ];

                swifty_fitTextElement( title, 'div.swifty_ssd_item_title' );
                swifty_fitTextElement( slogan, 'div.swifty_ssd_item_slogan' );
            }, 1 );
        }
    } catch( e ) {}
}

// Add a style tag to the head

function swifty_addStylesheet( style ) {
    try {
        var el = document.createElement( 'style' );
        el.type = 'text/css';
        document.getElementsByTagName( 'head' )[ 0 ].appendChild( el );
        el.appendChild( document.createTextNode( style ) );
    } catch( e ) {}
}

// Try to fit a text element into the viewport width by reducing the fontsize.

function swifty_fitTextElement( el, sel ) {
    try {
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
    } catch( e ) {}
}

// Get the line-height of an element, or 9999 if no height in px found

function swifty_getLineHeight( el ) {
    try {
        var h = Math.floor( parseFloat( swifty_getStyle( el, 'font-size' ) ) * 1.5 ); // Best guess. Because trying via line-height fails in IE.
        if( h <= 0 ) {
            h = 9999;
        }
        return h;
    } catch( e ) {}
}

// Get an element's applied style property

function swifty_getStyle( el, styleProp )  {
    try {
        var y = null;
        if( el.currentStyle )
            y = el.currentStyle[ styleProp ];
        else if( window.getComputedStyle )
            y = document.defaultView.getComputedStyle( el, null ).getPropertyValue( styleProp );
        return y;
    } catch( e ) {}
}

function swifty_set_breakout( row, breakout, contentBreakout ) {
    try {
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
    } catch( e ) {}
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
    try {
        var breakouts = document.getElementsByClassName( 'swc_breakout' );
        for( var i = 0; i < breakouts.length; i++ ) {
            swifty_set_breakout( breakouts[ i ], 1, swifty_hasClass( breakouts[ i ], 'swc_content_breakout' ) ? 1 : 0 );
        }
    } catch( e ) {}
}

// CSS Lazy load method suggested by Google PageSpeed Insights.
// https://developers.google.com/speed/docs/insights/OptimizeCSSDelivery

function swifty_loadCSS( href ) {
    try {
        var cb = function() {
            var l = document.createElement( 'link' );
            l.rel = 'stylesheet';
            l.href = href;
            var h = document.getElementsByTagName( 'head' )[ 0 ];
            h.parentNode.insertBefore( l, h );
        };
        var raf = null;
        try { raf = requestAnimationFrame || mozRequestAnimationFrame || webkitRequestAnimationFrame || msRequestAnimationFrame; } catch( e ) {}
        if( raf ) raf( cb );
        else window.addEventListener( 'load', cb );
    } catch( e ) {}
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
    try {
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
    } catch( e ) {}
}

function swifty_loadJsHelper( scrpt, index ) {
    try {
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
    } catch( e ) {}
}

function swifty_downloadJSAtOnload() {
    try {
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
            ssd_list_loadJs_done = true;
        }
    } catch( e ) {}
}

function swifty_check_inserts() {
    swifty_check_breakouts();
    swifty_checkImages();
}

function swifty_triggerOnload() {
    ssd_status_onload++;
    swifty_add_exec( { 'status': 'release', 'for': 'page_loaded' } );
    swifty_check_inserts();
    swifty_checkTextItems();
    swifty_downloadJSAtOnload();
}

function swifty_initOnLoadJs() {
    try {
        if( window.addEventListener )
            window.addEventListener( "load", swifty_triggerOnload, false );
        else if( window.attachEvent )
            window.attachEvent( "onload", swifty_triggerOnload );
        else window.onload = swifty_triggerOnload;
    } catch( e ) {}
}

function swifty_addFonts( fonts ) {
    try {
        if( ! ssd_list_loadFont ) {
            ssd_list_loadFont = [];
        }
        var changed = 0;
        for( var i = 0; i < fonts.length; i++ ) {
            var font = fonts[ i ];
            var exists = false;
            for( var j = 0; j < ssd_list_loadFont.length; j++ ) {
                if( ssd_list_loadFont[ j ] === font ) {
                    exists = true;
                }
            }
            if( ! exists ) {
                ssd_list_loadFont.push( font );
                changed++;
            }
        }
        if( changed > 0 ) {
            swifty_loadFonts();
        }
    } catch( e ) {}
}

function swifty_loadFonts() {
    try {
        var ssdWebfonts = {
            google: {
                families: ssd_list_loadFont
            }
        };
        WebFont.load( ssdWebfonts );
    } catch( e ) {}
}

function swifty_wait_loadFonts() {
    // dorh Quit trying after ... seconds
    if( typeof WebFont !== 'undefined' ) {
        if( typeof swifty_ssd_page_styles !== "undefined" ) {
            var st = swifty_ssd_page_styles;
            for( var prop in st ) {
                if( st.hasOwnProperty( prop ) ) {
                    var are = st[ prop ];
                    if( typeof are.used_fonts !== "undefined" ) {
                        swifty_addFonts( are.used_fonts );
                    }
                }
            }
        }
        swifty_loadFonts();
    } else {
        setTimeout( swifty_wait_loadFonts, 50 );
    }
}

function swifty_send_event( element, name ) {
    try {
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
    } catch( e ) {}
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
    try {
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
    } catch( e ) {}
};

try {
    swifty_initOnLoadJs();
    swifty_do_loadCSS();
    swifty_do_loadFont();
    swifty_do_loadJs();
    swifty_do_exec();
    swifty_check_inserts();
    swifty_checkTextItems();
    swifty_fixSideMenu();
    swifty_startScrolleffect();
} catch( e ) {}
