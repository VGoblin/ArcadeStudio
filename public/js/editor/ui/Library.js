
import { UIDiv, UIPanel } from './components/ui.js';
import { LibraryComponentActionBar } from './library/Library.Component.ActionBar.js';
import { LibraryProject } from './library/Library.Project.js';
import { LibraryTool } from './library/Library.Tool.js';
import { LibraryGeometry } from './library/Library.Geometry.js';
import { LibraryMaterial } from './library/Library.Material.js';
import { LibraryImage } from './library/Library.Image.js';
import { LibraryAudio } from './library/Library.Audio.js';
import { LibraryVideo } from './library/Library.Video.js';
import { LibraryEnvironmentWrap } from './library/Library.EnvironmentWrap.js';
import { LibraryTransition } from './library/Library.Transition.js';
import { LibraryAnimation } from './library/Library.Animation.js';
//import { ExamplesFolder } from './library/Examples/index.ts';

var Library = function ( editor ) {

	var strings = editor.strings;
	var signals = editor.signals;

	var container = new UIPanel();
	container.setId( 'library' );
	container.addClass( 'opened' );
	
	var actionBar = new LibraryComponentActionBar( editor );
	actionBar.dom.style.background = "black";
	
	var libraryPanel = new UIPanel();
	libraryPanel.addClass( 'Library' );
	libraryPanel.addClass( 'AccordionList' );
	libraryPanel.addClass( 'flex-1' );
	libraryPanel.dom.style.overflow = 'scroll';

	var proPanel = $(".pro-panel");
	proPanel.appendTo(libraryPanel.dom);
	proPanel.removeClass("d-none");

	var learnPanel = $(".Accordion.js-accordion-item.learn");
	var title = $(learnPanel.find(".AccordionTitle")[0]);
	var body = $(learnPanel.find(".AccordionBody")[0]);
	title.on("click", function () {
		var activeBody = $(libraryPanel.dom).closest( '.AccordionList' ).find( `.AccordionBody.active[data-accordion-group='defaultAccordionGroup']` )[ 0 ];
		var activeTitle = $(libraryPanel.dom).closest( '.AccordionList' ).find( `.AccordionTitle.active[data-accordion-group='defaultAccordionGroup']` )[ 0 ];
		if ( activeBody && body[0] != activeBody ) {
			$( activeTitle ).removeClass( 'active' );
			$( activeBody ).removeClass( 'active' );
			$( activeBody ).slideUp();
		}
		$(".AccordionActions .project-button").remove();
		title.toggleClass( 'active' );
		body.toggleClass( 'active' );
		body.slideToggle();
	} );
	learnPanel.appendTo(libraryPanel.dom);
	learnPanel.removeClass("d-none");

	libraryPanel.add( new LibraryProject( editor ) );
	libraryPanel.add( new LibraryTool( editor ) );
	libraryPanel.add( new LibraryGeometry( editor ) );
	libraryPanel.add( new LibraryMaterial( editor ) );
	libraryPanel.add( new LibraryImage( editor ) );
	libraryPanel.add( new LibraryAudio( editor ) );
	libraryPanel.add( new LibraryVideo( editor ) );
	libraryPanel.add( new LibraryAnimation( editor ) );
	libraryPanel.add( new LibraryEnvironmentWrap( editor ) );
	// libraryPanel.add( new LibraryTransition( editor ) );

	var footerPanel = new UIDiv();
	footerPanel.addClass("Accordion");
	footerPanel.addClass("control-pannel-footer");

	var homeBtn = new UIDiv();
	homeBtn.addClass("item");
	homeBtn.setId("home");
	homeBtn.dom.innerHTML = '<img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/website/master/control-panel/icon-home.svg" width="20" alt="home">';
	footerPanel.add(homeBtn);
	homeBtn.onClick((e) => {
		window.location.href = "/";
	});

	var div = new UIDiv();
	div.setClass("flex-1");
	footerPanel.add(div);

	var privacyBtn = new UIDiv();
	privacyBtn.addClass("item");
	privacyBtn.setId("privacy-terms");
	privacyBtn.dom.innerHTML = '<img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/website/master/control-panel/icon-info.svg" width="20" alt="privacy">';
	footerPanel.add(privacyBtn);

	var profileBtn = new UIDiv();
	profileBtn.addClass("item")
	profileBtn.setId("profileBtn");
	profileBtn.dom.setAttribute("data-target", "/create/portfolio");
	profileBtn.dom.innerHTML = '<img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/website/master/control-panel/icon-portfolio.svg" width="20" alt="portfolio">';
	footerPanel.add(profileBtn);
	profileBtn.onClick((e) => {
		signals.updateWorkspace.dispatch('jsfxraudioHide');
		signals.updateWorkspace.dispatch('aitoolHide');
		signals.updateWorkspace.dispatch('scriptHide');
		
		if ($(".Panel#frame iframe")[0].src != '/create/portfolio') {
			$(".Panel#frame iframe")[0].src = '/create/portfolio';
			$(".Panel#frame iframe")[0].style.opacity = 0;
			$(".Panel#frame iframe").one("load", function() {
				$(".Panel#frame iframe")[0].style.opacity = 1;
			})
			if ($(".Panel#frame")[0].style.display = 'none')
				signals.updateWorkspace.dispatch( 'frame' );
		}
	});

	var accountBtn = new UIDiv();
	accountBtn.setId("accountBtn");
	accountBtn.addClass("item");
	accountBtn.dom.setAttribute("data-target", "/create/account");
	accountBtn.dom.innerHTML = '<img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/website/master/control-panel/icon-account.svg" width="20" alt="account">';
	footerPanel.add(accountBtn);
	accountBtn.onClick((e) => {
		signals.updateWorkspace.dispatch('jsfxraudioHide');
		signals.updateWorkspace.dispatch('aitoolHide');
		signals.updateWorkspace.dispatch('scriptHide');

		if ($(".Panel#frame iframe")[0].src != '/create/account') {
			$(".Panel#frame iframe")[0].src = '/create/account';
			$(".Panel#frame iframe")[0].style.opacity = 0;
			$(".Panel#frame iframe").one("load", function() {
				$(".Panel#frame iframe")[0].style.opacity = 1;
			})
			if ($(".Panel#frame")[0].style.display = 'none')
				signals.updateWorkspace.dispatch( 'frame' );
		}
	});

	var chatBtn = new UIDiv();
	chatBtn.setId("chat");
	chatBtn.addClass("item");
	chatBtn.dom.innerHTML = '<img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/website/master/control-panel/icon-chat.svg" width="24" alt="chat">';
	footerPanel.add(chatBtn);
	chatBtn.onClick((e) => {

	});

	container.add( actionBar );
	container.add( libraryPanel );
	container.add( footerPanel );

	return container;

};

export { Library };
