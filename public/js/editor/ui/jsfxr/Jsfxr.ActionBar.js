/**
 * @author mrdoob / http://mrdoob.com/
 */

import { UIDiv, UIImage, UIText } from '../components/ui.js';

var JsfxrActionBar = function ( editor ) {

    var api = editor.api;
    var config = editor.config;
    var signals = editor.signals;

    var iconButtons = {};
    var container = new UIDiv();
    container.setClass( 'title-bar align-right' ).setPadding('0');

    var title = new UIText("sent to recent folder");
    title.setClass("toast");
    title.dom.style.display = 'none';
    container.add(title);

    var menuIcons = new UIDiv();
    menuIcons.setClass( 'menu-icons' );

    var icons = [ 'audio-play-sound', 'audio-mutate', 'export+to+user+library' ];
    icons.map( icon => {
        var iconButton = new UIDiv();
        iconButton.setClass( 'icon-link ' );
        if(icon == 'audio-mutate') {
            iconButton.setClass('icon-link right-spacing');
        }
        var image = new UIImage(config.getImage(`engine-ui/Jsfxr-audio-tool/${icon}.svg`));
        if (icon == 'export+to+user+library') {
          image.setWidth('18px'); // Change the width of the export button
        } else {
          image.setWidth('23px');
        }        
        iconButton.add(image);

        if(icon == 'audio-play-sound') {
            iconButton.onClick( function () {
                // signals.sidebarTabChanged.dispatch(icon);
                signals.playJsfxrAudio.dispatch();
                // updateIconButton(icon);
            });
        }else if(icon == 'audio-mutate') {
            iconButton.onClick( function () {
                // signals.sidebarTabChanged.dispatch( icon );
                signals.mutateJsfxrAudio.dispatch();
                // updateIconButton( icon );
            });
        } else {
            iconButton.onClick( function () {
                // signals.sidebarTabChanged.dispatch( icon );
                signals.saveJsfxrAudio.dispatch();
                // updateIconButton( icon );
            });
        }

        menuIcons.add( iconButton );
        iconButtons[ icon ] = iconButton;

    } );

    container.add( menuIcons );

    // updateIconButton( 'play-btn' );

    // function updateIconButton( selected ) {
    //
    //     for ( var id in iconButtons ) {
    //
    //         iconButtons[id].removeClass( 'selected' );
    //
    //     }
    //
    //     iconButtons[ selected ].addClass( 'selected' );
    //
    // }

    return container;

};

export { JsfxrActionBar };
