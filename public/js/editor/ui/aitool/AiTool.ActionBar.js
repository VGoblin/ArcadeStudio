/**
 * @author mrdoob / http://mrdoob.com/
 */

import { UIDiv, UIImage, UIText } from '../components/ui.js';

var AiToolActionBar = function ( editor ) {

    var api = editor.api;
    var config = editor.config;
    var signals = editor.signals;

    var iconButtons = {};
    var container = new UIDiv();
    container.setClass( 'title-bar  align-right' ).setPadding('0');

    var title = new UIText("sent to recent folder.");
    title.setClass("toast");
    title.dom.style.display = 'none';
    container.add(title);

    var menuIcons = new UIDiv();
    menuIcons.setClass( 'menu-icons' );
    menuIcons.dom.style.marginRight = "8px";

    var icons = [ /*'brush+filter', */'image+export', 'canvas+save' ];
    icons.map( icon => {
        var iconButton = new UIDiv();
        iconButton.setClass( 'icon-link ' + icon );
        // iconButton.add( new UIImage( config.getImage( `engine-ui/Jsfxr-audio-tool/${icon}.svg` ) ).setWidth( '23px' ) );
        
        if(icon == 'canvas+save') {
            iconButton.setClass( 'icon-link ' + icon );
            iconButton.add( new UIImage( config.getImage( `engine-ui/publish.svg` ) ).setWidth( '16px' ) );
            iconButton.onClick( function () {
                signals.saveAiImage.dispatch(true);
            });
        }
        else
        if(icon == 'image+export') {
            iconButton.setClass( 'icon-link ' + icon );
            iconButton.add( new UIImage( config.getImage( `engine-ui/image-generation-tool/tool-export+to+user+library.svg` ) ).setWidth( '16px' ) );
            iconButton.onClick( function () {
                signals.saveAiImage.dispatch(false);
            });
        }
        else
            iconButton.setClass( "d-flex align-items-center justify-content-center " + icon );

        // if(icon == 'brush+filter') {
        //     iconButton.add( new UIText("Filter").setWidth( '96px') );
        //     iconButton.onClick( function () {
        //         signals.showFilterPopupToggled.dispatch();
        //     });
        // }

        menuIcons.add( iconButton );
        iconButtons[ icon ] = iconButton;

    } );
        
    container.add( menuIcons );

    return container;

};

export { AiToolActionBar };
