import { UILazyImage, UIText } from "../components/ui.js";
import { LibraryBaseItem } from "./Library.Base.Item.js";

function LibraryGeometryItem( editor, item ) {

	LibraryBaseItem.call( this, item );

	var scope = this;
	var api = editor.api;
	var assets = editor.assets;
	var signals = editor.signals;

	scope.container.addClass( 'Geometry' );
	scope.container.addClass( 'Geometry' + item.id );

	scope.thumbnail = new UILazyImage( item.thumbUrl ).addClass( 'Thumbnail' );
	scope.text = new UIText( item.name );

	scope.container.add( scope.thumbnail, scope.text );

	scope.addedToProjectIcon.addClass( 'GeometryMaterial' );
	scope.addToProjectButton.addClass( 'GeometryMaterial' );

	scope.container.dom.draggable = true;
	scope.container.dom.addEventListener( 'dragstart', function ( e ) {
		var asset = editor.assets.get( 'Geometry', 'geometryId', item.id );
		e.dataTransfer.setData( 'assetType', 'Geometry');
		var assetId;
		if (typeof asset == "undefined") {
			assetId = item.id;
			e.dataTransfer.setData('assetType', 'Geometry');
		} else {
			assetId = asset.id;
		}
		e.dataTransfer.setData( 'assetId', assetId );
	}, false );
	scope.container.dom.addEventListener( 'dragend', function ( e ) {

		var asset = editor.assets.get( 'Geometry', 'geometryId', item.id );

		if (typeof asset == 'undefined') {

			scope.setLoading( true );

			setTimeout(() => {
				
				var asset = editor.assets.get( 'Geometry', 'geometryId', item.id );

				if ( typeof asset != 'undefined' ) {

					scope.setLoading( false );

					scope.updateAddButton( true );

				} else {
					console.log('not fine');
				}

				scope.setLoading( false );

			}, 3500);
		}
	}, false );

	scope.container.onClick( function ( e ) {

		// Only execute this function when the Shift key is held down
		if (e.shiftKey) {
	
			if ( !scope.status ) {
	
				scope.setLoading( true );
	
				api.post( '/asset/my-geometry/add', { id: item.id, projectId: editor.projectId, folderId: 0 } ).then( function ( geometry ) {
	
					editor.addAsset( 'Geometry', 0, geometry ).then( function ( asset ) {
	
						scope.setLoading( false );
						scope.updateAddButton( true );
	
						signals.geometryAssetAdded.dispatch( asset, 0 );
	
						if ( !e.shiftKey ) asset.render();
	
					} );
	
				} ).catch( (err) => {
	
					alert( err );
					scope.setLoading( false );
	
				} );
	
			} else {
	
				var asset = editor.assets.get( 'Geometry', 'geometryId', item.id );
				console.log("ELSE===", asset);
				asset.render();
	
			}
		}
	
	} );
		
	scope.updateAddButton( assets.get( 'Geometry', 'geometryId', item.id ) != null );


	scope.menu.onSendToFolder(function(e){
		
		scope.setLoading( true );
		api.get( `/asset/my-geometry/${editor.projectId}` ).then( function ( foldersList ) {

			console.log("Folders List", foldersList, e);
			scope.menu.container.setDisplay('none');
			if (foldersList.length > 1) {
				const menu = document.createElement('div');
				menu.setAttribute('id', 'geometryFolderMenu');
				menu.classList.add('FolderItemMenu');
				// Clear previous menu items and remove the menu element
				const geometryFolderMenu = document.getElementById('geometryFolderMenu');
				if (geometryFolderMenu) {
					while (geometryFolderMenu.firstChild) {
						geometryFolderMenu.removeChild(geometryFolderMenu.firstChild);
					}
					geometryFolderMenu.remove();
				}
				var { top, left } = scope.container.dom.getBoundingClientRect();
				$('.Geometry'+item.id).append(menu);
				$('#geometryFolderMenu').css({
					left: 20 + 'px',
					top: (e.clientY - top) + 'px'
				});
				$('#geometryFolderMenu').css('display', 'block');
				
				foldersList.forEach(folder => {
					const menuItem = document.createElement('div');
					// menuItem.classList.add('menu-item');
					menuItem.innerText = folder.name;
					menuItem.addEventListener("click", (e) => {
						console.log(`Menu item with id ${folder.id} clicked!`);
						moveToFolder(folder.id);
						e.preventDefault();
						e.stopPropagation();

					});
					menu.appendChild(menuItem);
				});
				
				scope.setLoading(false);
			}
			else{
				scope.setLoading( true );

			api.post( '/asset/my-geometry/add', { id: item.id, projectId: editor.projectId, folderId: 0 } ).then( function ( geometry ) {

				editor.addAsset( 'Geometry', 0, geometry ).then( function ( asset ) {

					scope.setLoading( false );
					scope.updateAddButton( true );

					signals.geometryAssetAdded.dispatch( asset, 0 );

					//asset.render();
					scope.menu.container.setDisplay('none');
				} );

			} ).catch( (err) => {

				alert( err );
				scope.setLoading( false );
				scope.menu.container.setDisplay('none');
			} );
			}
			

		} ).catch( (err) => {

			alert( err );
			scope.setLoading( false );
			scope.menu.container.setDisplay('none');
		} );
	});

	scope.menu.onAddToScene(function(e){
			if ( !scope.status ) {

			scope.setLoading( true );

			api.post( '/asset/my-geometry/add', { id: item.id, projectId: editor.projectId, folderId: 0 } ).then( function ( geometry ) {

				editor.addAsset( 'Geometry', 0, geometry ).then( function ( asset ) {

					scope.setLoading( false );
					scope.updateAddButton( true );

					signals.geometryAssetAdded.dispatch( asset, 0 );

					asset.render();
					scope.menu.container.setDisplay('none');
				} );

			} ).catch( (err) => {

				alert( err );
				scope.setLoading( false );
				scope.menu.container.setDisplay('none');
			} );

		} else {

			var asset = editor.assets.get( 'Geometry', 'geometryId', item.id );
			asset.render();

		}
	});

	
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
	 
	function moveToFolder(assetFolderId){
		scope.menu.container.setDisplay('none');
		scope.setLoading( true );
		
			api.post( '/asset/my-geometry/add', { id: item.id, projectId: editor.projectId, folderId: assetFolderId } ).then( function ( geometry ) {

				editor.addAsset( 'Geometry', assetFolderId, geometry ).then( function ( asset ) {

					scope.setLoading( false );
					scope.updateAddButton( true );
					scope.menu.container.setDisplay('none');
					signals.geometryAssetAdded.dispatch( asset, assetFolderId );

					$('#geometryFolderMenu').css('display', 'none');
				} );

			} ).catch( (err) => {

				alert( err );
				scope.setLoading( false );
				$('#geometryFolderMenu').css('display', 'none');
			} );
	}  

	return this;

}


LibraryGeometryItem.prototype = Object.create( LibraryBaseItem.prototype );
LibraryGeometryItem.prototype.constructor = LibraryGeometryItem;

export { LibraryGeometryItem };