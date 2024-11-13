import { UIMyLazyVideo } from "../components/ui.js";
import { LibraryBaseFolderItem } from "./Library.Base.Folder.Item.js";

function LibraryVideoFolderItem( editor, folderId, asset ) {

	LibraryBaseFolderItem.call( this, folderId, asset );

	var scope = this;
	var api = editor.api;
	scope.menu.hideOption('addScene');
	scope.container.addClass( 'Video' );

	scope.thumbnail = new UIMyLazyVideo( asset.name, asset.url ).addClass( 'Thumbnail' );

	scope.container.add( scope.thumbnail );
	

	scope.menu.onDelete( function () {

			if(window.subscriptionSet){

				api.post( '/asset/my-video/delete', { id: asset.id } ).then( function ( image ) {

					editor.removeAsset( 'Video', asset.id );

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

		api.post( '/asset/my-video/add', { id: asset.videoId, projectId: editor.projectId } ).then( function () {

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

	return this;

}

LibraryVideoFolderItem.prototype = Object.create( LibraryBaseFolderItem.prototype );
LibraryVideoFolderItem.prototype.constructor = LibraryVideoFolderItem;

export { LibraryVideoFolderItem };
