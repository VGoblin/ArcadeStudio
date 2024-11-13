var croquis = null;
var CustomBrush = fabric.util.createClass(fabric.BaseBrush, {
	color: '#000',
	scolor: '#000',
	opacity: 1,
	width: 0,
	_latestStrokeLength: 0,
	_point: null,
	_latest: null,
	_drawn: false,
	_count: 0,
	_imgload: false,
	_patternload: false,
	ctx: null,
	image: null,
	effectImage: null,
	pattern: null,
	brush: null,
	brushCol: null,
	patternCol: null,
	effectCol: null,
	opt: null,
	tp: 0,
	dp: 1,

	initialize: function (canvas, opt) {
		this.opt = opt || {};
		this.canvas = canvas;
		this.ctx = this.canvas.contextTop;
		this.width = opt.width || canvas.freeDrawingBrush.width;
		this.softness = opt.softness || canvas.freeDrawingBrush.softness;
		this.color = opt.color || canvas.freeDrawingBrush.color;
		this.scolor = opt.scolor || canvas.freeDrawingBrush.scolor;
		this.opacity = opt.opacity || canvas.contextTop.globalAlpha;
		this.brushCol = opt.brushCol || this.brushCol;
		this.patternCol = opt.patternCol || this.patternCol;
		this.effectCol = opt.effectCol || this.effectCol;
		this._point = new fabric.Point(0, 0);

		// Initialize croquis
		croquis = new Croquis(this.canvas,  opt, ()=> {this.convertToImg();});
		// croquis.lockHistory();
		// croquis.setCanvasSize(640, 480);
		// croquis.addLayer();
		// croquis.fillLayer('#fff');
		// croquis.selectLayer(0);
		// croquis.unlockHistory();
		this.brush = new Croquis.Brush();
		///////////////////////////////////////brush setting/////////////////////////////////////////////
		this.brush.setSpacing(opt.stroke_spacing * 0.01 || 0.02); //0~100% distance between stamps
		this.brush.setNormalSpread(opt.stroke_jitter * 0.02 || 0);//0-10
		this.brush.setTangentSpread(opt.stroke_jitter * 0.02 || 0);//0-10 
		this.brush.setFallOff(opt.stroke_falloff * 0.01 || 0);//0-100%
		this.brush.setTaperMinAmount(opt.taper_min_amount * 0.01 || 0);
		this.brush.setTaperMaxAmount(opt.taper_max_amount * 0.01 || 1);
		this.brush.setTaperSize(opt.taper_size * 0.01 || 0);
		this.brush.setTaperOpacity(opt.taper_opacity * 0.01 || 0);
		this.brush.setTaperTip(opt.taper_tip * 0.01 || 0);
		this.brush.setOutlineSize(opt.outline_size * 0.01 || 0);
		this.brush.setOutlineContour(opt.outline_contour * 0.01 || 0);
		this.brush.setOutlinePlacement(opt.outline_placement * 0.01 || 0);
		this.brush.setShapeCount(opt.shape_count * 0.2 || 0);
		this.brush.setShapeCountJitter(opt.shape_countJitter * 0.01 || 0);//0~100%
		this.brush.setShapeRotation(opt.shape_rotation * 0.01 || 0); //-100%~100% rotate direction
		this.brush.setShapeScatter(opt.shape_scatter * 3.6 || 0); //rotate randomized
		this.brush.setShapeAzimuth(opt.shape_azimuth || false);
		this.brush.setShapeRandomized(opt.shape_randomized || false);
		this.brush.setShapeFlipX(opt.shape_flipX || false);
		this.brush.setShapeFlipY(opt.shape_flipY || false);
		this.brush.setGrainEffect(opt.grainEffect || 0);
		this.brush.setD3Effect(opt.d3_effect || false);
		this.brush.setGrainMovement(opt.moving_movement * 0.01 || 1);
		this.brush.setGrainMoveScale(opt.moving_scale * 0.01 || 1); //0~100%
		this.brush.setGrainMoveZoom(opt.moving_zoom * 0.01 || 1); //0~100%
		this.brush.setGrainMoveRotation(opt.moving_rotation * 3.6 || 0); //-100%~100%
		this.brush.setGrainMoveDepth(opt.moving_depth * 0.01|| 1); //0~100%
		this.brush.setGrainMoveOffsetJitter(opt.moving_offset_jitter || false);
		this.brush.setGrainTexScale(opt.texture_scale * 0.01 || 1); //0~100%
		this.brush.setGrainTexDepth(opt.texture_depth * 0.01 || 1); //0~100%
		this.brush.setGrainTexContrast(opt.texture_contrast * 0.01 || 0); //-100%~100%
		this.brush.setGrainTexBrightness(opt.texture_brightness * 0.01 || 0); //-100%~100%
		this.brush.setDynamicSpeedSize(opt.dynamics_speedSize * 0.01 || 0); //-100%~100% stamp size relative to speed
		this.brush.setDynamicSpeedOpacity(opt.dynamics_speedOpacity * 0.01 || 0); //-100%~100% stamp opacity relative speed
		this.brush.setDynamicPressureSize(opt.dynamics_pressureSize * 0.01 || 0); //-100%~100% stamp size relative to pressure
		this.brush.setDynamicPressureOpacity(opt.dynamics_pressureOpacity * 0.01 || 0); //-100%~100% stamp opacity relative pressure
		this.brush.setDynamicJitterSize(opt.dynamics_jitterSize * 0.01 || 0); //0~100% random stamp size
		this.brush.setDynamicJitterOpacity(opt.dynamics_jitterOpacity * 0.01 || 0); //0~100% random stamp opacity
		this.brush.setDynamicBrushMaxSize(opt.brush_max_size * 0.01 || 1); //100%-500%
		this.brush.setDynamicBrushMinSize(opt.brush_min_size * 0.01 || 0);	//100%-500%
		this.brush.setDynamicBrushMaxOpacity(opt.brush_max_opacity * 0.01 || 1); //0~100%
		this.brush.setDynamicBrushMinOpacity(opt.brush_min_opacity * 0.01 || 0); //0~100%
		this.brush.setStampHue(opt.stamp_hue * 0.01 || 0); //0~100%
		this.brush.setStampSaturation(opt.stamp_saturation * 0.01 || 0); //0~100%
		this.brush.setStampSecondaryColor(opt.stamp_secondaryColor * 0.01 || 0); //0~100%
		this.brush.setStrokeHue(opt.stroke_hue * 0.01 || 0); //0~100%
		this.brush.setStrokeSaturation(opt.stroke_saturation * 0.01 || 0); //0~100%
		this.brush.setStrokeSecondaryColor(opt.stroke_secondaryColor * 0.01 || 0); //0~100%
		this.brush.setPressureHue(opt.pressure_hue * 0.01 || 0); //0~100%
		this.brush.setPressureSaturation(opt.pressure_saturation * 0.01 || 0); //0~100%
		this.brush.setPressureSecondaryColor(opt.pressure_secondaryColor * 0.01 || 0); //0~100%
		this.brush.setBlendingGlaze(opt.blending_glaze || false); //0~100%
		this.brush.setBlendingIntenseGlaze(opt.blending_intenseGlaze || false); //0~100%
		this.brush.setBlendingBlend(opt.blending_blend || false); //0~100%
		this.brush.setBlendingIntenseBlend(opt.blending_intenseBlend || false); //0~100%
		this.brush.setBlendingFlow(opt.blending_flow * 0.01 || 0); //0~100%
		this.brush.setBlendingLuminance(opt.blending_luminance || false); //0~100%
		this.brush.setBlendMode(opt.blend_mode || 'source-over');
		this.brush.setAngle(0);//0-360
		this.brush.setSize(opt.bwidth || this.width);
		this.brush.setSoftness(opt.softness || this.softness);

		///////////////////////////////////////////////////////////////////////////////////////////////////
		croquis.setTool(this.brush);
		croquis.setToolStabilizeLevel((opt.stabal_stabalization * 0.16 + 4) || 8);//4-20
		croquis.setToolStabilizeWeight((opt.stabal_streamline * 0.006 + 0.2) || 0.2);//0.2-0.8
		this.loadPattern();
	},
	setSize: function(val) {
		this.brush.setSize(val);
	},
	setSoftness: function(val) {
		this.brush.setSoftness(val);
	},
	setToolStabilizeLevel: function(val) {
		croquis.setToolStabilizeLevel(val);
	},

	setToolStabilizeWeight: function(val) {
		croquis.setToolStabilizeWeight(val);
	},

	loadPattern: function() {
		this._imgload = false;
		this._patternload = false;
		this.image = new Image();
		this.image.src = this.brushCol;
		this.image.onload = () => {
			this.brush.setImage(this.image);
			this.effectImage = new Image();
			this.effectImage.src = this.effectCol;
			this.effectImage.onload = () => {
				this.brush.setEffectImage(this.effectImage);
				this._imgload = true;
				fabric.Image.fromURL(this.patternCol, (p) => {
					this.brush.setPatternCol(this.patternCol);
					this.pattern = p;
					this.makePattern();
					this._patternload = true;
				}, { crossOrigin: "anonymous" });
			};
		};
	},

	changeColor: function (fcolor, scolor) {
		this.brush.setColor(fcolor, scolor);
		this.makePattern();
	},

	set: function (p) {
		if (this._latest) {
			this._latest.setFromPoint(this._point);
		} else {
			this._latest = new fabric.Point(p.x, p.y);
		}
		fabric.Point.prototype.setFromPoint.call(this._point, p);
	},

	update: function (p) {
		this.set(p);
		this._latestStrokeLength = this._point.subtract(this._latest).distanceFrom({ x: 0, y: 0 });
	},

	distance: function (p1, p2) {
		return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
	},

	getVectorAngle: function (p1, p2) {
		var v = p2.subtract(p1); // vector from now point to last point
		var angleRad = Math.acos(v.x / Math.sqrt(v.x * v.x + v.y * v.y));
		var angle = angleRad * 180 / Math.PI;
		if (v.y > 0)
			angle = 360 - angle;
		if (angle.toString() == 'NaN')
			angle = 0;
		return angle;
	},

	makePattern: function () {
		var brushContext = this.brush.getBrushContext();
		var grainEffect = this.brush.getGrainEffect();
		if (grainEffect > 0)
		{
			var patternCanvas = document.createElement("canvas");
			patternCanvas.width = this.pattern.width;
			patternCanvas.height = this.pattern.height;
			const patternContext = patternCanvas.getContext("2d", { willReadFrequently: true });
			this.pattern.filters = [];
			if (grainEffect == 2)
			{
				let filter = new fabric.Image.filters.Contrast({
					contrast: this.brush.getGrainTexContrast()
				});
				this.pattern.filters.push(filter);
				filter = new fabric.Image.filters.Brightness({
					brightness: this.brush.getGrainTexBrightness()
				});
				this.pattern.filters.push(filter);
			}
			this.pattern.applyFilters();
			patternContext.drawImage(this.pattern.toCanvasElement(), 0, 0);
			var imageData = patternContext.getImageData(0, 0, patternCanvas.width, patternCanvas.height);
			var pixelData = imageData.data;
			if (grainEffect == 1) //moving
			{
				for (var i = 0; i < pixelData.length; i += 4) {
					pixelData[i + 3] = pixelData[i];//Math.pow(pixelData[i] / 255, 2) * 255;
					pixelData[i + 3] += (1 - this.brush.getGrainMoveDepth()) * 255;
				}
			}
			else if (grainEffect == 2) //texture
			{
				for (var i = 0; i < pixelData.length; i += 4) {
					pixelData[i + 3] = pixelData[i];
					pixelData[i + 3] += (1 - this.brush.getGrainTexDepth()) * 255;
				}
			}
			patternContext.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
			patternContext.putImageData(imageData, 0, 0);
			var pattern = brushContext.createPattern(patternCanvas, "repeat");
			this.brush.setPattern(pattern, patternCanvas.width, patternCanvas.height);
		}
		else {
			this.brush.setPattern(this.color);
		}
	},

	onMouseDown: function (pointer, param) {
		if (this._drawn)
			return;
		if (!this._imgload || !this._patternload)
			return;

		if (window.location.pathname != "/draw/brushlab") {
			let layer = $(".layer-drawer-mainitem.menu-selected");
			let layerid = layer.attr("data-layer-id");

			if (layer.find(".layer-hide")[0].style.display == 'none') {
				alert("Current layer is not visible.");
				return;
			}

			let selectedGroup = this.canvas.getObjects().filter(x => x.layerid == layerid);
			if (selectedGroup.length > 0) {
				selectedGroup = selectedGroup[0];
			}
			else {
				alert("There is not selected layer");
				return;
            }

			if (selectedGroup.isFrame || localStorage.getItem("CurBrush") == "EraserBrush") {
				if (!selectedGroup._cacheCanvas)
					return;
				let objs = selectedGroup.getObjects();
				if (objs.length == 0)
					return;		
				this.canvas.clearContext(this.canvas.contextTop);
				var opacity = selectedGroup.opacity;
				selectedGroup.opacity = 1;
				var img = new fabric.Image(selectedGroup.toCanvasElement());
				var alpha = this.canvas.contextTop.globalAlpha;
				this.canvas.contextTop.globalAlpha = 1;
				if (selectedGroup.width > 0) {
					if (selectedGroup.orgWidth == 0) {
						selectedGroup.orgWidth = Math.floor(selectedGroup.width);
						selectedGroup.orgHeight = Math.floor(selectedGroup.height);
						selectedGroup.orgLeft = Math.floor(selectedGroup.left);
						selectedGroup.orgTop = Math.floor(selectedGroup.top);
					}
					console.log(selectedGroup.orgTop, selectedGroup.orgLeft, selectedGroup.orgWidth, selectedGroup.orgHeight);
					
					img.scaleToWidth(selectedGroup.orgWidth);
					img.scaleToHeight(selectedGroup.orgHeight);
					// console.log(img.width, img.height, img.scaleX, img.scaleY, img._element.width, img._element.height, selectedGroup.orgWidth, selectedGroup.orgHeight);
					this.canvas.contextTop.putImageData(img._element.getContext('2d').getImageData(0, 0, selectedGroup.orgWidth, selectedGroup.orgHeight), selectedGroup.orgLeft, selectedGroup.orgTop, 0, 0, (selectedGroup.orgWidth), (selectedGroup.orgHeight));
					selectedGroup.opacity = opacity;
                }
				this.canvas.contextTop.globalAlpha = alpha;
				//clear
				objs.forEach((obj, index) => {
					this.canvas.remove(obj);
					selectedGroup.removeWithUpdate(obj);
				})
				this.canvas.renderAll();
				croquis.setFrame(true);
			}
			else
				croquis.setFrame(false);
		}
		else
			croquis.setFrame(false);
		this._drawn = true;
		this._count = 0;
		this.tp = 0, this.dp = 1;
		let e = param.e;
		this.setPointerEvent(e);
		this.changeColor(this.color, this.scolor);
		this.brush.setFlow(this.opacity);
		this.set(pointer);
		// if (e.pointerType === "pen" && e.button == 5)
        // 	croquis.setPaintingKnockout(true);

		croquis.down(pointer.x, pointer.y, e.pointerType === "pen" ? e.pressure : this.tp, e.azimuthAngle);
		
	},

	onMouseMove: function (pointer, param) {
		if (!this._drawn)
			return;
		this.update(pointer);
		this._count++;
		let e = param.e;
		this.setPointerEvent(e);
		croquis.move(pointer.x, pointer.y, e.pointerType === "pen" ? e.pressure : this.tp, e.azimuthAngle);
	},

	onMouseUp: function (param) {
		try {
			if (this._drawn) {
				let e = param.e;
				var pointer = param.pointer;
				this.setPointerEvent(e);
				croquis.up(pointer.x, pointer.y, e.pointerType === "pen" ? e.pressure : this.tp, e.azimuthAngle);
				//this.convertToImg();
				// if (e.pointerType === "pen" && e.button == 5)
				// 	setTimeout(function() {croquis.setPaintingKnockout(false)}, 30);//timeout should be longer than 20 (knockoutTickInterval in Croquis)
				this._latest = null;
				this._latestStrokeLength = 0;
				this._drawn = false;
			}
		}
		catch (e) {
			console.log(e);
		}
	},

	setPointerEvent: function(e) {
		if (e.pointerType !== "pen" && Croquis.Tablet.pen() && Croquis.Tablet.pen().pointerType) {//it says it's not a pen but it might be a wacom pen
			e.pointerType = "pen";
			e.pressure = Croquis.Tablet.pressure();
			// if (Croquis.Tablet.isEraser()) {
			// 	Object.defineProperties(e, {
			// 		"button": { value: 5 },
			// 		"buttons": { value: 32 }
			// 	});
			// }
		}
	},

	_render: function () { }

}); // End CustomBrush

export default CustomBrush;