import { UILazyImage, UIUnsplashImage, UILink } from "../components/ui.js";
import { LibraryBaseItem } from "./Library.Base.Item.js";

const randomInt = function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}
  
function LibraryImageItem( editor, item ) {

	LibraryBaseItem.call( this, item );

	var randomId = randomInt(1000);
	var scope = this;
	var api = editor.api;
	var assets = editor.assets;
	var signals = editor.signals;
	var loader = editor.loader;
	scope.menu.hideOption('addScene');
	scope.container.addClass( 'Image' );
	scope.container.addClass( 'Image' + randomId );

	scope.thumbnail = new UILazyImage( item.url ).addClass( 'Thumbnail' );
	scope.container.add( scope.thumbnail );

	scope.addedToProjectIcon.addClass( 'VideoImageEnv' );
	scope.addToProjectButton.addClass( 'VideoImageEnv' );

	scope.container.dom.draggable = true;

	let draggedImage = null;
	scope.container.dom.addEventListener( 'dragstart', function ( e ) {
		var asset = editor.assets.get( 'Image', 'imageId', item.id );
		
		e.dataTransfer.setData( 'assetType', 'Image' );
		e.dataTransfer.setData( 'assetUrl', item.url );
		draggedImage = document.createElement("div");

		var dragIcon = document.createElement("img");
		dragIcon.src = scope.thumbnail.dom.src;
		dragIcon.style.width = "40px";
		dragIcon.style.height = "40px";
		draggedImage.appendChild(dragIcon);
		draggedImage.style.position = "absolute";
		draggedImage.style.top = "0px";
		draggedImage.style.left= "-1000px";
		document.querySelector('body').appendChild(draggedImage);

		e.dataTransfer.setDragImage(draggedImage,0,0);

		var assetId;

		if ( typeof asset == "undefined" ) {

			assetId = item.id;

			e.dataTransfer.setData( 'assetType', 'Image' );

		} else {

			assetId = asset.id;

		}

		e.dataTransfer.setData( 'assetId', assetId );

	}, false);

	scope.container.dom.addEventListener( 'dragend', function ( e ) {

		// if draggedImage element is still present remove it 
		if(draggedImage) {
			document.querySelector('body').removeChild(draggedImage);
			draggedImage = null;
		}

		var asset = editor.assets.get( 'Image', 'imageId', item.id );

		if (typeof asset == 'undefined') {

			scope.setLoading( true );

			setTimeout(() => {
				
				var asset = editor.assets.get( 'Image', 'imageId', item.id );

				if ( typeof asset != 'undefined' ) {

					scope.setLoading( false );

					scope.updateAddButton( true );

				} else {
					console.log('not fine');
				}

				scope.setLoading( false );

			}, 5000);
		}
	}, false );

	scope.container.onClick( function (e) {
		// Only execute this function when the Shift key is held down
		if (e.shiftKey) {

		if ( item.id == -1 ) {

			scope.setLoading( true );
			//console.error(item.downloadLocation, item)
			
			if (item.downloadLocation) {
				fetch(item.downloadLocation)
					.catch((err) => {
						console.error(err)
					});
			}

			fetch( item.url )
				.then( res => res.blob() )
				.then( blob => {

					var ext = item.url.match(/fm=([^&]*)&/)[1];
					var file = new File( [ blob ], 'file.' + ext, { type: blob.type } );

					Promise.all( loader.loadFiles( [ file ], null, 'Image' ) ).then( function ( results ) {

						var texture = results[ 0 ].texture;
						var formData = new FormData();
						formData.append( 'type', 'Image' );
						formData.append( 'projectId', editor.projectId );
						formData.append( 'file', file );
	
						api.post( '/asset/my-image/upload', formData ).then( res => {
							
							scope.setLoading( false );

							var asset = assets.uploadImage( texture );
							asset.id = res.files[ 0 ].id;
							asset.imageId = res.files[ 0 ].imageId;

							signals.imageAssetAdded.dispatch( asset, 0 );
							scope.updateAddButton( true );
	
						} );

					} );
					
				});

		} else {

			if ( !scope.status ) {

				scope.setLoading( true );

				api.post( '/asset/my-image/add', { id: item.id, projectId: editor.projectId, folderId: 0 } ).then( function ( image ) {

					editor.addAsset( 'Image', 0, image ).then( function ( asset ) {

						scope.setLoading( false );
						scope.updateAddButton( true );

						signals.imageAssetAdded.dispatch( asset, 0 );

					} );

				} ).catch( (err) => {

					alert( err );
					scope.setLoading( false );

				} );

			}

		}
	}
	} );
	scope.updateAddButton( assets.get( 'Image', 'imageId', item.id ) != null );

	
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
		api.get(`/asset/my-image/${editor.projectId}`).then(function (foldersList) {
			
			console.log("Folders List", foldersList, e);
			scope.menu.container.setDisplay('none');
			if (foldersList.length > 1) {
				const menu = document.createElement('div');
				menu.setAttribute('id', 'imageFolderMenu');
				menu.classList.add('FolderItemMenu');

				var { top, left } = scope.container.dom.getBoundingClientRect();
				// Clear previous menu items and remove the menu element
				const imageFolderMenu = document.getElementById('imageFolderMenu');
				if (imageFolderMenu) {
					while (imageFolderMenu.firstChild) {
						imageFolderMenu.removeChild(imageFolderMenu.firstChild);
					}
					imageFolderMenu.remove();
				}
				$('.Image' + randomId).append(menu);
				$('#imageFolderMenu').css({
					left: (20) + 'px',
					top: (e.clientY - top) + 'px'
				});
				$('#imageFolderMenu').css('display', 'block');
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

				if ( item.id == -1 ) {

					scope.setLoading( true );
					//console.error(item.downloadLocation, item)
					
					if (item.downloadLocation) {
						fetch(item.downloadLocation)
							.catch((err) => {
								console.error(err)
							});
					}
		
					fetch( item.url )
						.then( res => res.blob() )
						.then( blob => {
		
							var ext = item.url.match(/fm=([^&]*)&/)[1];
							var file = new File( [ blob ], 'file.' + ext, { type: blob.type } );
		
							Promise.all( loader.loadFiles( [ file ], null, 'Image' ) ).then( function ( results ) {
		
								var texture = results[ 0 ].texture;
								var formData = new FormData();
								formData.append( 'type', 'Image' );
								formData.append( 'projectId', editor.projectId );
								formData.append( 'file', file );
			
								api.post( '/asset/my-image/upload', formData ).then( res => {
									
									scope.setLoading( false );
		
									var asset = assets.uploadImage( texture );
									asset.id = res.files[ 0 ].id;
									asset.imageId = res.files[ 0 ].imageId;
		
									signals.imageAssetAdded.dispatch( asset, 0 );
									scope.updateAddButton( true );
			
								} );
		
							} );
							
						});
		
				} else {
		
					if ( !scope.status ) {
		
						scope.setLoading( true );
		
						api.post( '/asset/my-image/add', { id: item.id, projectId: editor.projectId, folderId: 0 } ).then( function ( image ) {
		
							editor.addAsset( 'Image', 0, image ).then( function ( asset ) {
		
								scope.setLoading( false );
								scope.updateAddButton( true );
		
								signals.imageAssetAdded.dispatch( asset, 0 );
		
							} );
		
						} ).catch( (err) => {
		
							alert( err );
							scope.setLoading( false );
		
						} );
		
					}
		
				}
			}


		}).catch((err) => {

			alert(err);
			scope.setLoading(false);
			scope.menu.container.setDisplay('none');
		});
	});

	function moveToFolder(assetFolderId) {

		if ( item.id == -1 ) {

			scope.setLoading( true );
			//console.error(item.downloadLocation, item)
			
			if (item.downloadLocation) {
				fetch(item.downloadLocation)
					.catch((err) => {
						console.error(err)
					});
			}

			fetch( item.url )
				.then( res => res.blob() )
				.then( blob => {

					var ext = item.url.match(/fm=([^&]*)&/)[1];
					var file = new File( [ blob ], 'file.' + ext, { type: blob.type } );

					Promise.all( loader.loadFiles( [ file ], null, 'Image' ) ).then( function ( results ) {

						var texture = results[ 0 ].texture;
						var formData = new FormData();
						formData.append( 'type', 'Image' );
						formData.append( 'projectId', editor.projectId );
						formData.append( 'file', file );
						formData.append( 'folderId', assetFolderId)
	
						api.post( '/asset/my-image/upload', formData ).then( res => {
							
							scope.setLoading( false );

							var asset = assets.uploadImage( texture );
							asset.id = res.files[ 0 ].id;
							asset.imageId = res.files[ 0 ].imageId;

							signals.imageAssetAdded.dispatch( asset, 0 );
							scope.updateAddButton( true );
	
						} );

					} );
					
				});

		}
		else{
			scope.setLoading(true);

		api.post('/asset/my-image/add', { id: item.id, projectId: editor.projectId, folderId: assetFolderId }).then(function (image) {

			editor.addAsset( 'Image', 0, image ).then( function ( asset ) {
		
				scope.setLoading( false );
				scope.updateAddButton( true );

				signals.imageAssetAdded.dispatch( asset, 0 );
				$('#imageFolderMenu').css('display', 'none');
			} );
			

		}).catch((err) => {

			alert(err);
			scope.setLoading(false);
			$('#imageFolderMenu').css('display', 'none');
		});
		}
		
	}

	return this;

}

LibraryImageItem.prototype = Object.create( LibraryBaseItem.prototype );
LibraryImageItem.prototype.constructor = LibraryImageItem;

export { LibraryImageItem };