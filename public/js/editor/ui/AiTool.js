import { UIElement, UIPanel, UIText, UIDiv } from './components/ui.js';
import { UIStyledTabs } from './components/ui.openstudio.js';
import { v4 as uuid } from 'uuid';

import { AddScriptCommand } from '../commands/AddScriptCommand.js';
import { RemoveScriptCommand } from '../commands/RemoveScriptCommand.js';
import { SetScriptValueCommand } from '../commands/SetScriptValueCommand.js';
import { SetMaterialValueCommand } from '../commands/SetMaterialValueCommand.js';
import isWholeObjectAtGivenPosition from './utils/isWholeObjectAtGivenPosition';

import { AiToolActionBar } from './aitool/AiTool.ActionBar.js';
import { AiToolControlBar } from './aitool/AiTool.ControlBar.js';
import { AiToolDrawPanel } from './aitool/AiTool.DrawPanel.js';

function AiTool( editor ) {

    var signals = editor.signals;
    var config = editor.config;

    var container = new UIPanel();
    container.setId( 'aitool' );
    container.setDisplay( 'none' );


    var header = new UIDiv();
    var titleBar = new AiToolActionBar( editor );
    header.setClass('script-top-bar');
    header.add(titleBar);

    container.add( header );

    var renderer;

    signals.rendererChanged.add( function ( newRenderer ) {

        renderer = newRenderer;

    } );
    // tern js autocomplete


    var div = new UIDiv();
    div.setClass( 'script-editor' );

    var logicBlock = new UIPanel().setPadding('0').setBackgroundColor("#000");

    var drawPanelUI = new AiToolDrawPanel(editor);
    drawPanelUI.setClass( 'drawPanel');
    drawPanelUI.setId('drawPanel');


    logicBlock.setId( 'logicblock' ).setStyle( 'flex-direction', ['row-reverse']).setStyle('overflow', ['hidden']);

    var controller = new AiToolControlBar(editor);
    logicBlock.add(controller);
    logicBlock.add(drawPanelUI);

    var saveWrapperDiv = new UIDiv();
    saveWrapperDiv.setClass("save-wrapper");
    saveWrapperDiv.dom.style.display = 'none';

    var savingDiv = new UIDiv();
    savingDiv.setClass("saving");
    saveWrapperDiv.add(savingDiv);

    let saveul = document.createElement('ul');
    for (var i = 0; i <  25; i ++)
    {
        let saveli = document.createElement('li');
        saveul.appendChild(saveli);
    }
    savingDiv.dom.appendChild(saveul);
    let savetext = document.createElement("p");
    savetext.className = "wrapper-text";
    savingDiv.dom.appendChild(savetext);
    logicBlock.add(saveWrapperDiv);


    div.add( logicBlock );
    container.add( div );

    signals.showWrapper.add( function ( text ) {

        // saveWrapperDiv.dom.style.display = '';
        // savetext.innerHTML = text;

    } );

    signals.hideWrapper.add( function ( ) {

        saveWrapperDiv.dom.style.display = 'none';

    } );

    $('.Panel img').mousedown(function (e) {
        if(e.button == 2) { // right click
            return false; // do nothing!
        }
    });
    return container;

}

export { AiTool };
