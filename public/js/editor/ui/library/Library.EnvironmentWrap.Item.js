import { UILazyImage, UIText } from "../components/ui.js";
import { LibraryBaseItem } from "./Library.Base.Item.js";

function LibraryEnvironmentWrapItem( editor, item ) {

	LibraryBaseItem.call( this, item );

	var scope = this;
	var api = editor.api;
	var assets = editor.assets;
	var signals = editor.signals;
	scope.menu.hideOption('addScene');
	scope.container.dom.draggable = true;
	scope.container.addClass( 'EnvironmentWrap' );
	scope.container.addClass( 'EnvironmentWrap'+ item.id );
	scope.container.setMarginBottom( '10px' );

	scope.thumbnail = new UILazyImage( item.thumbUrl ).addClass( 'Thumbnail' );
	scope.text = new UIText( item.name );

	scope.container.add( scope.thumbnail, scope.text );

	scope.addedToProjectIcon.addClass( 'VideoImageEnv' );
	scope.addToProjectButton.addClass( 'VideoImageEnv' );

	
	scope.container.dom.draggable = true;
	scope.container.dom.addEventListener( 'dragstart', function ( e ) {

		var asset = editor.assets.get( 'Environment', 'environmentId', item.id );
		
		e.dataTransfer.setData( 'assetType', 'Environment' );
		e.dataTransfer.setData( 'assetUrl', item.url );

		var assetId;

		if ( typeof asset == "undefined" ) {

			assetId = item.id;

			e.dataTransfer.setData( 'assetType', 'Environment' );

		} else {

			assetId = asset.id;

		}

		e.dataTransfer.setData( 'assetId', assetId );

	}, false);
//TODO: could come up with better solution for this
	scope.container.dom.addEventListener( 'dragend', function ( e ) {

		var asset = editor.assets.get( 'Environment', 'environmentId', item.id );

		if (typeof asset == 'undefined') {

			scope.setLoading( true );

			setTimeout(() => {
				
				var asset = editor.assets.get( 'Environment', 'environmentId', item.id );

				if ( typeof asset != 'undefined' ) {

					scope.setLoading( false );

					scope.updateAddButton( true );

				} else {
					console.log('not fine');
				}

				scope.setLoading( false );

			}, 10000);
		}
	}, false );
 
	scope.container.onClick( function (e) {
	// Only execute this function when the Shift key is held down
	if (e.shiftKey) {

		if ( !scope.status ) {

			scope.setLoading( true );

			api.post( '/asset/my-environment/add', { id: item.id, projectId: editor.projectId, folderId: 0 } ).then( function ( environment ) {

				editor.addAsset( 'Environment', 0, environment ).then( function ( asset ) {

					scope.setLoading( false );
					scope.updateAddButton( true );

					signals.environmentAssetAdded.dispatch( asset, 0 );

				} );

			} ).catch( (err) => {

				alert( err );
				scope.setLoading( false );

			} );

		}
	}

	} );
	scope.updateAddButton( assets.get( 'Environment', 'environmentId', item.id ) != null );

	
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
		api.get(`/asset/my-environment/${editor.projectId}`).then(function (foldersList) {

			console.log("Folders List", foldersList, e);
			scope.menu.container.setDisplay('none');
			if (foldersList.length > 1) {
				const menu = document.createElement('div');
				menu.setAttribute('id', 'environmentFolderMenu');
				menu.classList.add('FolderItemMenu');

				var { top, left } = scope.container.dom.getBoundingClientRect();
				// Clear previous menu items and remove the menu element
				const environmentFolderMenu = document.getElementById('environmentFolderMenu');
				if (environmentFolderMenu) {
					while (environmentFolderMenu.firstChild) {
						environmentFolderMenu.removeChild(environmentFolderMenu.firstChild);
					}
					environmentFolderMenu.remove();
				}
				$('.EnvironmentWrap'+ item.id).append(menu);
				$('#environmentFolderMenu').css({
					left: (20) + 'px',
					top: (e.clientY - top) + 'px'
				});
				$('#environmentFolderMenu').css('display', 'block');
				
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

					api.post('/asset/my-environment/add', { id: item.id, projectId: editor.projectId, folderId: 0 }).then(function (environment) {

						editor.addAsset('Environment', 0, environment).then(function (asset) {

							scope.setLoading(false);
							scope.updateAddButton(true);

							signals.environmentAssetAdded.dispatch(asset, 0);

						});

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

		api.post('/asset/my-environment/add', { id: item.id, projectId: editor.projectId, folderId: assetFolderId }).then(function (environment) {

			
			editor.addAsset('Environment', assetFolderId, environment).then(function (asset) {

				scope.setLoading(false);
				scope.updateAddButton(true);
				scope.menu.container.setDisplay('none');
				signals.environmentAssetAdded.dispatch(asset, assetFolderId);
				$('#environmentFolderMenu').css('display', 'none');
			});
			

		}).catch((err) => {

			alert(err);
			scope.setLoading(false);
			$('#environmentFolderMenu').css('display', 'none');
		});
	}

	return this;

}

LibraryEnvironmentWrapItem.prototype = Object.create( LibraryBaseItem.prototype );
LibraryEnvironmentWrapItem.prototype.constructor = LibraryEnvironmentWrapItem;

export { LibraryEnvironmentWrapItem };