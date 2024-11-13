import { UIDiv } from '../components/ui.js';
import { LibraryComponentAddedToProjectIcon, LibraryComponentAddToProjectButton } from './Library.Component.Buttons.js';
import { LibraryBaseItemMenu } from './Library.Base.Item.Menu.js';

function LibraryBaseItem( item ) {
	var scope = this;
	this.item = item;
	this.thumbnail = null;
	this.container = new UIDiv();
	this.container.addClass( 'LibraryItem' );
	this.status = false;
	this.menu = new LibraryBaseItemMenu();

	this.loadingSpinner = new UIDiv().setClass( 'w-lightbox-spinner' );
	this.loadingSpinner.setDisplay( 'none' );

	this.container.add( this.loadingSpinner );
	this.container.add( this.menu.container );

	this.onAddCallback = null;
	this.addedToProjectIcon = new LibraryComponentAddedToProjectIcon();
	this.addToProjectButton = new LibraryComponentAddToProjectButton();

	this.container.onClick( function ( e ) {
		e.preventDefault();
		e.stopPropagation();
	
		// If Shift key is not pressed, show menu.
		if (!e.shiftKey) {
			$( '.FolderItemMenu' ).hide();
	
			var { top, left } = scope.container.dom.getBoundingClientRect();
			scope.menu.container.setLeft( ( (e.clientX - left) ) + 'px' );
			scope.menu.container.setTop( ( e.clientY - top ) + 'px' );
			scope.menu.container.setDisplay( 'block' );
		}
	
		return false;
	
	} );
	

}

LibraryBaseItem.prototype = {

	updateAddButton: function ( added ) {

		this.status = added;

		if ( this.status ) {

			this.addToProjectButton.delete();
			this.container.add( this.addedToProjectIcon );

		} else {

			this.addedToProjectIcon.delete();
			this.container.add( this.addToProjectButton );

		}

	},

	setLoading( loading ) {

		loading ? this.thumbnail.addClass( 'Loading' ) : this.thumbnail.removeClass( 'Loading' );
		this.thumbnail.setVisibility( loading ? 'hidden' : 'visible' );
		this.loadingSpinner.setDisplay( loading ? '' : 'none' );

	}

};

export { LibraryBaseItem }