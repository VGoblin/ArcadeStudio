import { UIRow, UIInput, UIDiv, UIButton, UIElement } from '../components/ui.js';
import { UIAccordion } from '../components/ui.openstudio.js';
import { LibraryProjectItem } from './Library.Project.Item.js';
//import { ExamplesFolder } from './Examples/index';
// import RecentsFolder from './Recent';
import ProjectSubfolder from './ProjectSubfolder/index';
import isUIAccordionOpen from './utils/isUIAccordionOpen';

function LibraryProject( editor ) {

    var api = editor.api;
	var strings = editor.strings;
	var signals = editor.signals;

    var container = new UIAccordion().setTitle( strings.getKey( 'library/projects' ) );
    container.addClass("AccordionProject");
    let projectSubfolders = ["Recent"/*, "Examples"*/];

    var projectsContainer = new UIDiv();
    const newProjectBtn = document.createElement("div");
    
    var newProjectRow = new UIRow();
    newProjectRow.addClass( 'ProjectItem' );
    newProjectRow.addClass( 'HasInput' );
    newProjectRow.addClass( 'd-none' );
    container.addToBody( newProjectRow );
    container.addToBody( projectsContainer );

    var newProjectNameInput = new UIInput( '', createProject);
    newProjectNameInput.dom.placeholder = strings.getKey( 'library/projects/new' );
    newProjectRow.add( newProjectNameInput );
    
    var projectCreateButton = new UIButton( strings.getKey( 'library/projects/create' ) ).setClass('ProjectButton');
    projectCreateButton.setPadding('10px');
    function createProject() {
        var name = newProjectNameInput.getValue();
        newProjectNameInput.setValue("");
        if ( !name ) {

            alert( 'project name can not be empty.' );
            return;
            
        }

        api.post( '/asset/project/create', { name: name } ).then( res => {

            if ( res.status == 'limit' ) {

                alert( 'that is a pro feature' );
                return;
                
            }
            if (!isUIAccordionOpen(recentsFolder.accordion)){
                recentsFolder.accordion.title.dom.click()
            }
            $(newProjectBtn).removeClass("d-none");
            $(newProjectRow.dom).addClass("d-none");

            signals.projectAssetAdded.dispatch( res );

        } );

    }
    projectCreateButton.onClick( function () {
        createProject()
    } );
    newProjectRow.add( projectCreateButton );

    {
        const newFolderBtn = document.createElement("div");
        newFolderBtn.className = ("project-button");
        const newFolderContent = document.createElement("div");
        newFolderBtn.appendChild(newFolderContent);
        newFolderContent.id="newFolderBtn";
        newFolderContent.innerHTML='<img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/website/master/control-panel/new-folder.svg">';
        newFolderContent.addEventListener("click", e=>{
            e.stopPropagation();
            // let newFolderName = prompt("Please input the desired name");
            let newFolderName = "Untitled";
            if (newFolderName){
                // if (projectSubfolders.includes(newFolderName)){
                //     return alert("Folder already exists.")
                // }
                while (projectSubfolders.includes(newFolderName)){
                    newFolderName += " copy"
                }
                const newFolder = new ProjectSubfolder(newFolderName, projectSubfolders)
                projectSubfolders.push(newFolderName)
                projectsContainer.add(newFolder.accordion)
            }
        })

        newProjectBtn.className = ("project-button");
        const newProjectContent = document.createElement("div");
        newProjectBtn.appendChild(newProjectContent);
        newProjectContent.id="newProjectBtn";
        newProjectContent.innerHTML='<img src="https://assets.website-files.com/616a041ea72c58e139ed3c8e/616a041ea72c583813ed3ca9_plus.png">';
        newProjectContent.addEventListener("click", e=>{
            e.stopPropagation();
            // $(newProjectBtn).addClass("d-none")
            $(newProjectRow.dom).toggleClass("d-none");
        })

        container.onTitleClick(()=>{
            if (isUIAccordionOpen(container)){
                setTimeout (function() { 
                    newFolderBtn.remove();
                    newProjectBtn.remove();
                }, 300)
            }else{
                container.title.addAction(new UIElement(newProjectBtn))
                container.title.addAction(new UIElement(newFolderBtn))                
            }
        })
    }

    //const examplesFolder = new ExamplesFolder(editor)

    // const oldProject = window.project.stateUrl;
    // if (!oldProject){
    //     examplesFolder.title.dom.click()
    // }

    //projectsContainer.add(examplesFolder);
    // let recentsFolder = new RecentsFolder(editor);
    const recentsFolder = new ProjectSubfolder('Recent', projectSubfolders, false);
    recentsFolder.deletable=false;
    recentsFolder.accordion.title.dom.click();
	projectsContainer.add(recentsFolder.accordion);

    api.get( '/asset/project/list' ).then( projects => {

        projects= Array.from(projects);

        // sort based on last update
        projects.sort((project1, project2) =>{
         
            let project1LatestDate = project1.updatedAt || project1.createdAt; 
            let project2LatestDate = project2.updatedAt || project2.createdAt; 

            if (!project1LatestDate) return -1;
            if (!project2LatestDate) return 1;

            return new Date(project1LatestDate) - new Date(project2LatestDate)

        })
        // projects.reverse()
        projects.map(project => {
            addProject(project)
        } );

    } ).catch( err => {

		console.log( err );

    } );

    function addProject(project){
        if (!project.category || project.category === "recent"){
            recentsFolder.accordion.prependToBody(new LibraryProjectItem(editor, project));
        } else{
            if (!projectSubfolders.includes(project.category)){
                projectSubfolders.push(project.category)
                const newFolder = new ProjectSubfolder(project.category, projectSubfolders)
               newFolder.accordion.prependToBody(new LibraryProjectItem(editor, project));
                projectsContainer.add(newFolder.accordion)
            } else {
                const existingFolder = document.getElementById(`projectSubFolder-${project.category}`);
                let body = existingFolder.querySelector(".AccordionBody");
                const {firstChild} = body;
                if (firstChild){
                    body.insertBefore(new LibraryProjectItem(editor, project).dom, firstChild)
                }else{
                    body.appendChild(new LibraryProjectItem(editor, project).dom)
                }
            }
        }
    }
   
    
    signals.projectAssetAdded.add( function ( newProject ) {
        addProject(newProject)
    } );
    signals.projectsSubFolderAdded.add( function ( folder ) {
        projectSubfolders.push(folder)
    } );
    signals.projectsSubFolderRemoved.add( function ( folder ) {
        const index = projectSubfolders.indexOf(folder)
        if (index >-1){
            projectSubfolders.splice(index,1)
        }
    } );

    // signals.addRecentProject.add( function ( newProject ) {

    //     // projectsContainer.prepend( new LibraryProjectItem( editor, newProject ) );
    //     recentsFolder.prependToBody(new LibraryProjectItem(editor, newProject));

    // } );

    return container;

}

export { LibraryProject };
