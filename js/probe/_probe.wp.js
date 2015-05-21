( function( $, probe ) {
    probe.WP = probe.WP || {};

    $.extend( probe.WP, {

        GetSelMainmenu: function( pluginCode ) {
            return 'li#menu-' + pluginCode;
        },

        GetSelSubmenu: function( submenuText ) {
            return 'a:contains("' + submenuText + '")';
        },

        OpenAllPages: function( input ) {
            return probe.QueueStory(
                'WP.AdminOpenSubmenu',
                {
                    'plugin_code': 'pages',
                    'submenu_text': 'All Pages'   // dojh: translation issue -> All Pages.
                }
            );
        },

        ////////////////////////////////////////

        AdminOpenSubmenu: {
            Start: function( /*input*/ ) {
                // Go to WP admin page
                probe.GotoUrl( '/wp-admin/', 'body.wp-admin' ).next( 'Step2' );
            },

            Step2: function( input ) {
                // Check if the WP menu is collapsed (to one icon) ( happens on small screens )
                $( 'li#wp-admin-bar-menu-toggle' )
                    .IfVisible()
                    .OtherIfNotVisible( 'ul#adminmenu' )
                    .Click();

                // Wait until the submenu becomes visible
                $( 'ul#adminmenu' ).WaitForVisible().next( 'Step3' );
            },

            Step3: function( input ) {
                // Click on the menu item in the left admin bar
                $( probe.WP.GetSelMainmenu( input.plugin_code ) )
                    .MustExist()
                    .Click();

                // Wait until the submenu becomes visible
                $( probe.WP.GetSelSubmenu( input.submenu_text ) ).WaitForFn()
                    .wait( 'Wait4' )
                    .next( 'Step4' );
            },

            Wait4: function( input ) {
                // Trick WP into thinking the mouse hovers over the menu item (so the submenu popup opens)
                // In some cases (WP version, screen size) this hover is needed
                $( probe.WP.GetSelMainmenu( input.plugin_code ) ).AddClass( 'opensub' );

                // Is the submenu item visible?
                var check = $( probe.WP.GetSelSubmenu( input.submenu_text ) ).IsVisible();

                return { 'wait_result': check };
            },

            Step4: function( input ) {
                $( probe.WP.GetSelMainmenu( input.plugin_code ) )
                    .find( probe.WP.GetSelSubmenu( input.submenu_text ) )
                    .last()
                    .MustExist()
                    .Click();
            }
        },

        ////////////////////////////////////////

        DeleteAllPages: {
            Start: function( /*input*/ ) {
                probe.WP.OpenAllPages().next( 'Step2' );
            },

            Step2: function( input ) {
                $( 'h2:contains("Pages ")' ).WaitForVisible().next( 'Step3' );
            },

            Step3: function( input ) {   // dojh: translation issue -> Pages.
                // Click on the checkbox to select all pages
                $( 'span:contains("Title"):first' )   // dojh: translation issue -> Title.
                    .closest( 'th' )
                    .prev( 'th' )
                    .find( 'input' )
                    .MustExistOnce()
                    .Click();

                $( 'select[name="action"]' )
                    .MustExistOnce()
                    .find( 'option:contains("Move to Trash")' )   // dojh: translation issue -> Move to Trash.
                    .prop( 'selected', true );

                // Wait until the checked checkboxes are visible
                //$( 'input[name="post[]"]:checked' ).WaitForVisible().next( function( input ) {
                $( 'input#cb-select-all-1' ).WaitForVisible().next( 'Step4' );
            },

            Step4: function( input ) {
                // Click on the Apply button. There are 3 Apply buttons on the page. We need the second (index 1)
                $( 'input[value="Apply"]:eq(1)' )   // dojh: translation issue -> Apply.
                    .MustExistOnce()
                    .Click();
            }
        },

        ////////////////////////////////////////

        EmptyTrash: {
            trashSel: 'li.trash a',
            deleteAllSel: '#delete_all',

            Start: function( /*input*/ ) {
                probe.WP.OpenAllPages().next( 'Step2' );
            },

            Step2: function( input ) {
                var trashLink = $( 'a:contains("Trash")' );   // dojh: translation issue -> Trash.

                // Click on the 'Trash' link
                if ( trashLink.length ) {
                    trashLink.MustExistOnce().Click();

                    // Wait until the 'Empty Trash' button becomes visible
                    //$( 'a.current:contains("Trash")' ).WaitForVisible( 'Step3' );   // dojh: translation issue -> Trash.
                    $( 'input[value="Empty Trash"]' ).WaitForVisible().next( 'Step3' );
                }
            },

            Step3: function( input ) {;   // dojh: translation issue -> Trash.
                // Click on the 'Empty Trash' button
                $( 'input[value="Empty Trash"]:first' )   // dojh: translation issue -> Empty Trash.
                    .MustExistOnce()
                    .Click();
            }
        }

    } );

    ////////////////////////////////////////

    probe.WP.AdminOpenSubmenuGeneric = {
        Start: function( /*input*/ ) {
            // Check if the WP menu is collapsed (to one icon) ( happens on small screens )
            $( 'li#wp-admin-bar-menu-toggle' )
                .IfVisible()
                .OtherIfNotVisible( 'ul#adminmenu' )
                .Click();

            // Wait until the submenu becomes visible
            $( 'ul#adminmenu' ).WaitForVisible( 'Step2' );
        },

        Step2: function( input ) {
            // Click on the menu item in the left admin bar
            $( this.GetSelMainmenu( input.menu_id ) )
                .MustExist()
                .Click();

            // Wait until the submenu becomes visible
            $( this.GetSelSubmenu( input.submenu_text ) ).WaitForFn( 'Wait2', 'Step3' );
        },

        Wait2: function( input ) {
            // Trick WP into thinking the mouse hovers over the menu item (so the submenu popup opens)
            // In some cases (WP version, screen size) this hover is needed
            $( this.GetSelMainmenu( input.menu_id ) ).AddClass( 'opensub' );

            // Is the submenu item visible?
            var check = $( this.GetSelSubmenu( input.submenu_text ) ).IsVisible();

            return { 'wait_result': check };
        },

        Step3: function( input ) {
            $( this.GetSelMainmenu( input.menu_id ) )
                .find( this.GetSelSubmenu( input.submenu_text ) )
                .last()
                .MustExist()
                .Click();
        },

        /**
         * @return string
         */
        GetSelMainmenu: function( id ) {
            return 'li#' + id;
        },

        /**
         * @return string
         */
        GetSelSubmenu: function( submenuText ) {
            return 'a:contains("' + submenuText + '")';
        }
    };

    ////////////////////////////////////////

    probe.WP.ActivatePlugin = {
        Start: function( input ) { // dorh Not tested
            $( 'a:contains("' + input.s_activate + '")[href*="plugin=' + input.plugin_code + '"]' ).Click();
        }
    };

    probe.WP.NoPagesExist = {
        messageSel: '.no-items',

        Start: function( input ) {
            probe.QueueStory(
                'WP.AdminOpenSubmenu',
                {
                    'plugin_code': 'pages',
                    'submenu_text': 'All Pages'   // dojh: translation issue -> All Pages.
                },
                'Step2'
            );
        },

        Step2: function( /*input*/ ) {
            $( this.messageSel ).WaitForVisible( 'Step3' );
        },

        Step3: function( /*input*/ ) {
            // dojh: translation issue -> No pages found.
            $( this.messageSel + ' td:contains("No pages found")' ).MustExistOnce();
        }
    };

    ////////////////////////////////////////

    probe.WP.XPagesExist = {
        Start: function( input ) {
            probe.QueueStory(
                'WP.AdminOpenSubmenu',
                {
                    'plugin_code': 'pages',
                    'submenu_text': 'All Pages'   // dojh: translation issue -> All Pages.
                },
                'Step2'
            );
        },

        Step2: function( /*input*/ ) {
            $( this.getPageSelector() ).WaitForVisible( 'Step3' );
        },

        Step3: function( input ) {
            $( this.getPageSelector() ).MustExistTimes( input.x_pages );
        },

        getPageSelector: function ( input ) {
            var selector = '.type-page';

            if ( input && typeof input === 'string' ) {
                selector += ':contains("' + input + '")';
            }

            return selector;
        }
    };


    ////////////////////////////////////////

    probe.WP.CreateXDraftPages = {
        addNewSel: 'h2 a:contains("Add New")',   // dojh: translation issue -> Add New.

        Start: function( /*input*/ ) {
            probe.QueueStory(
                'WP.AdminOpenSubmenu',
                {
                    'plugin_code': 'pages',
                    'submenu_text': 'All Pages'   // dojh: translation issue -> All Pages.
                },
                'Step2'
            );
        },

        Step2: function( /*input*/ ) {
            // Wait until the 'Add new' link becomes visible
            $( this.addNewSel ).WaitForVisible( 'Step3', 5000, 1 );
        },

        Step3: function( input ) {
            if ( input.wait_data <= input.x_pages ) {
                // Click on the 'Add new' link
                $( this.addNewSel ).MustExist().Click();

                // dojh: translation issue -> Enter title here.
                $( 'h2:contains("Add New Page")' ).WaitForVisible( 'Step4', 5000, input.wait_data );
            }
        },

        Step4: function( input ) {
            var currentNr = input.wait_data;

            // Enter a value into the post_type input field
            $( 'label:contains("Enter title here")' )   // dojh: translation issue -> Enter title here.
                .next( 'input' )
                .val( 'WP Page ' + currentNr );

            // Click the 'Save Draft' button
            $( 'input[value="Save Draft"]' )   // dojh: translation issue -> Save Draft.
                .MustExist()
                .Click();

            if ( currentNr <= input.x_pages ) {
                currentNr++;

                // Wait until the 'Add new' link becomes visible and proceed to step 3 again.
                $( this.addNewSel ).WaitForVisible( 'Step3', 5000, currentNr );
            }
        }
    };

    ////////////////////////////////////////

} )( jQuery, swiftyProbe );