import { UILottieBox } from "../components/ui.js";
import { LibraryBaseFolderItem } from './Library.Base.Folder.Item.js';

function LibraryAnimationFolderItem( editor, folderId, asset ) {

	LibraryBaseFolderItem.call( this, folderId, asset );

	var scope = this;
	var api = editor.api;
	var config = editor.config;
	scope.menu.hideOption('addScene');
	scope.container.addClass( 'LibraryItem' );

	scope.thumbnail = new UILottieBox( asset );

	scope.container.add( scope.thumbnail );

	scope.menu.onDelete( function () {
		
		if(window.subscriptionSet){

			api.post( '/asset/my-animation/delete', { id: asset.id } ).then( function ( animation ) {

				editor.removeAsset( 'Animation', asset.id );

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

		scope.setLoading( false );

		api.post( '/asset/my-animation/add', { id: asset.animationId, projectId: editor.projectId, folderId } ).then( function ( animation ) {

			editor.addAsset( 'Animation', 0, animation ).then( function ( asset ) {

				scope.setLoading( false );

				signals.animationAssetAdded.dispatch( asset, folderId );

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


	return this;

}

LibraryAnimationFolderItem.prototype = Object.create( LibraryBaseFolderItem.prototype );
LibraryAnimationFolderItem.prototype.constructor = LibraryAnimationFolderItem;

export { LibraryAnimationFolderItem };
