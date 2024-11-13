/**
 * @author codelegend620
 */

import { UIRow, UIText, UIDiv, UIImageButton } from '../components/ui.js';
import generateDownloadableProject from '../utils/generateDownloadableProject.js';

function SidebarPublishItem( editor, publish ) {

    var api = editor.api;
    var config = editor.config;
    var strings = editor.strings;

    var container = new UIRow().addClass( 'ProjectItem' );
    var publishLocation = new UIText( publish.title );
	container.add( publishLocation );
	
    var buttonGroup = new UIDiv().setClass( 'ProjectButtonGroup' );
    container.add( buttonGroup );

    var publishButton = new UIImageButton( config.getImage( 'engine-ui/publish-btn.svg') );

    var spinner = new UIDiv();
    spinner.setClass("w-lightbox-spinner");
	spinner.setDisplay("none");
    spinner.setPosition("inherit");
    spinner.setWidth("15px");
    spinner.setHeight("15px");
    spinner.setMarginTop("8px");
    spinner.setMarginRight("6px");
	buttonGroup.add(spinner);

    publishButton.onClick( function () {
        const confirmed = confirm(`please confirm you would like to publish this project to ${publish.title} this will override existing files.`);
        if(confirmed){
        spinner.setDisplay("inherit");
        publishButton.setDisplay("none");
        api.save( '/asset/project/state', { id: editor.projectId, state: editor.toJSON(), waitUpload: true } ).then(async function () {

            console.log( 'state is saved successfully.');
         
            let postData = new FormData();
            postData.append('id', project.id);
            postData.append('slug', publish.slug);

            const [zipFile] = await generateDownloadableProject()

            postData.append('zipFile', zipFile);


            api.post( '/publish',postData ).then( function ( res ) {
                spinner.setDisplay("none");
                publishButton.setDisplay("inherit");
                alert( res.message );

            } ).catch( (err) => {

                alert( err );

            } );

        } ).catch( (err) => {
            console.error(err);
            alert( 'Error encountered while publishing the project. Please try again.' );

        } );

    }
        /*api.post( '/publish', { id: project.id, slug: publish.slug } ).then( function ( res ) {

            alert( res.msg );

        } ).catch( (err) => {
    
            alert( err );

        } );*/
        
    } );
    buttonGroup.add(publishButton);

    var visitButton = new UIImageButton( config.getImage( 'engine-ui/visit-btn.svg') );
    visitButton.onClick( function () {

		window.open(`/${publish.slug}`, '_blank');

    } );
    buttonGroup.add(visitButton);

    var deleteButton = new UIImageButton( config.getImage( 'engine-ui/delete-icon.svg') );
    deleteButton.onClick( function () {

        if ( confirm( 'are you sure to delete this publish location?' ) ) {

            api.post( '/publish/delete', { id: publish.id } ).then( function () {

                container.delete();
    
            } ).catch( (err) => {
    
                alert( err );
    
            } );

        }

    } );
    buttonGroup.add(deleteButton);

	return container;

};

export { SidebarPublishItem };
