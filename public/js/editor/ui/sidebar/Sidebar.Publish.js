/**
 * @author codelegend620
 */

import { UIRow, UIText, UIDiv, UIInput, UIButton } from '../components/ui.js';
import { SidebarPublishItem } from './Sidebar.Publish.Item.js';
import * as THREE from '../../libs/three.module.js';
import { zipSync, strToU8 } from '../../../lib/app/fflate.module.js';
import generateDownloadableProject from '../utils/generateDownloadableProject.js';

// import JSZipUtils from "jszip-utils/dist/jszip-utils.js";
const { saveAs } = require('file-saver');


function save( blob, filename ) {
	var link = document.createElement( 'a' );

	if ( link.href ) {

		URL.revokeObjectURL( link.href );

	}

	link.href = URL.createObjectURL( blob );
	link.download = filename || 'data.json';
	link.dispatchEvent( new MouseEvent( 'click' ) );

}


function SidebarPublish(editor ) {
		
	var api = editor.api;
	var strings = editor.strings;
	var signals = editor.signals;
	var config = editor.config;

	var container = new UIDiv().setId( 'publish-panel' );

    var newPublishLocationRow = new UIRow();
    newPublishLocationRow.addClass( 'ProjectItem' );
    newPublishLocationRow.addClass( 'HasInput' );
    container.add( newPublishLocationRow );

    var newPublishLocationInput = new UIInput( '', createProject );
    newPublishLocationInput.dom.placeholder = strings.getKey( 'sidebar/publish/new' );
    newPublishLocationRow.add( newPublishLocationInput );

    var publishLocationCreateButton = new UIButton( strings.getKey( 'sidebar/publish/create' ) ).setClass('ProjectButton');

	function createProject() {
		var title = newPublishLocationInput.getValue();

		newPublishLocationInput.setValue('');
        if ( !title ) {

            alert( 'publish location can not be empty.' );
            return;

        }

        api.post( '/publish/create', { title } ).then( res => {

			if ( res.status == 'limit' ) {

				alert( 'this is a pro feature.' );
				return;

			}
			if(res.status === 'error' && res.msg === 'Username doesnt exists'){
				let username = prompt("To publish apps you first have to create a username. Your username will be part of the link to your app.");
				if(username){
					api.post( '/account/username', { 'profile.username': username } ).then( res => {
						if (res.status == "error") {
							alert(res.msg)
						  }
					});
				}
				return;
			}
			if ( res.status == 'exists' ) {

				alert( 'the name is already taken.' );
				return;

			}

			publishLocationRows.prepend( new SidebarPublishItem( editor, res.publish ) );

        } );
	}
    publishLocationCreateButton.onClick( function () {
		createProject()
    } );
	newPublishLocationRow.add( publishLocationCreateButton );

	var publishLocationRows = new UIDiv();
    container.add( publishLocationRows );

    api.get( '/publish/list' ).then( publishes => {

        publishes.map( publish => {

            publishLocationRows.add( new SidebarPublishItem( editor, publish ) );

        } );

    } ).catch( err => {

		console.error( err );

	} );

	var publishToDesktopRow = new UIRow();
	publishToDesktopRow.add( new UIText( strings.getKey( 'sidebar/publish/desktop' ) ) );
	publishToDesktopRow.setClass('AccordionTitle');

	container.add( publishToDesktopRow );

	var downloadWebFilesRow = new UIRow();

    var spinner = new UIDiv();
    spinner.setClass("w-lightbox-spinner");
    spinner.setDisplay("none");
    spinner.setPosition("inherit");
    spinner.setWidth("15px");
    spinner.setHeight("15px");
    spinner.setMarginTop("4px");
    spinner.setMarginRight("6px"); 

	downloadWebFilesRow.add( new UIText( strings.getKey( 'sidebar/publish/download' ) ) );
	downloadWebFilesRow.setClass('AccordionTitle');

	api.post("/asset/project/allowDownload", {
			test: 1
	}).then(res => {
			if (res.status == 'limit') {
					window.allowDownload = false;
			} else {
				window.allowDownload = true;
			}
	}).catch(err => {
			window.allowDownload = false;
			console.error(err);
	});
	//add click event for download
	downloadWebFilesRow.onClick(function (event) {
				if (!window.allowDownload) {
					$('#pro-popup').css("display", "flex").hide().fadeIn();
					event.preventDefault();
					event.stopPropagation();
					return;

				}else{
					downloadWebFilesRow.add(spinner)
                    spinner.setDisplay("inherit");

					api.post("/asset/project/download", { projectId: editor.projectId })
						.then(res => {})
						.catch(err => {});

						generateDownloadableProject().then(([blob, title])=>{
							saveAs(blob, title);
							spinner.setDisplay("none");

						})
						
				
					
				}
	});

	container.add( downloadWebFilesRow );

	return container;

};

export { SidebarPublish };
