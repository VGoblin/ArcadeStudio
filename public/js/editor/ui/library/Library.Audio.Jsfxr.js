import { UIDiv, UIPanel } from "../components/ui.js";
import { UIAccordion } from "../components/ui.openstudio.js";
import { LibraryComponentBannerButton } from './Library.Component.Buttons.js';
import { LibraryAudioItem } from './Library.Audio.Item.js';

function LibraryAudioJsfxr( editor ) {

    var config = editor.config;
    var strings = editor.strings;
    var signals = editor.signals;
    var assets = editor.assets;

    var container = new UIDiv();
    var items = [];
    var panel = new UIPanel();
    panel.addClass( 'AccordionList' );
    panel.addClass( 'ScriptPanel' );
    panel.setDisplay( 'none' );


    //End

    function buildJsfxCreator( container ) {
    }

    buildJsfxCreator( panel );

    container.add( new LibraryComponentBannerButton( editor, panel, config.getImage( 'gallery/audio/audio-retro-sound-machine.jpeg' ), strings.getKey( 'library/audio/jsfxr' ) ) );
    container.add( panel );

    signals.assetRemoved.add( function ( type, audioId ) {

        if ( type == 'Audio' ) {

            var item = items.find( x => x.item.id == audioId );

            if ( item ) {

                var asset = assets.get( type, 'audioId', audioId );

                if ( !asset ) item.updateAddButton( false );

            }

        }

    } );

    return container;
}

export { LibraryAudioJsfxr };
