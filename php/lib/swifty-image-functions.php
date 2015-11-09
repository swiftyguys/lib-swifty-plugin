<?php

if( ! class_exists( 'SwiftyImageFunctions' ) ) {

    class SwiftyImageFunctions
    {

        public static function get_img_tag( $url, $alt = '' )
        {
            $src_word = 'src';
            $responsive = '';

            $html = '<img ' . $src_word . '="' . $url . '"' . $responsive . ' alt="' . $alt . '" ' .
//                    ( $go_to_url ? '' : 'onclick="swcThumbnailClick( this, \'' . $atts[ 'viewer' ] . '\' );return false;"' ) .
                '>';

            return $html;
        }
    }
}