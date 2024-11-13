import { UIDiv, UIElement, UIPanel, UIRow } from "../components/ui.js";
import { LibraryComponentBannerButton, LibraryComponentActionButton } from './Library.Component.Buttons.js';

function LibraryBaseFolder( editor, options ) {

	var scope = this;
    var config = editor.config;
    var strings = editor.strings;
	var signals = editor.signals;

    this.buttons = {};
    this.callbacks = {};
    this.folders = [];
    this.items = [];

    this.container = new UIDiv();

	this.panel = new UIPanel();
	this.panel.setClass( 'LibraryPanel' );
    this.panel.setDisplay( 'none' );
	this.panel.dom.style.top = '0px';

    this.actionBar = new UIRow();
	this.actionBar.setBorderBottom("0.5px solid #1e2742");
	this.actionBar.dom.style.paddingLeft = "0px";
	this.actionBar.dom.style.paddingRight = "0px";
	this.actionBar.dom.style.height = "30px";

	var titleIconBlock = new UIDiv();
    titleIconBlock.setClass( 'icon-link' );

    var currentPanel = null;
    var backIcon = new UIDiv();
    backIcon.setDisplay( 'none' );
    backIcon.setClass( 'back-icon' );
    backIcon.onClick( function () {
        backIcon.setDisplay( 'none' );
        currentPanel.setDisplay( 'none' );
		$("#library .title-bar .icon-link .back-icon").css("display", "none");
		$("#library .title-bar").css("display", "none");
    } );

    titleIconBlock.add( backIcon );

    this.actionBar.add( titleIconBlock );

	signals.libraryBackEnabled.add( function ( domElement ) {

        backIcon.setDisplay( '' );
        currentPanel = domElement;

    } );

	var actionButtons = new UIDiv();
	actionButtons.addClass("project-buttons");
	actionButtons.dom.style.marginRight = "5px";

	if (options.buttons) {
		options.buttons.map(button => {
		  const newProjectBtn = document.createElement("div");
		  newProjectBtn.className = "project-button";
		  const newProjectContent = document.createElement("div");
		  newProjectContent.id = "newProjectBtn";
		  newProjectBtn.appendChild(newProjectContent);
	  
		  // Create the plus symbol using CSS
		  const plusElement = document.createElement("div");
		  plusElement.className = "plus";
		  const horizontalLine = document.createElement("div");
		  horizontalLine.className = "horizontal-line";
		  const verticalLine = document.createElement("div");
		  verticalLine.className = "vertical-line";
		  plusElement.appendChild(horizontalLine);
		  plusElement.appendChild(verticalLine);
		  newProjectContent.appendChild(plusElement);
	  
		  scope.buttons[button] = new UIElement(newProjectBtn);
		  actionButtons.add(scope.buttons[button]);
		});
	  }
	  
	
	const newFolderBtn = document.createElement("div");
	newFolderBtn.className = ("project-button");
	const newFolderContent = document.createElement("div");
	newFolderBtn.appendChild(newFolderContent);
	newFolderContent.id="newFolderBtn";
	newFolderContent.innerHTML='<img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/website/master/control-panel/new-folder.svg">';

	this.newFolder = new UIElement(newFolderBtn); //new LibraryComponentActionButton( strings.getKey( `library/new_folder` ) );
	this.newFolder.onClick( function () {

		scope.createNewFolder( editor );
		
	} );

	actionButtons.add( this.newFolder );

	this.actionBar.add(actionButtons);

	this.foldersList = new UIPanel().setClass( 'AccordionList' );
	this.foldersList.addClass("flex-1");
	this.foldersList.dom.style.overflow = "scroll";

	this.panel.add( this.actionBar );
	this.panel.add( this.foldersList );

	this.bannerButton = new LibraryComponentBannerButton( editor, this.panel, config.getImage( 'gallery/folder.jpg' ), options.bannerText );

	this.container.add( this.bannerButton );
	this.container.add( this.panel );

    return this;

}

export { LibraryBaseFolder };