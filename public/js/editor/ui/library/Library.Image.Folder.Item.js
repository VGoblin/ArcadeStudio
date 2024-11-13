import { UILazyImage } from "../components/ui.js";
import { LibraryBaseFolderItem } from "./Library.Base.Folder.Item.js";

function LibraryImageFolderItem( editor, folderId, asset ) {

	LibraryBaseFolderItem.call( this, folderId, asset );

	var scope = this;
	var api = editor.api;
	var signals = editor.signals;
	scope.menu.hideOption('addScene');
	scope.container.addClass( 'Image' );

	scope.thumbnail = new UILazyImage( asset.url ).addClass( 'Thumbnail' );

	scope.container.add( scope.thumbnail );

	

	scope.menu.onDelete( function () {

		if(window.subscriptionSet){

			api.post( '/asset/my-image/delete', { id: asset.id } ).then( function ( image ) {
	
				editor.removeAsset( 'Image', asset.id );
	
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

		api.post( '/asset/my-image/add', { id: asset.imageId, projectId: editor.projectId, folderId } ).then( function ( image ) {

			editor.addAsset( 'Image', 0, image ).then( function ( asset ) {

				scope.setLoading( false );

				signals.imageAssetAdded.dispatch( asset, folderId );

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

	signals.imageAssetDownloading.add( function ( id, downloading ) {

		if ( asset.id == id ) scope.setLoading( downloading );

	} );

	return this;

}

LibraryImageFolderItem.prototype = Object.create( LibraryBaseFolderItem.prototype );
LibraryImageFolderItem.prototype.constructor = LibraryImageFolderItem;

export { LibraryImageFolderItem };
