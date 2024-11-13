import { UIDiv } from '../components/ui.js';

function LibraryBaseItemMenu() {

	this.container = new UIDiv().setClass( 'FolderItemMenu' );
	this.delete = new UIDiv();
	this.delete.setTextContent( 'Delete' );
	this.duplicate = new UIDiv();
	this.duplicate.setTextContent( 'Duplicate' );
	this.download = new UIDiv();
	this.download.setTextContent( 'Download' );
	this.addScene = new UIDiv();
	this.addScene.setTextContent( 'Add To Scene' );
	this.sendToFolder = new UIDiv();
	this.sendToFolder.setTextContent( 'Send To Folder' );

	this.container.add( this.addScene );
	this.container.add( this.sendToFolder );
	this.container.add( this.download );
	// this.container.add( this.duplicate );
	// this.container.add( this.delete );
	// this.container.add( this.addScene );
	
	return this;

}

LibraryBaseItemMenu.prototype = {

	// onDelete: function ( callback ) {

	// 	this.delete.onClick( function ( e ) {

	// 		e.preventDefault();
	// 		e.stopPropagation();

	// 		callback();

	// 	} );

	// },

	// onDuplicate: function ( callback ) {

	// 	this.duplicate.onClick( function ( e ) {

	// 		e.preventDefault();
	// 		e.stopPropagation();

	// 		callback();

	// 	} );

	// },

	onDownload: function ( callback ) {

		this.download.onClick( function ( e ) {

			e.preventDefault();
			e.stopPropagation();

			callback();

		} );

	},

	onAddToScene: function ( callback ) {

		this.addScene.onClick( function ( e ) {

			e.preventDefault();
			e.stopPropagation();

			callback();

		} );

	},

	onSendToFolder: function ( callback ) {

		this.sendToFolder.onClick( function ( e ) {

			e.preventDefault();
			e.stopPropagation();

			callback(e);

		} );

	},

	hideOption: function ( option ) {

		if ( option === 'download' ) {
			this.download.delete();
		} else if ( option === 'addScene' ) {
			this.addScene.delete();
		} else if ( option === 'sendToFolder' ) {
			this.sendToFolder.delete();
		}

	},


};

export { LibraryBaseItemMenu }
