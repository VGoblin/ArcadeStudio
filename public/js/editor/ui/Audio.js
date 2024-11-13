import { UIElement, UIPanel, UIText, UIDiv } from './components/ui.js';
import { UIStyledTabs } from './components/ui.openstudio.js';
import { v4 as uuid } from 'uuid';

import { AddScriptCommand } from '../commands/AddScriptCommand.js';
import { RemoveScriptCommand } from '../commands/RemoveScriptCommand.js';
import { SetScriptValueCommand } from '../commands/SetScriptValueCommand.js';
import { SetMaterialValueCommand } from '../commands/SetMaterialValueCommand.js';
import isWholeObjectAtGivenPosition from './utils/isWholeObjectAtGivenPosition';

import { JsfxrActionBar } from './jsfxr/Jsfxr.ActionBar.js';
import { JsfxrControlBar } from './jsfxr/Jsfxr.ControlBar.js';

import {  initialize } from '../../lib/spectrogram/spectrogram.js';

function JsfxrAudio( editor ) {

    var signals = editor.signals;
    var config = editor.config;

    var container = new UIPanel();
    container.setId( 'jsfxraudio' );
    container.setDisplay( 'none' );


    var header = new UIDiv();
    var titleBar = new JsfxrActionBar( editor );
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

    var spectrogramUI = new UIDiv();
    spectrogramUI.setClass( 'spectrogram');
    spectrogramUI.setId('Spectrogram');


    logicBlock.setId( 'logicblock' ).setStyle( 'flex-direction', ['row-reverse']);

    var controller = new JsfxrControlBar(editor);
    logicBlock.add(controller);
    logicBlock.add(spectrogramUI);

    div.add( logicBlock );
    container.add( div );

    initialize(spectrogramUI, container);
    return container;

}

export { JsfxrAudio };
