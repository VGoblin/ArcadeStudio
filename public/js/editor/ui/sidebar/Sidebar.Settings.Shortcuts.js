/**
 * @author TyLindberg / https://github.com/TyLindberg
 */

import { UIText, UIRow, UIInput, UIImage, UIDiv } from '../components/ui.js';

import { RemoveObjectCommand } from '../../commands/RemoveObjectCommand.js';
import { AddObjectCommand } from '../../commands/AddObjectCommand.js';
import { UIAccordion } from '../components/ui.openstudio.js';

var SidebarSettingsShortcuts = function ( editor ) {

	var strings = editor.strings;

	var IS_MAC = navigator.platform.toUpperCase().indexOf( 'MAC' ) >= 0;

	function isValidKeyBinding( key ) {

		return key.match( /^[A-Za-z0-9]$/i ); // Can't use z currently due to undo/redo

	}

	var config = editor.config;
	var signals = editor.signals;

	var container = new UIAccordion();
	container.setTitle( strings.getKey( 'sidebar/settings/shortcuts' ) );

	var shortcuts = {
		'userinterface': [ 'play', 'fullscreen', 'logic', 'library', 'sidebar', 'timeline', 'jsfxraudio', 'aitool', 'helper', 'group', 'snap' ],
		'logicblocks': [ 'copy', 'paste', 'keyboard', 'movecursorup', 'movecursordown', 'select', 'edit', 'new', 'move' ],
		'timeline': [ 'play' ]
	};

	for ( var key in shortcuts ) {

		var titleRow = new UIRow();
		titleRow.setPaddingLeft( '20px' );
		titleRow.setBackground( 'rgba(23, 35, 63, 0.5)' );
		titleRow.add( new UIText( strings.getKey( 'sidebar/settings/shortcuts/' + key ) ) );

		container.addToBody( titleRow );

		for ( var name of shortcuts[ key ] ) {

			var shortcutName = strings.getKey( `sidebar/settings/shortcuts/${key}/${name}` );
			var shortcutConfig = config.getSetting( `settings/shortcuts/${key}/${name}` );
			var shortcutRow = new UIRow();
			shortcutRow.setPaddingLeft( '25px' );
			shortcutRow.add( new UIText( shortcutName ) );

			if ( name == "helper" || name == "group" || name == "copy" || name == "paste" ) {

				shortcutConfig = "ctrl + " + shortcutConfig;
				shortcutRow.add( new UIText( shortcutConfig ) );

			} else if ( name == "movecursorup" || name == "movecursordown" ) {

				shortcutRow.add( new UIImage( config.getImage( 'asset-panel/Engine-icons-video-gallery_icon.svg' ) ).setClass( name ).setWidth( '18px' ) );

			} else if ( name == "keyboard" ) {

				shortcutRow.add( new UIDiv().add(
					new UIText( "shift + " ),
					new UIImage( config.getImage( 'asset-panel/Engine-icons-video-gallery_icon.svg' ) ).setClass( 'movecursorup' ).setWidth( '18px' ),
					new UIImage( config.getImage( 'asset-panel/Engine-icons-video-gallery_icon.svg' ) ).setClass( 'movecursordown' ).setWidth( '18px' )
				) );

			} else if ( name == "select" ) {

				shortcutRow.add( new UIDiv().add(
					new UIImage( config.getImage( 'asset-panel/Engine-icons-video-gallery_icon.svg' ) ).setClass( 'movecursorback' ).setWidth( '18px' ),
					new UIImage( config.getImage( 'asset-panel/Engine-icons-video-gallery_icon.svg' ) ).setWidth( '18px' )
				) );

			} else {

				shortcutRow.add( new UIText( shortcutConfig ) );

			}

			container.addToBody( shortcutRow );

		}

	}
	var isMacCtrlKey = false;
	document.addEventListener( 'keyup', function ( event ) {
		
		isMacCtrlKey = false;

		var key = event.key.toLowerCase();

		if ( event.target && event.target.classList && event.target.classList.contains( 'block-text' ) ) return;

		if ( key == config.getSetting( 'settings/shortcuts/userinterface/play' ) ) {
			return;
		}

		if ( ! editor.isPlaying ) {

			switch ( key ) {
				case ' ':
				{
					if ( document.getElementById( 'aitool' ).style.display !== 'none' ) {
						signals.showBrushPopupToggled.dispatch(false);
	
					}
				}
				break;
			}
		}
				
	});

	document.addEventListener( 'keydown', function ( event ) {

		// event.preventDefault();
		
		if (event.target instanceof HTMLInputElement) return;

		var key = event.key.toLowerCase();

		if (key == "control")
			isMacCtrlKey = true;

		if ( event.target && event.target.classList && event.target.classList.contains( 'block-text' ) ) return;

		if ( key == config.getSetting( 'settings/shortcuts/userinterface/play' ) ) {

			event.preventDefault();
			editor.isPlaying ? signals.stopPlayer.dispatch() : signals.startPlayer.dispatch();
			return;

		}

		if ( ! editor.isPlaying ) {

			switch ( key ) {

				case 'backspace':

					event.preventDefault(); // prevent browser back

					// fall-through

				case 'delete':

					if ( event.target.id !== 'logicblock' ) {

						var object = editor.selected;

						if ( object === null ) return;

						var parent = object.parent;

						if ( parent !== null && !object.userData.isVoxel ) {

							editor.execute( new RemoveObjectCommand( editor, object ) );

						} else {

							signals.voxelsRemoved.dispatch();

						}

					}

					break;

				case config.getSetting( 'settings/shortcuts/undo' ):

					if ( IS_MAC ? event.metaKey : event.ctrlKey ) {

						event.preventDefault(); // Prevent browser specific hotkeys

						if ( event.shiftKey ) {

							editor.redo();

						} else {

							editor.undo();

						}

					} else if ( editor.selected !== null ) {

						//console.log(editor);
						//prevent focusing if viewport camera is locked
						if(editor.viewportCamera && editor.viewportCamera.userData && !editor.viewportCamera.userData.locked){
							editor.focus( editor.selected );
						}


					}

				case config.getSetting( 'settings/shortcuts/userinterface/snap' ):

					if ( event.shiftKey && editor.selected ) {

						editor.snapEnabled = ! editor.snapEnabled;
						signals.snapChanged.dispatch( editor.snapEnabled );

					}

					break;

				case config.getSetting( 'settings/shortcuts/userinterface/logic' ):
					signals.editScript.dispatch( editor.scripts );
					signals.updateWorkspace.dispatch('jsfxraudioHide');
					signals.updateWorkspace.dispatch('aitoolHide');
					signals.updateWorkspace.dispatch('frameHide');
					break;

				case config.getSetting( 'settings/shortcuts/userinterface/jsfxraudio' ):
					signals.updateWorkspace.dispatch( 'jsfxraudio' );
					signals.updateWorkspace.dispatch('scriptHide');
					signals.updateWorkspace.dispatch('frameHide');
					signals.updateWorkspace.dispatch('aitoolHide');
					break;

				case config.getSetting( 'settings/shortcuts/userinterface/aitool' ):
					signals.updateWorkspace.dispatch( 'aitool' );
					signals.updateWorkspace.dispatch('scriptHide');
					signals.updateWorkspace.dispatch('frameHide');
					signals.updateWorkspace.dispatch('jsfxraudioHide');
					break;

				case config.getSetting( 'settings/shortcuts/userinterface/library' ):

					signals.updateWorkspace.dispatch( 'library' );

					break;

				case config.getSetting( 'settings/shortcuts/userinterface/color_picker' ):

					editor.showColorPicker = ! editor.showColorPicker;
					signals.updateWorkspace.dispatch( 'sidebar', true );
					signals.showColorPickerChanged.dispatch( editor.showColorPicker );

					break;

				case config.getSetting( 'settings/shortcuts/userinterface/sidebar' ):

					signals.updateWorkspace.dispatch( 'sidebar' );

					break;

				case config.getSetting( 'settings/shortcuts/userinterface/timeline' ):

					signals.updateWorkspace.dispatch( 'timeline' );

					break;

				case config.getSetting( 'settings/shortcuts/userinterface/fullscreen' ):

					signals.toggleFullscreen.dispatch();

					break;

				case config.getSetting( 'settings/shortcuts/userinterface/group' ):
					event.preventDefault();

					if ( IS_MAC ? isMacCtrlKey : event.ctrlKey ) {

						var mesh = new THREE.Group();
						mesh.name = 'Group';

						editor.execute( new AddObjectCommand( editor, mesh ) );

					}
					break;

				case config.getSetting( 'settings/shortcuts/clone' ):

					if ( event.shiftKey ) {

						var object = editor.selected;

						if ( object == null || object.parent === null ) return; // avoid cloning the camera or scene

						var object2 = object.clone(true);

						object2.position.copy( object.position );
						object2.rotation.order = object.rotation.order;
						object2.quaternion.copy( object.quaternion );
						object2.scale.copy( object.scale );

						editor.execute( new AddObjectCommand( editor, object2 ) );

					}

					break;

				case config.getSetting( 'settings/shortcuts/userinterface/helper' ):

					if ( event.ctrlKey ) {

						editor.showHelpers = ! editor.showHelpers;
						signals.showHelpersChanged.dispatch( editor.showHelpers );

					}

					break;

				case ' ':
					if ( document.getElementById( 'aitool' ).style.display !== 'none' ) {
						signals.showBrushPopupToggled.dispatch(true);

					}
					
					else if ( document.getElementById( 'timeliner' ).style.display !== 'none' ) {

						signals.timelinePlayToggled.dispatch();

					}

					break;

				case 'k':

					signals.timelineKeyframe.dispatch();

					break;

				case config.getSetting( 'settings/shortcuts/aitool/erase' ):

					signals.brushErase.dispatch();

					break;
				
				case config.getSetting( 'settings/shortcuts/aitool/brush' ):

					signals.brushDraw.dispatch();

					break;

				case config.getSetting( 'settings/shortcuts/aitool/move' ):

					signals.brushMove.dispatch();

					break;
			}

		}

	}, false );

	return container;

};

export { SidebarSettingsShortcuts };
