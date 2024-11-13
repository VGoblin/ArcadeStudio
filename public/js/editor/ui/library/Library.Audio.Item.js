import { UIDiv, UIImage, UIText } from "../components/ui.js";
import { LibraryBaseItem } from "./Library.Base.Item.js";

function LibraryAudioItem( editor, item ) {

    LibraryBaseItem.call( this, item );

    var scope = this;
	var api = editor.api;
	var config = editor.config;
    var signals = editor.signals;
    var assets = editor.assets;
    var audio = null;
    scope.menu.hideOption('addScene');
    scope.container.setClass( 'Row' );

    scope.audioName = new UIDiv().setClass( 'AudioName' );
    scope.container.add( scope.audioName );
	scope.container.addClass('Audio'+item.id);
	
    scope.loadingSpinner.removeClass( 'w-lightbox-spinner' );
    scope.loadingSpinner.addClass( 'spinner' );
    scope.loadingSpinner.setMarginRight( '15px' );
    scope.loadingSpinner.delete();

    scope.playIcon = new UIDiv();
    scope.playIcon.add( new UIImage( /*config.getImage( 'engine-ui/play-icon.svg' )*/"https://assets.website-files.com/616a041ea72c58e139ed3c8e/616a041ea72c582627ed3cb0_iconfinder-icon%20(3).svg" ).setWidth( '9px' ) );
    scope.playIcon.setMarginRight( '15px' );
    scope.playIcon.onClick( function ( e ) {

		e.preventDefault();
        e.stopPropagation();

        audio = new Audio( item.url );
        audio.addEventListener( 'canplaythrough', function () {

            audio.play();

        } );
        audio.addEventListener( 'ended', function () {

            scope.updateButtons( false );

        } );

        scope.updateButtons( true );

		signals.audioPlay.dispatch( audio, scope.updateButtons );

    } );

    scope.stopIcon = new UIDiv();
    scope.stopIcon.setClass( 'StopButton' );
    scope.stopIcon.setMarginRight( '15px' );
    scope.stopIcon.onClick( function ( e ) {

		e.preventDefault();
        e.stopPropagation();

        audio.pause();

        scope.updateButtons( false );

        signals.audioStop.dispatch( audio, scope.updateButtons );

    } );

    scope.updateButtons = function ( play ) {

        scope.playIcon.setDisplay( play ? 'none' : '' );
        scope.stopIcon.setDisplay( play ? '' : 'none' );

    };

    scope.audioName.add( scope.loadingSpinner );
    scope.audioName.add( scope.playIcon );
    scope.audioName.add( scope.stopIcon );
    scope.audioName.add( new UIText( item.name ) );

    scope.audioDuration = new UIText( UtilsHelper.getDurationString( item.duration ) ).setClass( 'Duration' );
 
	scope.addedToProjectIcon.addClass( 'Audio' );
    scope.addToProjectButton.addClass( 'Audio' );

    scope.container.add( scope.audioDuration );
    
	scope.container.onClick( function ( e ) {

	// Only execute this function when the Shift key is held down
	if (e.shiftKey) {
        if ( !scope.status ) {

            scope.setLoading( true );

            api.post( '/asset/my-audio/add', { id: item.id, projectId: editor.projectId, folderId: 0 } ).then( function ( audio ) {

                editor.addAsset( 'Audio', 0, audio ).then( function ( asset ) {

                    scope.setLoading( false );
                    scope.updateAddButton( true );

                    signals.audioAssetAdded.dispatch( asset, 0 );

                } );

            } ).catch( (err) => {

                alert( err );
                scope.setLoading( false );

            } );
        }
	}

    } );

    scope.updateAddButton( assets.get( 'Audio', 'audioId', item.id ) != null );

    if ( assets.get( 'Audio', 'audioId', item.id ) ) scope.container.addClass( 'Fill' );

    scope.updateButtons( false );

    scope.setLoading = function ( loading ) {

        scope.playIcon.setDisplay( loading ? 'none' : '' );
        scope.stopIcon.setDisplay( 'none' );
		scope.loadingSpinner.setDisplay( loading ? 'flex' : 'none' );

    };

    scope.menu.onDownload(function(){
			if(window.subscriptionSet){
				downloadImage(item.url, item.name);
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

	scope.menu.onSendToFolder(function (e) {
		scope.setLoading(true);
		api.get(`/asset/my-audio/${editor.projectId}`).then(function (foldersList) {

			console.log("Folders List", foldersList, e);
			scope.menu.container.setDisplay('none');
			if (foldersList.length > 1) {
				const menu = document.createElement('div');
				menu.setAttribute('id', 'audioFolderMenu');
				menu.classList.add('FolderItemMenu');

				var { top, left } = scope.container.dom.getBoundingClientRect();
				// Clear previous menu items and remove the menu element
				const audioFolderMenu = document.getElementById('audioFolderMenu');
				if (audioFolderMenu) {
					while (audioFolderMenu.firstChild) {
						audioFolderMenu.removeChild(audioFolderMenu.firstChild);
					}
					audioFolderMenu.remove();
				}
				$('.Audio'+item.id).append(menu);
				$('#audioFolderMenu').css({
					left: (e.clientX - left) + 'px',
					top: (e.clientY - top) + 'px'
				});
				$('#audioFolderMenu').css('display', 'block');
				console.log("Top", top, " Left", left);
				foldersList.forEach(folder => {
					const menuItem = document.createElement('div');
					// menuItem.classList.add('menu-item');
					menuItem.innerText = folder.name;
					menuItem.addEventListener("click", () => {
						console.log(`Menu item with id ${folder.id} clicked!`);
						moveToFolder(folder.id);

					});
					menu.appendChild(menuItem);
				});

				scope.setLoading(false);
			}
			else {

				if (!scope.status) {

					scope.setLoading(true);

					api.post('/asset/my-audio/add', { id: item.id, projectId: editor.projectId, folderId: 0 }).then(function (audio) {

						editor.addAsset( 'Audio', 0, audio ).then( function ( asset ) {

                            scope.setLoading( false );
                            scope.updateAddButton( true );
        
                            signals.audioAssetAdded.dispatch( asset, 0 );
        
                        } );

					}).catch((err) => {

						alert(err);
						scope.setLoading(false);

					});

				}
			}


		}).catch((err) => {

			alert(err);
			scope.setLoading(false);
			scope.menu.container.setDisplay('none');
		});
	});

    function moveToFolder(assetFolderId) {
		scope.menu.container.setDisplay('none');
		scope.setLoading(true);

		api.post('/asset/my-audio/add', { id: item.id, projectId: editor.projectId, folderId: assetFolderId }).then(function (audio) {

            editor.addAsset( 'Audio', assetFolderId, audio ).then( function ( asset ) {

                scope.setLoading( false );
                scope.updateAddButton( true );
				scope.menu.container.setDisplay('none');
				scope.container.addClass("Fill");
                signals.audioAssetAdded.dispatch( asset, assetFolderId );
                $('#audioFolderMenu').css('display', 'none');
            } );
			

		}).catch((err) => {

			alert(err);
			scope.setLoading(false);
			$('#audioFolderMenu').css('display', 'none');
		});
	}

	return this;

}

LibraryAudioItem.prototype = Object.create( LibraryBaseItem.prototype );
LibraryAudioItem.prototype.constructor = LibraryAudioItem;

export { LibraryAudioItem };
