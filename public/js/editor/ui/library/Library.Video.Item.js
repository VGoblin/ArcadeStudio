import { UILazyVideo } from "../components/ui.js";
import { LibraryBaseItem } from "./Library.Base.Item.js";

function LibraryVideoItem(editor, item) {

	LibraryBaseItem.call(this, item);

	var scope = this;
	var api = editor.api;
	var assets = editor.assets;
	var signals = editor.signals;
	scope.menu.hideOption('addScene');
	scope.container.addClass('Video');
	scope.container.addClass('Video'+item.id);

	scope.thumbnail = new UILazyVideo(item.thumbnail, item.url).addClass('Thumbnail');
	scope.container.add(scope.thumbnail);

	scope.addedToProjectIcon.addClass('VideoImageEnv');
	scope.addToProjectButton.addClass('VideoImageEnv');

	scope.container.onClick( function (e) {
		// Only execute this function when the Shift key is held down
		if (e.shiftKey) {
		scope.setLoading( true );

		fetch( item.url )
			.then( res => res.blob() )
			.then( blob => {

				//var asset = assets.uploadVideo( item.thumbnail, item.url  );

				var modifiedName = item.name.split(".").slice(0, -1).join(".");

				var asset = assets.uploadVideo( item.name, item.url, modifiedName );
				var file = new File( [ blob ], item.name, { type: blob.type } );
				var formData = new FormData();
				formData.append( 'type', 'Video' );
				formData.append( 'projectId', editor.projectId );
				formData.append( 'file', file );

				api.post( '/asset/my-video/upload', formData ).then( res => {

					scope.setLoading( false );

					asset.id = res.files[ 0 ].id;
					asset.videoId = res.files[ 0 ].videoId;

					signals.videoAssetAdded.dispatch( asset, 0 );

				} );

			});
		}
	} );

	let draggedImage = null;

	scope.container.dom.addEventListener('dragstart', function (e) {
		console.log("video dragged", item);
		draggedImage = document.createElement("div");

		var dragIcon = document.createElement("img");
		dragIcon.src = item.thumbnail;
		dragIcon.style.width = "40px";
		dragIcon.style.height = "40px";
		draggedImage.appendChild(dragIcon);
		draggedImage.style.position = "absolute";
		draggedImage.style.top = "0px";
		draggedImage.style.left = "-1000px";
		document.querySelector('body').appendChild(draggedImage);
		e.dataTransfer.setDragImage(draggedImage, 0, 0);
	});

	scope.container.dom.addEventListener('dragend', function (e) {
		// if draggedImage element is still present remove it 
		if (draggedImage) {
			document.querySelector('body').removeChild(draggedImage);
			draggedImage = null;
		}
	});
	scope.updateAddButton(false);

	scope.menu.onDownload(function () {
			if(window.subscriptionSet){
				downloadImage(item.url, item.name);
				scope.menu.container.setDisplay('none');
			}else{
				$('#pro-popup').css("display", "flex").hide().fadeIn();
				scope.menu.container.setDisplay('none');
			}

	})

	function downloadImage(url, filename) {
		var xhr = new XMLHttpRequest();
		xhr.responseType = 'blob';
		xhr.onload = function () {
			var a = document.createElement('a');
			a.download = filename;
			a.href = window.URL.createObjectURL(xhr.response);
			document.body.appendChild(a);
			a.click();
		};
		xhr.open('GET', url);
		xhr.send();
	}

	scope.menu.onSendToFolder(function (e) {
		scope.setLoading(true);
		api.get(`/asset/my-video/${editor.projectId}`).then(function (foldersList) {

			console.log("Folders List", foldersList, e);
			scope.menu.container.setDisplay('none');
			if (foldersList.length > 1) {
				const menu = document.createElement('div');
				menu.setAttribute('id', 'videoFolderMenu');
				menu.classList.add('FolderItemMenu');

				var { top, left } = scope.container.dom.getBoundingClientRect();
				// Clear previous menu items and remove the menu element
				const videoFolderMenu = document.getElementById('videoFolderMenu');
				if (videoFolderMenu) {
					while (videoFolderMenu.firstChild) {
						videoFolderMenu.removeChild(videoFolderMenu.firstChild);
					}
					videoFolderMenu.remove();
				}
				$('.Video'+item.id).append(menu);
				$('#videoFolderMenu').css({
					left: (20) + 'px',
					top: (e.clientY -top) + 'px'
				});
				$('#videoFolderMenu').css('display', 'block');
				console.log("Top", top, " Left", left);
				foldersList.forEach(folder => {
					const menuItem = document.createElement('div');
					// menuItem.classList.add('menu-item');
					menuItem.innerText = folder.name;
					menuItem.addEventListener("click", () => {
						console.log(`Menu item with id ${folder.id} clicked!`);
						moveToFolder(folder.id);

					});
					menu.appendChild(menuItem);
				});

				scope.setLoading(false);
			}
			else {

				scope.setLoading(true);

				fetch(item.url)
					.then(res => res.blob())
					.then(blob => {

						//var asset = assets.uploadVideo( item.thumbnail, item.url  );

						var modifiedName = item.name.split(".").slice(0, -1).join(".");

						var asset = assets.uploadVideo(item.name, item.url, modifiedName);
						var file = new File([blob], item.name, { type: blob.type });
						var formData = new FormData();
						formData.append('type', 'Video');
						formData.append('projectId', editor.projectId);
						formData.append('file', file);

						api.post('/asset/my-video/upload', formData).then(res => {

							scope.setLoading(false);

							asset.id = res.files[0].id;
							asset.videoId = res.files[0].videoId;

							signals.videoAssetAdded.dispatch(asset, 0);

						});

					});
			}


		}).catch((err) => {

			alert(err);
			scope.setLoading(false);
			scope.menu.container.setDisplay('none');
		});
	});

	function moveToFolder(assetFolderId) {

		scope.setLoading(true);

		

		fetch(item.url)
		.then(res => res.blob())
		.then(blob => {

			//var asset = assets.uploadVideo( item.thumbnail, item.url  );

			var modifiedName = item.name.split(".").slice(0, -1).join(".");

			var asset = assets.uploadVideo(item.name, item.url, modifiedName);
			var file = new File([blob], item.name, { type: blob.type });
			var formData = new FormData();
			formData.append('type', 'Video');
			formData.append('projectId', editor.projectId);
			formData.append('file', file);

			api.post('/asset/my-video/upload', formData).then(res => {

				scope.setLoading(false);

				asset.id = res.files[0].id;
				asset.videoId = res.files[0].videoId;

				signals.videoAssetAdded.dispatch(asset, assetFolderId);

			});

		});
	}
	return this;

}

LibraryVideoItem.prototype = Object.create(LibraryBaseItem.prototype);
LibraryVideoItem.prototype.constructor = LibraryVideoItem;

export { LibraryVideoItem };
