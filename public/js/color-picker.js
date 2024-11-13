$(document).ready(function () {
	window.addEventListener("load_colorpicker", function(event) {
		$('html').click(function (e) {
			$('.custom_popr_container_top').remove();
			$('.popr_container_top').remove();
			popr_show = false;
			color_popr_show = false;
			setting_popr_show = false;
		});
	
		const historyColors = [];
		const swatches=[
			["#90c1e1", "#4091b3", "#1b3851", "#f1b11a", "#e47a23"],
			["#cc7f5a", "#317479", "#4a3f5c", "#bb7167", "#e1ae56"],
			["#da9d92", "#3e4497", "#2a2778", "#db4b8a", "#efbe41"],
			["#86caef", "#6a6eb1", "#70bec8", "#4a97d8", "#2a3086"],
			["#16103c", "#24205d", "#5861aa", "#e68b88", "#f3be8d"],
			["#294869", "#479094", "#65b589", "#8ac284", "#cee3c5"],
			["#f9ece1", "#fae3d3", "#f2c6d0", "#e6a5ad", "#90777e"],
			["#282b73", "#6981c1", "#a6abd5", "#e27585", "#eaa1ae"],
			["#355c68", "#6aa794", "#cbdac6", "#dde8d9", "#ffffff"],
			["#6ea090", "#e78e7b", "#d1686e", "#5764ad", "#38446e"],
			["#486470", "#718b95", "#8da6ac", "#bdbebe", "#d9dad4"],
			["#54aec2", "#3f84ac", "#efd312", "#ccd920", "#e47823"],
			["#0e1827", "#20428e", "#4d7cc0", "#dc99bf", "#d84989"],
			["#63b9bf", "#6bb0c3", "#c3abd0", "#ddb1c0", "#f0b97f"],
			["#e2777f", "#784979", "#645689", "#6f81af", "#a2c1cb"],
			["#354895", "#7ca0cd", "#b6b1d5", "#deb1d0", "#935f82"],
			["#cd7c58", "#e88e64", "#d2ab51", "#443c66", "#635b8e"],
			["#87bfc5", "#aad7db", "#f3dea5", "#f3c584", "#a2ca6a"],
			["#000000", "#525252", "#969696", "#D9D9D9", "#FFFFFF"],
		];
	
		let swatchContainer = document.createElement('div')
		swatchContainer.classList.add('palettes')
		let palettes_container = document.getElementById("palettes_container");
		palettes_container.appendChild(swatchContainer)
		let index = -1;
		for (const swatch of swatches) {
			index++;
			let row = document.createElement("div");
			row.classList.add("d-flex");
			let leftBorder = document.createElement("div")
			leftBorder.classList.add("px-1", "defaultBorder");
			let rightPalette = document.createElement("div");
			rightPalette.classList.add("palette", "d-flex", "justify-content-between", "py-2", "px-1", "mr-2");
	
			for (const color of swatch) {
				let colorButton = document.createElement('div')
				colorButton.setAttribute('data-swatchy-color', color)
				colorButton.style.backgroundColor = color
				colorButton.classList.add('swatchy-color-button')
				rightPalette.appendChild(colorButton)
			}
			rightPalette.style.flex = "1";
			row.appendChild(leftBorder);
			row.appendChild(rightPalette);
			row.addEventListener("click", selectPalette);
			row.setAttribute("id", index);
			swatchContainer.appendChild(row);
		};
	
		let currentPaletteIndex = 0;
		$('#color-block').on('sliderup', function (e) {
			e.stopPropagation();
			var value = $(this).wheelColorPicker('value');
			$("#color-input").val(value);
			var brightness = $(this).wheelColorPicker('color').v;
			$("#brightness").val(brightness);
			historyColors.unshift(value);
			changeHistory();
		});
	
		$('#color-block').on('colorchange', function (e) {
			e.stopPropagation();
			let color = $(this).wheelColorPicker("value");
			changeColor(color);
		});
	
	
		$("#color-picker-stick").click(function () {
			if (window.EyeDropper != undefined) {
				openDropper();
			}
			else {
				console.log("unsuccessed!");
			}
		});
	
		$(".editor").on("click", function(){
			$(".editor").removeClass("active-btn");
			$(".btn-edit-group").removeClass("d-show");
			var $edit_button = $(this);
			var btn_groupId = $edit_button.attr("id");
			btn_groupId = "#detail-" + btn_groupId;
			$(btn_groupId).addClass("d-show");
			$(this).addClass("active-btn");
			$(".editor").find("img").removeClass("active-svg");
			$(this).children().addClass("active-svg");
		});
	
		$("#colors").click(function(){
			$("#palettes_container").hide();
			let curPalette = document.getElementById("cur-palette");
			curPalette.innerHTML="";
			for(const color of swatches[currentPaletteIndex]){
				let colorButton = document.createElement('div');
				colorButton.setAttribute('data-swatchy-color', color);
				colorButton.style.backgroundColor = color;
				colorButton.addEventListener('click', usePalette)
				colorButton.classList.add('swatchy-color-button');
				curPalette.appendChild(colorButton);
			}
			$("#colors_container").show();
			$(".btn-switch").removeClass("active");
			$(this).addClass("active");
		});
	
		$("#palettes").click(function(){
			$(".btn-switch").removeClass("active");
			$(this).addClass("active");
			$("#colors_container").hide();
			$("#palettes_container").show();
		});
	
		$("#color-previewer").click(function (event) {
			$(".color-picker-previewer").removeClass("selected");
			$(".first-color-previewer").addClass("selected");
			$("#color-block").wheelColorPicker("setValue", $(this).css("background-color"));
			//if ($(".color-picker-container").hasClass("d-none"))
			{
				let curPalette = document.getElementById("cur-palette");
				curPalette.innerHTML="";
				for(const color of swatches[currentPaletteIndex]){
					let colorButton = document.createElement('div');
					colorButton.setAttribute('data-swatchy-color', color);
					colorButton.style.backgroundColor = color;
					colorButton.addEventListener("click", usePalette);
					colorButton.classList.add('swatchy-color-button');
					curPalette.appendChild(colorButton);
				}
				if ($("#colors").hasClass("active")) {
					$("#colors_container").show();
				} else{
					$("#palettes_container").show();
				}
			}
		});
	
		$(".color-picker-container").click(function (event) {
			event.stopPropagation();
		})
	
		$("#edit").click(function (event) {
			event.stopPropagation();
			$(".color-picker-container").hide();
			$(".editor").hide();
			$("#edit").removeClass("d-flex");
			$("#edit").removeClass("active-btn");
			$("#align").removeClass("d-flex");
			$(".editor-panel").css("width", "28rem");
			$("#brush_opacity").show();
			$("#brush_size").show();
			$(".detail-editor").css("margin-bottom", "0px !important");
			$("#property").addClass("d-flex");
		});
	
		$(".action-btn").on("click", function () {
			var action = "#part_" + $(this).attr("data-id");
			$(action).removeClass("transition-right");
			$(action).addClass("transition-left");
		});
	
		$(".return-btn").on("click", function () {
			var returnAction = "#part_" + $(this).attr("data-id");
			$(returnAction).removeClass("transition-left");
			$(returnAction).addClass("transition-right");
		})
	
		$(".oldColor").click(function(e){
			let color = e.currentTarget.style.backgroundColor;
			historyColors.unshift(color);
			changeHistory();
			changeColor(color);
			$("#color-block").wheelColorPicker("setValue", color);
		});
	
		$("#color-input").on("change", function (e) {
			e.stopPropagation();
			let inputcolor = $("#color-input").val();
			$("#color-block").wheelColorPicker("setValue", inputcolor);
			let color = $("#color-block").wheelColorPicker("color");
			let value = $("#color-block").wheelColorPicker("value");
			$("#brightness").val(color.v);
			historyColors.unshift(value);
			changeHistory();
			changeColor(value);
		});
	
		$("#clearHistory").click(function () {
			for (let i = 0; i < 10; i++) {
				historyColors.unshift("#fff");
			}
			$(".oldColor").css("background", "#fff");
		});
	
		// $('.color-picker-container').click(function (event) {
		// 	event.stopPropagation();
		// 	$('.color-picker-container').show();
		// });
	
		$("#brightness").on("mouseup",function (e) {
			e.stopPropagation();
			var brightness = $(this).val();
			var color = $("#color-block").wheelColorPicker("value");
			let hsb = RGBToHSB(color);
			hsb[2] = parseInt(brightness * 100);
			let rgb = HSBToRGB(hsb[0], hsb[1], hsb[2]);
			let hex = rgb2hex(`rgba(${parseInt(rgb[0])}, ${parseInt(rgb[1])}, ${parseInt(rgb[2])}, 1)`);
			$("#color-input").val(hex);
			$("#color-input").change();
			//$("#color-block").wheelColorPicker('setValue', rgb2hex(`rgba(${parseInt(rgb[0])}, ${parseInt(rgb[1])}, ${parseInt(rgb[2])}, 1)`));
		});
	
		$("#text-input").on("input", function () {
			if ($(this).val() == "") {
				$(".font-name").text("Wynwood 2022");
			}
			else {
				console.log("text value", $("#text-input").val());
				$(".font-name").removeClass("transition-top");
				$(".font-name").text($("#text-input").val());
				setTimeout(function () {
					$(".font-name").addClass("transition-top");
				}, 200);
			}
		});
	
		$(".font-family-name").click(function () {
			if ($(this).hasClass("active-font")) {
				$(this).removeClass("active-font");
			}
			else {
				$(this).addClass("active-font");
			}
		})
	
		$("#returnHome").click(function () {
			history.back();
		});
	
		function openDropper() {
			const eyeDropper = new EyeDropper();
			eyeDropper.open().then(res => {
				if (res && res.sRGBHex) {
						$("#color-block").wheelColorPicker("setValue", res.sRGBHex);
						let color = $("#color-block").wheelColorPicker("value");
						$("#color-input").val(color);
						historyColors.unshift(color);
						changeHistory();
					}
				})
				.catch(err => {
					console.error(err);
				});
		}
	
		function selectPalette(e) {
			currentPaletteIndex = e.currentTarget.getAttribute("id");
			const leftBorders = document.querySelectorAll(".defaultBorder");
			leftBorders.forEach(border=> {
				border.classList.remove("blueBorder");
			})
			$(this).find(".defaultBorder").addClass("blueBorder");
		}
	
		function usePalette(e) {
			let color = e.currentTarget.getAttribute('data-swatchy-color');
			historyColors.unshift(color);
			changeHistory();
			$("#color-input").val(color);
			changeColor(color);
			$("#color-block").wheelColorPicker("setValue", color);
		}
	
		function changeHistory(e){
			let oldColorDivs = document.getElementsByClassName("oldColor");
			let index = -1;
			for(let oldColorDiv of oldColorDivs){
				index++;
				oldColorDiv.style.backgroundColor = historyColors[index];
			}
		}
	
		function rgb2hex(rgb){
			rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
			return (rgb && rgb.length === 4) ? "#" +
				("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
				("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
				("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
		}
	
		var RGBToHSB = (rgb) => {
			if (rgb.startsWith("#"))
				rgb = rgb.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
			else
				rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
			r = parseInt(rgb[1], 16) / 255.0;
			g = parseInt(rgb[2], 16) / 255.0;
			b = parseInt(rgb[3], 16) / 255.0;
			const v = _max(r, g, b),
				n = v - _min(r, g, b);
			const h =
				n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;
			return [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100];
		};
	
		var RGBToHSB2 = (r, g, b) => {
			r /= 255;
			g /= 255;
			b /= 255;
			const v = _max(r, g, b),
				n = v - _min(r, g, b);
			const h =
				n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;
			return [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100];
		};
	
		function changeColor(rgba) {
			if ($(".first-color-previewer").hasClass("selected"))
				$("#color-previewer").css("background-color", rgba);
			$(".color-picker-previewer.selected").css("background-color", rgba);
			let hsb = RGBToHSB(rgba);
			$("#brightness").val(hsb[2] / 100);
			window.dispatchEvent(new Event("change_brush_color"));
		}
	});
});
