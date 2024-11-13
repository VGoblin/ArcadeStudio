import { UIPanel } from './components/ui.js';
import { APP } from '../libs/app.js';

function Player( editor ) {

	var assets = editor.assets;
	var signals = editor.signals;

	var container = new UIPanel();
	container.setId( 'player' );
	container.setPosition( 'absolute' );
	container.setDisplay( 'none' );
	container.setWidth('100%');
	container.setHeight('100%');

	//

	var player = new APP.Player( assets );
	container.dom.appendChild( player.dom );

	window.addEventListener( 'resize', function () {

		player.setSize( container.dom.clientWidth, container.dom.clientHeight );

	} );

	signals.startPlayer.add( function () {


		if ( editor.isScripting ) {

			signals.saveScript.dispatch();

		}

		editor.isPlaying = true;
		container.setDisplay( '' );

		var editor_toJSON = editor.toJSON();
		console.log("player: ",editor_toJSON);
		player.load( editor_toJSON );
		player.autostart = editor_toJSON.autostart;
		player.animationSpeed = editor_toJSON.animationSpeed;
		player.animationWeight = editor_toJSON.animationWeight;
		player.setSize( container.dom.clientWidth, container.dom.clientHeight );
		player.play();

		window.myplayer = player;


		//try to start animation here;

		for(var i in player.actions){
			for(var j in player.actions[i]){
				if(player.autostart && player.autostart[i]){
					if(player.autostart[i][j]){
						player.actions[ i ][ j ].play();
						player.actions[i][j].setEffectiveTimeScale(player?.animationSpeed[i] ? (player.animationSpeed[i][j] ?? 1) : 1);
						player.actions[i][j].setEffectiveWeight(player?.animationWeight[i] ? (player.animationWeight[i][j] ?? 1) : 1);
					}
				}
			}
		}

	} );

	signals.stopPlayer.add( function () {

		editor.isPlaying = false;
		container.setDisplay( 'none' );

		player.stop();
		player.dispose();

		if(player.stopAudioOnExit){
			for(var id in player.stopAudioOnExit){
				if(player.stopAudioOnExit[id].isPlaying){
					player.stopAudioOnExit[id].stop();
				}
			}
		}
	} );

	return container;

}

export { Player };
