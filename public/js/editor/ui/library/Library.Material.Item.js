import { UILazyImage, UIText } from "../components/ui.js";
import { LibraryBaseItem } from "./Library.Base.Item.js";

function LibraryMaterialItem(editor, item) {

	LibraryBaseItem.call(this, item);

	var scope = this;
	var api = editor.api;
	var signals = editor.signals;
	var assets = editor.assets;

	scope.menu.hideOption('addScene');

	scope.container.addClass('Geometry');
	scope.container.addClass('Material'+item.id);
	scope.thumbnail = new UILazyImage(item.thumbUrl).addClass('Thumbnail');
	scope.text = new UIText(item.name);

	scope.container.add(scope.thumbnail, scope.text);

	scope.addedToProjectIcon.addClass('GeometryMaterial');
	scope.addToProjectButton.addClass('GeometryMaterial');

	scope.container.dom.draggable = true;

	scope.container.dom.addEventListener('dragstart', function (e) {

		var asset = editor.assets.get('Material', 'materialId', item.id);

		e.dataTransfer.setData('assetType', 'Material');

		var assetId;

		if (typeof asset == "undefined") {

			assetId = item.id;

			e.dataTransfer.setData('assetType', 'Material');

		} else {

			assetId = asset.id;

		}

		e.dataTransfer.setData('assetId', assetId);

	}, false);

	scope.container.dom.addEventListener('dragend', function (e) {

		var asset = editor.assets.get('Material', 'materialId', item.id);

		if (typeof asset == 'undefined') {

			scope.setLoading(true);

			setTimeout(() => {

				var asset = editor.assets.get('Material', 'materialId', item.id);

				if (typeof asset != 'undefined') {

					scope.setLoading(false);

					scope.updateAddButton(true);

				} else {
					console.log('not fine');
				}

				scope.setLoading(false);

			}, 3500);
		}
	}, false);

	scope.container.onClick(function (e) {
	// Only execute this function when the Shift key is held down
	if (e.shiftKey) {
		if (!scope.status) {

			scope.setLoading(true);

			api.post('/asset/my-material/add', { id: item.id, projectId: editor.projectId, folderId: 0 }).then(function (material) {

				editor.addAsset('Material', 0, material).then(function (asset) {

					scope.setLoading(false);
					scope.updateAddButton(true);

					signals.materialAssetAdded.dispatch(asset, 0);

				});

			}).catch((err) => {

				alert(err);
				scope.setLoading(false);

			});

		}
	}

	});
	scope.updateAddButton(assets.get('Material', 'materialId', item.id) != null);

	scope.menu.onSendToFolder(function (e) {
		
		scope.setLoading(true);
		api.get(`/asset/my-material/${editor.projectId}`).then(function (foldersList) {

			console.log("Folders List", foldersList, e);
			scope.menu.container.setDisplay('none');
			if (foldersList.length > 1) {
				const menu = document.createElement('div');
				menu.setAttribute('id', 'materialFolderMenu');
				menu.classList.add('FolderItemMenu');

				var { top, left } = scope.container.dom.getBoundingClientRect();
				// Clear previous menu items and remove the menu element
				const materialFolderMenu = document.getElementById('materialFolderMenu');
				if (materialFolderMenu) {
					while (materialFolderMenu.firstChild) {
						materialFolderMenu.removeChild(materialFolderMenu.firstChild);
					}
					materialFolderMenu.remove();
				}
				$('.Material'+item.id).append(menu);
				$('#materialFolderMenu').css({
					left: (20) + 'px',
					top: (e.clientY -top) + 'px'
				});
				$('#materialFolderMenu').css('display', 'block');
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

				if (!scope.status) {

					scope.setLoading(true);

					api.post('/asset/my-material/add', { id: item.id, projectId: editor.projectId, folderId: 0 }).then(function (material) {

						editor.addAsset('Material', 0, material).then(function (asset) {

							scope.setLoading(false);
							scope.updateAddButton(true);

							signals.materialAssetAdded.dispatch(asset, 0);

						});

					}).catch((err) => {

						alert(err);
						scope.setLoading(false);

					});

				}
			}


		}).catch((err) => {

			alert(err);
			scope.setLoading(false);
			scope.menu.container.setDisplay('none');
		});
	});
	

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

	function moveToFolder(assetFolderId) {
		scope.menu.container.setDisplay('none');
		scope.setLoading(true);

		api.post('/asset/my-material/add', { id: item.id, projectId: editor.projectId, folderId: assetFolderId }).then(function (material) {

			
			editor.addAsset('Material', assetFolderId, material).then(function (asset) {

				scope.setLoading(false);
				scope.updateAddButton(true);
				scope.menu.container.setDisplay('none');
				signals.materialAssetAdded.dispatch(asset, assetFolderId);
				$('#materialFolderMenu').css('display', 'none');
			});
			

		}).catch((err) => {

			alert(err);
			scope.setLoading(false);
			$('#materialFolderMenu').css('display', 'none');
		});
	}

	return this;

}

LibraryMaterialItem.prototype = Object.create(LibraryBaseItem.prototype);
LibraryMaterialItem.prototype.constructor = LibraryMaterialItem;

export { LibraryMaterialItem };
