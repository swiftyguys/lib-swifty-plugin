<?php

if( ! class_exists( 'SwiftyImageFunctions' ) ) {

    class SwiftyImageFunctions
    {
        /**
         * do we want a swifty-large image size? if so then use it instead of 'large'
         *
         * @var string
         */
        public static $image_size = 'swifty_content';

        // dorh Duplicate code

        public static function get_img_vars( $url, $attach_id = -123 )
        {
            $src_word = 'src';
            $script = '';
            $responsive = '';
            $image_size = SwiftyImageFunctions::$image_size;

            // use swifty responsive solution
            if( get_option( 'ss2_hosting_name' ) === 'AMH' ) {
                $src_word = 'swifty_src';
                if( strpos( $url, 'swifty=1' ) === false ) {
                    $url .= ( parse_url( $url, PHP_URL_QUERY ) ? '&' : '?' ) . 'swifty=1';
                }
                $script = "<script>if( typeof swifty_add_exec === 'function' ) { swifty_add_exec( { 'fn': 'swifty_checkImages' } ); }</script>";
            } else {
                $responsive = SwiftyImageFunctions::responsive_wp( $url );
                if( $image_size !== 'full' ) {
                    if( $attach_id === -123 ) {
                        $attach_id = SwiftyImageFunctions::get_attachment_id_from_url( $url );
                    }
                    if( $attach_id ) {
                        $image_attributes = SwiftyImageFunctions::get_attachment_image_src_wp( $attach_id, $image_size );
                        $url = $image_attributes[ 0 ];
                    }
                }
            }

            return array( $src_word, $url, $script, $responsive );
        }

        public static function get_img_tag( $url, $alt = '', $go_to_url = false, $href = '', $target = '', $viewer = 'nothing' )
        {
            $url_a = $url;
            $image_size = SwiftyImageFunctions::$image_size;

            list( $src_word, $url, $script, $responsive ) = SwiftyImageFunctions::get_img_vars( $url );

            // use swifty responsive solution
            if( get_option( 'ss2_hosting_name' ) === 'AMH' ) {
                $src_word = 'swifty_src';
                if( strpos( $url, 'swifty=1' ) === false ) {
                    $url .= ( parse_url( $url, PHP_URL_QUERY ) ? '&' : '?' ) . 'swifty=1';
                }
                $script = "<script>if( typeof swifty_add_exec === 'function' ) { swifty_add_exec( { 'fn': 'swifty_checkImages' } ); }</script>";
            } else {
                $responsive = SwiftyImageFunctions::responsive_wp( $url );
                if( $image_size !== 'full' ) {
                    $attach_id = SwiftyImageFunctions::get_attachment_id_from_url( $url );
                    if( $attach_id ) {
                        $image_attributes = SwiftyImageFunctions::get_attachment_image_src_wp( $attach_id, $image_size );
                        $url = $image_attributes[ 0 ];
                    }
                }
            }

            if( $viewer === 'nothing' ) {
                return '<img ' . $src_word . '="' . $url . '"' . $responsive . ' alt="' . $alt . '">' . $script;
            }

            $html =
                '<a ' .
                'href="' . ( $go_to_url ? $href : $url_a ) . '" ' .
                'class="swc_image_link" ' .
                ( $go_to_url && $target ? 'target="' . $target . '" ' : '' ) .
                '>' .
                '<img ' . $src_word . '="' . $url . '"' . $responsive . ' alt="' . $alt . '" ' .
                ( $go_to_url ? '' : 'onclick="swcThumbnailClick( this, \'' . $viewer . '\' );return false;"' ) .
                '>' .
                '</a>' . $script;

            if( isset( $atts[ 'caption' ] ) && ! empty( $atts[ 'caption' ] ) ) {
                $html = '<figure class="wp-caption">' . $html . '<figcaption class="wp-caption-text">' . $atts[ 'caption' ] . '</figcaption></figure>';
            }

            return $html;
        }

        /**
         * wrapper around wp_get_attachment_image_src to create the wanted size if not available
         *
         * @param $attachment_id
         * @param string $size
         * @param bool|false $icon
         * @return array|false
         */
        public static function get_attachment_image_src_wp( $attachment_id, $size = 'thumbnail', $icon = false ) {
            $image = wp_get_attachment_image_src( $attachment_id, $size, $icon );

            // we want to use $this->image_size unless image is smaller
            global $content_width;
            if( ! $image || ( ! $image[ 3 ] && ( $content_width <= $image[ 1 ] ) ) ) {

                // so we regenerate the images, this only happens once
                $fullsizepath = get_attached_file( $attachment_id );
                if( $fullsizepath && file_exists( $fullsizepath ) ) {

                    require_once( ABSPATH . 'wp-admin/includes/image.php' );

                    $metadata = wp_generate_attachment_metadata( $attachment_id, $fullsizepath );

                    if( ! is_wp_error( $metadata ) ) {
                        wp_update_attachment_metadata( $attachment_id, $metadata );

                        $image = wp_get_attachment_image_src( $attachment_id, $size, $icon );
                    }
                }
            }
            return $image;
        }

        /**
         * Get wp 4.4 responsive solution, return the srcset and sizes attributes in a string which starts with
         * a space
         *
         * @param $url
         * @return string
         */
        public static function responsive_wp( $url )
        {
            $responsive = '';

            $srcset = false;
            $sizes = false;

            $image_size = SwiftyImageFunctions::$image_size;

            // only for wp 4.4+
            if( isset( $url ) && function_exists( 'wp_calculate_image_srcset' ) ) {
                $attach_id = SwiftyImageFunctions::get_attachment_id_from_url( $url );

                if( $attach_id ) {
                    $image = SwiftyImageFunctions::get_attachment_image_src_wp( $attach_id, $image_size, false );

                    if( $image ) {
                        list( $src, $width, $height ) = $image;

                        $image_meta = wp_get_attachment_metadata( $attach_id );

                        if( is_array( $image_meta ) ) {
                            $size_array = array( absint( $width ), absint( $height ) );
                            // wp_calculate_image_srcset will only return sizes smaller than 1600
                            $srcset = wp_calculate_image_srcset( $size_array, $src, $image_meta, $attach_id );
                            $sizes = wp_calculate_image_sizes( $size_array, $src, $image_meta, $attach_id );
                        }
                    }
                }
            }

            if( $sizes && $srcset ) {
                $responsive = ' srcset="' . esc_attr( $srcset ) . '" sizes="' . esc_attr( $sizes ) . '"';
            }

            return $responsive;
        }

        /**
         * return id from a given attachment url
         *
         * $attachment_url contains the attachment url
         *
         */
        public static function get_attachment_id_from_url( $attachment_url )
        {
            global $wpdb;

            $attachment_id = false;

            // If there is no url, return.
            if( $attachment_url === '' ) {
                return;
            }

            // Get the upload directory paths
            $upload_dir_paths = wp_upload_dir();

            // Make sure the upload path base directory exists in the attachment URL, to verify that we're working with a media library image
            if( strpos( $attachment_url, $upload_dir_paths[ 'baseurl' ] ) !== false ) {
                // If this is the URL of an auto-generated thumbnail, get the URL of the original image
                $attachment_url = preg_replace( '/-\d+x\d+(?=\.(jpg|jpeg|png|gif)$)/i', '', $attachment_url );

                // Remove the upload path base directory from the attachment URL
                $attachment_url = str_replace( $upload_dir_paths[ 'baseurl' ] . '/', '', $attachment_url );

                // Finally, run a custom database query to get the attachment ID from the modified attachment URL
                $attachment_id = $wpdb->get_var(
                    $wpdb->prepare(
                        "SELECT wposts.ID FROM $wpdb->posts wposts, $wpdb->postmeta wpostmeta WHERE wposts.ID = wpostmeta.post_id AND wpostmeta.meta_key = '_wp_attached_file' AND wpostmeta.meta_value = '%s' AND wposts.post_type = 'attachment'",
                        $attachment_url
                    )
                );
            }
            return $attachment_id;
        }

    }
}