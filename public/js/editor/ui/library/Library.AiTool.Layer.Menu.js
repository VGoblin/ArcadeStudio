import { UIDiv } from '../components/ui.js';

function LibraryAiToolLayerMenu() {

	this.container = new UIDiv().setClass( 'FolderItemMenu' );
	this.delete = new UIDiv();
	this.delete.setTextContent( 'Delete Image' );
	this.copyprompt = new UIDiv();
	this.copyprompt.setTextContent( 'Copy Prompt' );

	this.container.add( this.copyprompt );
	this.container.add( this.delete );

	return this;

}

LibraryAiToolLayerMenu.prototype = {

	onDelete: function ( callback ) {

		this.delete.onClick( function ( e ) {

			e.preventDefault();
			e.stopPropagation();

			callback();

		} );

	},

	onCopyPrompt: function ( callback ) {

		this.copyprompt.onClick( function ( e ) {

			e.preventDefault();
			e.stopPropagation();

			callback();

		} );

	}

};

export { LibraryAiToolLayerMenu }