import { UIDiv, UIPanel } from './components/ui.js';

function Frame( editor ) {

	var strings = editor.strings;
	var signals = editor.signals;

	var container = new UIPanel();
    container.setId( 'frame' );
    container.setDisplay( 'none' );
	container.dom.style.background = 'black';

	var frameContainer = document.createElement("iframe");
	frameContainer.src = "/create/portfolio";
	frameContainer.style.border = 'none';
	frameContainer.style.zIndex = '1';
	frameContainer.height = '100%';
	
	var topBar = document.createElement("div");
	topBar.className = "topbar";

	var closeBtn = document.createElement("div");
	closeBtn.className = "popup-close";
	closeBtn.innerHTML = '<img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/delete-icon.svg" width="15" height="15" alt="">';

	closeBtn.onclick = function(e) {
		signals.updateWorkspace.dispatch('frameHide');
	}

	var spinner = document.createElement("div");
	spinner.className = "w-lightbox-spinner";

	container.dom.appendChild( topBar );
	container.dom.appendChild( closeBtn );
	container.dom.appendChild( spinner );
	container.dom.appendChild( frameContainer );

	return container;

}

export { Frame };
