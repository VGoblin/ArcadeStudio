import { UIDiv, UIPanel } from "../components/ui.js";
import { UIAccordion } from "../components/ui.openstudio.js";
import { LibraryComponentBannerButton } from './Library.Component.Buttons.js';

function LibraryImageAiTool( editor ) {

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

    container.add( new LibraryComponentBannerButton( editor, panel, config.getImage( 'gallery/images/tool-openAI-image-generator.png' ), strings.getKey( 'library/images/aitool' ) ) );
    container.add( panel );

    signals.assetRemoved.add( function ( type, imageId ) {

        if ( type == 'Image' ) {

            var item = items.find( x => x.item.id == imageId );

            if ( item ) {

                var asset = assets.get( type, 'imageId', imageId );

                if ( !asset ) item.updateAddButton( false );

            }

        }

    } );

    return container;
}

export { LibraryImageAiTool };
