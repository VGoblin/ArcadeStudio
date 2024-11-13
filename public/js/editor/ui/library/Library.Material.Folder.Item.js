import { UILazyImage, UIText } from "../components/ui.js";
import { LibraryBaseFolderItem } from "./Library.Base.Folder.Item.js";

function LibraryMaterialFolderItem( editor, folderId, asset ) {

	LibraryBaseFolderItem.call( this, folderId, asset );

	var scope = this;
	var api = editor.api;
	var signals = editor.signals;

	scope.container.addClass( 'Geometry' );
	scope.menu.hideOption('addScene');
	scope.thumbnail = new UILazyImage( asset.thumbUrl ).addClass( 'Thumbnail' );
	scope.text = new UIText( asset.name );

	scope.container.add( scope.thumbnail, scope.text );
	

	scope.menu.onDelete( function () {

			if(window.subscriptionSet){

				api.post( '/asset/my-material/delete', { id: asset.id } ).then( function ( material ) {

					editor.removeAsset( 'Material', asset.id );

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

		api.post( '/asset/my-material/add', { id: asset.materialId, projectId: editor.projectId, folderId } ).then( function ( material ) {

			editor.addAsset( 'Material', 0, material ).then( function ( asset ) {

				scope.setLoading( false );

				signals.materialAssetAdded.dispatch( asset, folderId );

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

	signals.materialAssetDownloading.add( function ( id, downloading ) {

		if ( asset.id == id ) scope.setLoading( downloading );

	} );

	return this;

}

LibraryMaterialFolderItem.prototype = Object.create( LibraryBaseFolderItem.prototype );
LibraryMaterialFolderItem.prototype.constructor = LibraryMaterialFolderItem;

export { LibraryMaterialFolderItem };