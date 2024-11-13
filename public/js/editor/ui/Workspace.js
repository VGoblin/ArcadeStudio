import { UIDiv, UIPanel } from './components/ui.js';

import { Script }   from "./Script.js";
import { Library }  from "./Library.js";
import { Sidebar }  from "./Sidebar.js";
import { Timeline } from "./Timeline.js";
import { JsfxrAudio }    from "./Audio.js";
import { AiTool } from './AiTool.js';
import { Frame } from './Frame.js';

var Workspace = function ( editor ) {

    var myInterval = 0;
	var config = editor.config;
	var signals = editor.signals;

	var container = new UIPanel();
    container.setId( 'workspace' );
    container.dom.style.display = "flex";
    container.dom.style.flexDirection = "row";

    var otherPanels = new UIDiv();
    otherPanels.addClass("flex-1");
    otherPanels.dom.style.pointerEvents = 'none';
    otherPanels.dom.style.height = "100vh";
    otherPanels.dom.style.position = "relative";
    container.add( otherPanels );

    $(".popupterms-wrapper").appendTo(otherPanels.dom);
    $(".popuplearn-wrapper").appendTo(otherPanels.dom);

    var script = new Script( editor );
    otherPanels.add( script );

    var jsfxraudio = new JsfxrAudio( editor );
    otherPanels.add( jsfxraudio );

    var aitool = new AiTool( editor );
    otherPanels.add(aitool);

    var frame = new Frame( editor );
    otherPanels.add(frame);

    var sidebar = new Sidebar( editor );
    otherPanels.add( sidebar );

    var timeline = new Timeline( editor );
    otherPanels.dom.appendChild( timeline );

    var library = new Library( editor );
    container.add( library );

    signals.updateWorkspace.add( function ( element, open ) {

        var libraryDispaly = library.dom.style.display;
        var sidebarDispaly = sidebar.dom.style.display;
        var timelineDispaly = timeline.style.display;
        var jsfxraudioDispaly =jsfxraudio.dom.style.display;
        var aitoolDisplay = aitool.dom.style.display;
        var frameDisplay = frame.dom.style.display;
        var scriptDispaly = script.dom.style.display;


        if ( element == 'library' ) {

            if ( ! ( open && libraryDispaly == '' ) ) {

                // library.setDisplay( libraryDispaly == 'none' ? '' : 'none' );
                if (library.dom.className.indexOf("opened") != -1) {
                    library.removeClass('opened');
                    library.addClass('closed');
                }
                else {
                    library.addClass('opened');
                    library.removeClass('closed');
                }
                // libraryDispaly = library.dom.style.display;
                window.dispatchEvent(new Event('resize'));

            }

        } else if ( element == 'sidebar' ) {

            if ( ! ( open && sidebarDispaly == '' ) ) {

                sidebar.setDisplay( sidebarDispaly == 'none' ? '' : 'none' );
                sidebarDispaly = sidebar.dom.style.display;
                window.dispatchEvent(new Event('resize'));

            }

        } else if ( element == 'timeline' ) {

            timeline.style.display = ( timelineDispaly == 'none' ? '' : 'none' );
            timelineDispaly = timeline.style.display;
            window.dispatchEvent(new Event('resize'));

        } else if ( element == 'jsfxraudio' ) {

            if ( ! ( open && jsfxraudioDispaly == '' ) ) {
                console.log(element, jsfxraudioDispaly, 'HERE');
                jsfxraudio.setDisplay( jsfxraudioDispaly == 'none' ? '' : 'none' );
                jsfxraudioDispaly = jsfxraudio.dom.style.display;
                window.dispatchEvent(new Event('resize'));

            }

        } else if ( element == 'aitool' ) {
            if ( ! ( open && aitoolDisplay == '' ) ) {
                
                console.log(element, aitoolDisplay, 'HERE');
                
                aitool.setDisplay( aitoolDisplay == 'none' ? '' : 'none' );
                window.dispatchEvent(new Event('resize'));
                aitoolDisplay = aitool.dom.style.display;

                if (aitool.dom.style.display == 'none')
                {
                    clearInterval(myInterval);
                    signals.saveAiLayer.dispatch();
                }
                else
                {
                    myInterval = setInterval(()=> {
                        signals.saveAiLayer.dispatch();
                    }, 60000);
                }
            }

        } else if ( element == 'frame' ) {
            if ( ! ( open && frameDisplay == '' ) ) {
                
                frame.setDisplay( frameDisplay == 'none' ? '' : 'none' );
                window.dispatchEvent(new Event('resize'));
                frameDisplay = frame.dom.style.display;

                if (frame.dom.style.display == 'none')
                {
                }
                else
                {
                    sidebar.setDisplay( 'none' );
                    sidebarDispaly = sidebar.dom.style.display;
                    
                    timeline.style.display = ( 'none' );
                    timelineDispaly = timeline.style.display;
                }
            }

        } else if ( element == 'jsfxraudioHide' ) {
            jsfxraudio.setDisplay( 'none' );
            jsfxraudioDispaly = jsfxraudio.dom.style.display;
        } else if ( element == 'aitoolHide' ) {
            aitool.setDisplay( 'none' );
            aitoolDisplay = aitool.dom.style.display;
        } else if ( element == 'scriptHide' ) {
            script.setDisplay( 'none' );
            scriptDispaly = script.dom.style.display;
            editor.isScripting = false;
        } else if ( element == 'frameHide' ) {
            frame.setDisplay( 'none' );
            frameDisplay = frame.dom.style.display;
        }
        
        var bottom = timelineDispaly != 'none' ? '270px' : '10px';
        var scriptRight = ( sidebarDispaly != 'none' ? '260px' : '0px' );

        jsfxraudio.setRight(scriptRight);
        jsfxraudio.setBottom(bottom);
        script.setRight( scriptRight );
        script.setBottom( bottom );
        aitool.setRight(scriptRight);
        aitool.setBottom(bottom);
        sidebar.setBottom( bottom );
        //library.setBottom( bottom );

        frame.setRight(scriptRight);
        frame.setBottom( bottom );

        window.dispatchEvent(new Event('resize'));
    } );
    
	return container;

};

export { Workspace };
