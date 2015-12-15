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
        }

    } );

    ////////////////////////////////////////

    //probe.WP.ActivatePlugin = {
    //    Start: function( input ) { // dorh Not tested
    //        $( 'a:contains("' + input.s_activate + '")[href*="plugin=' + input.plugin_code + '"]' ).Click();
    //    }
    //};

    //probe.WP.NoPagesExist = {
    //    messageSel: '.no-items',
    //
    //    Start: function( input ) {
    //        probe.QueueStory(
    //            'WP.AdminOpenSubmenu',
    //            {
    //                'plugin_code': 'pages',
    //                'submenu_text': 'All Pages'   // dojh: translation issue -> All Pages.
    //            },
    //            'Step2'
    //        );
    //    },
    //
    //    Step2: function( /*input*/ ) {
    //        $( this.messageSel ).WaitForVisible( 'Step3' );
    //    },
    //
    //    Step3: function( /*input*/ ) {
    //        // dojh: translation issue -> No pages found.
    //        $( this.messageSel + ' td:contains("No pages found")' ).MustExistOnce();
    //    }
    //};

    ////////////////////////////////////////

    //probe.WP.XPagesExist = {
    //    Start: function( input ) {
    //        probe.QueueStory(
    //            'WP.AdminOpenSubmenu',
    //            {
    //                'plugin_code': 'pages',
    //                'submenu_text': 'All Pages'   // dojh: translation issue -> All Pages.
    //            },
    //            'Step2'
    //        );
    //    },
    //
    //    Step2: function( /*input*/ ) {
    //        $( this.getPageSelector() ).WaitForVisible( 'Step3' );
    //    },
    //
    //    Step3: function( input ) {
    //        $( this.getPageSelector() ).MustExistTimes( input.x_pages );
    //    },
    //
    //    getPageSelector: function ( input ) {
    //        var selector = '.type-page';
    //
    //        if ( input && typeof input === 'string' ) {
    //            selector += ':contains("' + input + '")';
    //        }
    //
    //        return selector;
    //    }
    //};

    ////////////////////////////////////////

    //probe.WP.AddPage = {
    //    addNewSel: 'h2 a:contains("Add New")',   // dojh: translation issue -> Add New.
    //
    //    Start: function( input ) {
    //        probe.WP.OpenAllPages().next( 'Step2' );
    //    },
    //
    //    Step2: function( /*input*/ ) {
    //        // Wait until the 'Add new' link becomes visible
    //        $( this.addNewSel ).WaitForVisible( 'Step3' );
    //    },
    //
    //    Step3: function( /*input*/ ) {
    //        // Click on the 'Add new' link
    //        $( this.addNewSel ).MustExist().Click();
    //
    //        // dojh: translation issue -> Enter title here.
    //        $( 'h2:contains("Add New Page")' ).WaitForVisible( '' );
    //    }
    //};

    ////////////////////////////////////////

    probe.RegisterTry(
        'I click on WP admin -> Pages -> Swifty Page Manager',
        'WP.AdminOpenSubmenu', {
            'plugin_code': 'pages',
            'submenu_text': 'Swifty Page Manager'
        }
    );

    ////////////////////////////////////////

    probe.RegisterTry(
        'I delete all pages via WP', {
            Start: function( /*input*/ ) {
                probe.WP.OpenAllPages().next( 'Step2' );
            },

            Step2: function( /*input*/ ) {
                $( 'h1:contains("Pages"), h2:contains("Pages ")' ).WaitForVisible().next( 'Step3' );
            },

            Step3: function( input ) {   // dojh: translation issue -> Pages.
                if( $( 'td:contains("No pages found.")' ).length > 0 ) {
                    // There are no pages. No need tot try to delete them.
                } else {
                    // Click on the checkbox to select all pages
                    $( 'span:contains("Title"):first' )   // dojh: translation issue -> Title.
                        .closest( 'th' )
                        .prev( /*'th'*/ )
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
                }
            },

            Step4: function( input ) {
                // Click on the Apply button. There are 3 Apply buttons on the page. We need the second (index 1)
                $( 'input[value="Apply"]:eq(1)' )   // dojh: translation issue -> Apply.
                    .MustExistOnce()
                    .Click();
            }
        }
    );

    ////////////////////////////////////////

    probe.RegisterTry(
        'I empty the trash via WP', {
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
    );

    ////////////////////////////////////////

    probe.RegisterTry(
        /I create (\d+) test pages via WP/, {
            addNewSel: 'h1 a:contains("Add New"), h2 a:contains("Add New")',   // dojh: translation issue -> Add New.

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
                    $( 'h1:contains("Add New Page"), h2:contains("Add New Page")' ).WaitForVisible( 'Step4', 5000, input.wait_data );
                }
            },

            Step4: function( input ) {
                var currentNr = input.wait_data;

                // Enter a value into the post_type input field
                $( 'label:contains("Enter title here")' )   // dojh: translation issue -> Enter title here.
                    .next( 'input' )
                    .val( 'WP Page ' + currentNr );

                // Click the 'Publish' button
                $( 'input#publish' )   // dojh: translation issue -> Save Draft.
                    .MustExist()
                    .Click();

                if ( currentNr <= input.x_pages ) {
                    currentNr++;

                    // Wait until the 'Add new' link becomes visible and proceed to step 3 again.
                    $( this.addNewSel ).WaitForVisible( 'Step3', 5000, currentNr );
                }
            }
        }, {
            'x_pages': '{{match 0}}'
        }
    );

    ////////////////////////////////////////

    probe.RegisterTry(
        /I edit a page via WP WITH PARAMS (.*)/, {
            Start: function( /*input*/ ) {
                $( 'h1:contains("Edit Page"), h2:contains("Edit Page")' ).WaitForVisible( 'Step2' );   // dojh: translation issue -> Edit Page.
            },

            Step2: function( input ) {
                var dfds = probe.NewDfds();

                dfds.add( probe.Utils.setValues( input.values ) );

                probe.WaitForDfds( dfds, 'Step3', 60000 );
            },

            Step3: function( input ) {
                $( 'input[value="Save Draft"], input[value="Publish"]' )   // dojh: translation issue -> Save Draft.
                    .IfVisible()
                    .Click();
            }
        }, {
            'values': '{{match 0}}'
        }
    );

    ////////////////////////////////////////

    probe.RegisterTry(
        'I go to edit the theme via WP', {
            Start: function( /*input*/ ) {
                probe.GotoUrl( '/wp-admin/customize.php?theme=swifty-site-designer', 'body.wp-customizer' ).next( '' );
            }
        }
    );

    ////////////////////////////////////////

    probe.RegisterTry(
        'I am in WP mode', {
            Start: function( /*input*/ ) {
                probe.GotoUrl( '/', '#sm-admin-bar-wp-logo' ).next( 'Step2' );
            },

            Step2: function( /*input*/ ) {
                $( '#sm-admin-bar-wp-logo a' )
                    .IfVisible()
                    .Click();

                $( '#wp-admin-bar-swifty' ).WaitForVisible( '' );
            }
        }
    );

} )( jQuery, swiftyProbe );