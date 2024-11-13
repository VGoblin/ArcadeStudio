import { UIDiv, UIImage, UIText } from '../components/ui.js';
import { LibraryBaseFolderItem } from './Library.Base.Folder.Item.js';

function LibraryAudioFolderItem( editor, folderId, asset ) {

	LibraryBaseFolderItem.call( this, folderId, asset );

	var scope = this;
	var config = editor.config;
	var api = editor.api;
	var signals = editor.signals;
	scope.menu.hideOption('addScene');
	scope.container.addClass( 'Row' );
	scope.container.addClass( 'FolderItem' );

	scope.audioName = new UIDiv().setClass('AudioName');
	scope.container.add( scope.audioName );

    scope.loadingSpinner.removeClass( 'w-lightbox-spinner' );
    scope.loadingSpinner.addClass( 'spinner' );
	scope.loadingSpinner.setMarginRight('15px');
    scope.loadingSpinner.delete();

	scope.playIcon = new UIDiv();
	scope.playIcon.add( new UIImage( /*config.getImage( 'engine-ui/play-icon.svg' )*/"https://assets.website-files.com/616a041ea72c58e139ed3c8e/616a041ea72c582627ed3cb0_iconfinder-icon%20(3).svg" ).setWidth( '9px' ) );
	scope.playIcon.setMarginRight( '15px' );
	scope.playIcon.onClick( function ( e ) {

		e.preventDefault();
		e.stopPropagation();

		asset.play().source.addEventListener( 'ended', function () {

			scope.updateButtons( false );

		} );

		scope.updateButtons( true );

		signals.audioPlay.dispatch( asset, scope.updateButtons );

	} );

    scope.stopIcon = new UIDiv();
    scope.stopIcon.setClass( 'StopButton' );
    scope.stopIcon.setMarginRight( '15px' );
    scope.stopIcon.onClick( function ( e ) {

		e.preventDefault();
		e.stopPropagation();

		asset.stop();

		scope.updateButtons( false );

		signals.audioStop.dispatch();

	} );

    scope.updateButtons = function ( play ) {

        scope.playIcon.setDisplay( play ? 'none' : '' );
        scope.stopIcon.setDisplay( play ? '' : 'none' );

	};

	scope.audioName.add( scope.loadingSpinner );
	scope.audioName.add( scope.playIcon );
	scope.audioName.add( scope.stopIcon );
	scope.audioName.add( new UIText( asset.name ) );

	scope.audioDuration = new UIText( UtilsHelper.getDurationString( asset.duration ) ).setClass( 'Duration' );
	scope.container.add( scope.audioDuration );

	

	scope.menu.onDelete( function () {

			if(window.subscriptionSet){

				api.post( '/asset/my-audio/delete', { id: asset.id } ).then( function () {

					editor.removeAsset( 'Audio', asset.id );

					scope.container.delete();

				} ).catch( (err) => {

					alert( err );

				} );
				scope.menu.container.setDisplay('none');
			}else{
				$('#pro-popup').css("display", "flex").hide().fadeIn();
				scope.menu.container.setDisplay('none');
			}

	} );

	scope.menu.onDuplicate( function () {

		scope.setLoading( true );

		api.post( '/asset/my-audio/add', { id: asset.audioId, projectId: editor.projectId, folderId } ).then( function ( audio ) {

			editor.addAsset( 'Audio', folderId, audio ).then( function ( asset ) {

				scope.setLoading( false );

				signals.audioAssetAdded.dispatch( asset, folderId );

			} );

		} ).catch( (err) => {

			alert( err );

		} );
		
	} );

	scope.menu.onDownload(function(){
		if(window.subscriptionSet){
			downloadImage(asset.url, asset.name);
			scope.menu.container.setDisplay('none');
		}else{
			$('#pro-popup').css("display", "flex").hide().fadeIn();
			scope.menu.container.setDisplay('none');
		}
	})

	

	function downloadImage(url, filename) {
		var xhr = new XMLHttpRequest();
		xhr.responseType = 'blob';
		xhr.onload = function() {
		  var a = document.createElement('a');
		  a.download = filename;
		  a.href = window.URL.createObjectURL(xhr.response);
		  document.body.appendChild(a);
		  a.click();
		};
		xhr.open('GET', url);
		xhr.send();
	  }

    scope.updateButtons( false );

    scope.setLoading = function ( loading ) {

        scope.playIcon.setDisplay( loading ? 'none' : '' );
        scope.stopIcon.setDisplay( 'none' );
		scope.loadingSpinner.setDisplay( loading ? 'flex' : 'none' );

    };

	return this;

}

LibraryAudioFolderItem.prototype = Object.create( LibraryBaseFolderItem.prototype );
LibraryAudioFolderItem.prototype.constructor = LibraryAudioFolderItem;

export { LibraryAudioFolderItem };
