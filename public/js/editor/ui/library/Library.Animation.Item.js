import { UILottieBox } from '../components/ui.js';
import { LibraryBaseItem } from "./Library.Base.Item.js";

function LibraryAnimationItem( editor, item ) {

	LibraryBaseItem.call( this, item );

	var scope = this;
	var api = editor.api;
	var assets = editor.assets;
	var signals = editor.signals;
	scope.menu.hideOption('addScene');
	scope.thumbnail = new UILottieBox( item );
	scope.container.add( scope.thumbnail );
	scope.container.addClass('Animation'+item.id);
	scope.container.onClick( function (e) {
	
	// Only execute this function when the Shift key is held down
	if (e.shiftKey) {
		if ( !scope.status ) {

			scope.setLoading( true );

			api.post( '/asset/my-animation/add', { id: item.id, projectId: editor.projectId, folderId: 0 } ).then( function ( animation ) {

				editor.addAsset( 'Animation', 0, animation ).then( function ( asset ) {

					scope.setLoading( false );
					scope.updateAddButton( true );

					signals.animationAssetAdded.dispatch( asset, 0 );

				} );

			} ).catch( (err) => {

				alert( err );
				scope.setLoading( false );

			} );

		}
	}

	} );

	scope.updateAddButton( assets.get( 'Animation', 'animationId', item.id ) != null );

	
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
		api.get(`/asset/my-animation/${editor.projectId}`).then(function (foldersList) {

			console.log("Folders List", foldersList, e);
			scope.menu.container.setDisplay('none');
			if (foldersList.length > 1) {
				const menu = document.createElement('div');
				menu.setAttribute('id', 'animationFolderMenu');
				menu.classList.add('FolderItemMenu');

				var { top, left } = scope.container.dom.getBoundingClientRect();
				// Clear previous menu items and remove the menu element
				const animationFolderMenu = document.getElementById('animationFolderMenu');
				if (animationFolderMenu) {
					while (animationFolderMenu.firstChild) {
						animationFolderMenu.removeChild(animationFolderMenu.firstChild);
					}
					animationFolderMenu.remove();
				}
				$('.Animation'+item.id).append(menu);
				$('#animationFolderMenu').css({
					left: (20) + 'px',
					top: (e.clientY -top) + 'px'
				});
				$('#animationFolderMenu').css('display', 'block');
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

					api.post('/asset/my-animation/add', { id: item.id, projectId: editor.projectId, folderId: 0 }).then(function (animation) {

						editor.addAsset('Animation', 0, animation).then(function (asset) {

							scope.setLoading(false);
							scope.updateAddButton(true);

							signals.animationAssetAdded.dispatch(asset, 0);

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

		api.post('/asset/my-animation/add', { id: item.id, projectId: editor.projectId, folderId: assetFolderId }).then(function (animation) {

			
			editor.addAsset('Animation', assetFolderId, animation).then(function (asset) {

				scope.setLoading(false);
				scope.updateAddButton(true);
				scope.menu.container.setDisplay('none');
				signals.animationAssetAdded.dispatch(asset, assetFolderId);
				$('#animationFolderMenu').css('display', 'none');
			});
			

		}).catch((err) => {

			alert(err);
			scope.setLoading(false);
			$('#animationFolderMenu').css('display', 'none');
		});
	}

	return this;

}

LibraryAnimationItem.prototype = Object.create( LibraryBaseItem.prototype );
LibraryAnimationItem.prototype.constructor = LibraryAnimationItem;

export { LibraryAnimationItem };