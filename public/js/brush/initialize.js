import './fabric.brushes.js'

export const brushPath = "brush.json";

export const shapes = [
	"/images/shapes/Eraser-brush.jpg",
	"/images/shapes/Sauce-brush.jpg",
];

export const textures = [
	"/images/textures/none.jpg",
];

export const effects = [
	"/images/effects/none.jpg",
	"/images/effects/3d-brush-effect.jpg"
];

export var bcolor = '#f4a730';
export var scolor = '#0ab3ff';
export var bwidth = 0.35;
export var bopacity = 1;
export var bsoftness = 0.3;
var guiCurBrush = null;

export const DatGui = (props, _fabricCanvas) => {
	let fabricCanvas = _fabricCanvas;
	let currentBrush = null;
	guiCurBrush = props;
	const gui = new dat.GUI({autoPlace:false});

	for (let p in props) {
		gui['brush'+p.charAt(0).toUpperCase() + p.slice(1)] = props[p];
	}

	var makeBrush = (brushName) => {

		localStorage.setItem("CurBrush", brushName);
		fabricCanvas.isDrawingMode = true;
		let brushOpts = JSON.parse(localStorage.getItem(brushName) || "{}");
		brushOpts.color = bcolor;
		brushOpts.scolor = scolor;
		brushOpts.width = bwidth;
		brushOpts.opacity = bopacity;
		brushOpts.softness = bsoftness;
		brushOpts.brushCol = shapes[brushOpts.brushCol];
		brushOpts.patternCol = textures[brushOpts.patternCol];
		brushOpts.effectCol = effects[brushOpts.effectCol];
		if (brushOpts.grainEffect == 2 || brushOpts.outline_size > 0 || brushOpts.d3_effect)
		{
			fabricCanvas.freeDrawingBrush.convertToImg();
		}
		fabricCanvas.freeDrawingBrush = new fabric['CustomBrush'](fabricCanvas, brushOpts);
		currentBrush = fabricCanvas.freeDrawingBrush;
	}

	function addButtons() {
		gui.clear = () => {
			fabricCanvas.clear();
			if (fabricCanvas.freeDrawingBrush.brush != undefined)
                fabricCanvas.freeDrawingBrush.brush.setClear();
		}
		gui.setting = () => {
			window.location.href = "/draw/brushlab";
			window.location.reload();
		}
		gui.save = () => {
			fabricCanvas.freeDrawingBrush.convertToImg();
			setTimeout(() => {
				const a = document.createElement('a');
				a.download = 'sample.png';
				a.href = fabricCanvas.toDataURL({multiplier: 2});
				a.click();
			}, 500);
		}
		gui.stopDraw = () => {
			currentBrush = fabricCanvas.freeDrawingBrush;
			fabricCanvas.isDrawingMode = false;
			fabricCanvas.freeDrawingBrush.convertToImg();
		}
		gui.startDraw = () => {
			fabricCanvas.isDrawingMode = true;
			fabricCanvas.freeDrawingBrush = currentBrush;
		}
		gui.EraseBrush = () => {
			let objs = fabricCanvas.getObjects();
			objs.forEach((obj, index) => {
				if (!obj.layerid)
					fabricCanvas.remove(obj);
				else {
					var rect = obj.getBoundingRect();
					obj.orgLeft = Math.floor(rect.left);
					obj.orgTop = Math.floor(rect.top);
					obj.orgWidth = Math.floor(rect.width);
					obj.orgHeight = Math.floor(rect.height);
				}
			})
			gui.startDraw();
			setTimeout(()=> {
				makeBrush("EraserBrush");
			}, 100);
		}
		gui.UndoBrush = () => {
			fabricCanvas.freeDrawingBrush.convertToImg();
			fabricCanvas.isDrawingMode = true;
			var width = fabricCanvas.freeDrawingBrush.width * 200;
			fabricCanvas.freeDrawingBrush = new fabric.EraserBrush(fabricCanvas);
			fabricCanvas.freeDrawingBrush.width = width;
			fabricCanvas.freeDrawingBrush.inverted = true;
			currentBrush = fabricCanvas.freeDrawingBrush;
		}

		window.addEventListener("save-doc", function (e) {
			gui.save();
		})

		window.addEventListener("erase-draw", function (e) {
			gui.EraseBrush();
		});

		window.addEventListener("start-draw", function (e) {
			gui.startDraw();
			makeBrush("SauceBrush");
		})

		window.addEventListener("stop-draw", function (e) {
			gui.stopDraw();
		})

		// $(document).on("click", ".brush-drawer-mainitem", function (e) {
		// 	makeBrush($(this).attr("data-name"));
		// 	gui.startDraw();
		// 	$(".brush-drawer-mainitem").removeClass("menu-selected");
		// 	$(this).addClass("menu-selected");
		// });

		// $.getJSON("/static/" + brushPath, function (data) {
		// 	$.each( data, function( key, val ) {
		// 		if ($("[data-tab='" + val.category + "']").length == 0)
		// 		{
		// 			$('.brush-categories').append('<div class="brush-drawer-menu" data-tab="' + val.category + '">' + val.category.replace("_", " ") + '</div>');
		// 		}
		// 		if ($("#" + val.category).length == 0)
		// 		{
		// 			$(".brush-picker-content").append('<div class="col-8 m-0 drawer-mainpanel brush-items scrollbar8" id="' + val.category + '"></div>');
		// 		}
		// 		var brushitem = $(`<div class="brush-drawer-mainitem ` + key + `" data-name="` + key + `">
		// 			<div class="brush-drawer-mainitem-upward">` + key + `<img class="edit-brush" src="/images/icons/small-edit.png"/></div>
		// 			<img class="brush-drawer-mainitem-downward" src="/images/icons/brush-sample.png">
		// 		</div>`);
		// 		$("#" + val.category).append(brushitem);
		// 	});

		// 	$(".brush-drawer-menu").click(function(e){
		// 		$(".brush-drawer-menu").removeClass("menu-selected");
		// 		$(this).addClass("menu-selected");
		// 		let id = $(this).attr("data-tab");
		// 		$(".brush-items").css("display", "none");
		// 		$("#" + id).css("display", "block");
		// 	});

		// 	$("[data-tab='" + guiCurBrush.category + "']").click();
		// 	$(".brush-drawer-mainitem." + guiCurBrush.brushName).click();
		// });
	}

	return {
		addButtons,
		getGui: () => {
			return gui;
		}
	}
};
export var fabricCanvas = null;
export const getFabricCanvas = (canvasID, brushName, brushOpts) => {
	fabricCanvas = new fabric.Canvas(canvasID, {
		isDrawingMode: true,
		// renderOnAddRemove: false,
		noScaleCache: false,
		cacheProperties: (
			'fill stroke strokeWidth strokeDashArray width height stroke strokeWidth strokeDashArray' +
			' strokeLineCap strokeLineJoin strokeMiterLimit fillRule backgroundColor'
		  ).split(' '),
		dirty: true,
		needsItsOwnCache: function() {
			return false;
		},
		perfLimitSizeTotal : 2097152,
		maxCacheSideLimit: 4096,
		minCacheSideLimit: 256,
	});
	// fabricCanvas.setWidth($(".imageSection")[0].clientWidth).setHeight($(".imageSection")[0].clientHeight);
	fabric.util.enlivenObjects([{}, {}, {}], (objs) => {
		objs.forEach((item) => {
			fabricCanvas.add(item);
		});
		fabricCanvas.renderAll(); // Make sure to call once we're ready!
	});
	fabric.Object.prototype.objectCaching = true;
	fabricCanvas.freeDrawingBrush = new fabric[brushName](fabricCanvas, brushOpts || {});

	window.addEventListener("resize", (e) => {
		fabricCanvas.setWidth($(".imageSection")[0].clientWidth).setHeight($(".imageSection")[0].clientHeight);
	});

	return fabricCanvas;
};

export const setBrushWidth = (val) => {
	bwidth = val;
};

export const setBrushColor = (val) => {
	bcolor = val;
};

export const setSecondaryColor = (val) => {
	scolor = val;
};

export const setBrushOpacity = (val) => {
	bopacity = val;
};

export const setBrushSoftness = (val) => {
	bsoftness = val;
};