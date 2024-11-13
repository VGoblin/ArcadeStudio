import { filter } from 'lodash';
import { UIDiv, UIPanel, UIButton, UIRow, UIImageButton, UIText, UIRowShelf, UINumber, UIInput, UIImage, UITextArea } from '../components/ui.js';

var AiToolDrawPanel = function (editor) {

    var assets = editor.assets;
    var config = editor.config;
    var container = new UIDiv().setFontSize('12px').setHeight("100%").setClass('ai-draw-panel d-flex');
    container.dom.style.position = 'relative';
    var params = {};
    var signals = editor.signals;
    var api = editor.api;
    let emptyMode = "None Button"; // or Zero Percent
    
    //Mult-Threading
    //As a worker normally take another JavaScript file to execute we convert the function in an URL: http://stackoverflow.com/a/16799132/2576706
    function getScriptPath(foo) { return window.URL.createObjectURL(new Blob([foo.toString().match(/^\s*function\s*\(\s*\)\s*\{(([\s\S](?!\}$))*[\s\S])/)[1]], { type: 'text/javascript' })); }

    /*
     *	Here are the workers
     */
    //Worker 1
    var worker1 = new Worker(getScriptPath(function () {
        self.addEventListener('message', function (e) {
            var value = 0;
            console.log(value);
            // while(value <= e.data){
            self.postMessage(e.data);
            // value++;
            // }
        }, false);
    }));

    //We add a listener to the worker to get the response and show it in the page
    worker1.addEventListener('message', function (e) {
        console.log(e);

    }, false);

    var drawSection = new UIDiv();
    drawSection.setClass("drawSection");
    var imageSection = new UIDiv();
    imageSection.setClass("imageSection");
    drawSection.add(imageSection);
    container.add(drawSection);

    var brushSection = document.createElement('div');
    brushSection.className = "tool-dialog inactive";
    brushSection.id = "brush-tool";
    brushSection.innerHTML = `
        <div class="d-flex flex-column">
            <div class="drawer-header">
                <div class="btn-brush">
                    <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/image-generation-tool/image+editor+brush+tool.svg" width="36" alt="brush"/>
                </div>
                <div class="btn-erase">
                    <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/image-generation-tool/image+editor+erase+tool.svg" width="36" alt="erase"/>
                </div>
                <div class="btn-move">
                    <img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/image-generation-tool/image+editor+move+tool.svg" width="36" alt="move"/>
                </div>
                <!--<div class="toolbar-icon" id="color-previewer"></div>-->
                <div class="drawer-header-link pin-it">
                    <div class="pin-top"></div>
                    <div class="pin-tail"></div>
                </div>
            </div>
            <div class="d-flex flex-column">
                <div class="filter-item brush-size">
                    <div class="detail-set-progress">
                        <tc-range-slider id="sli_brush_size" data-default-value="35" data-shower-id="brush_size" min="0" max="100" value="35"  slider-width="100%" slider-height="8px" pointer-width="14px" pointer-height="14px" slider-bg="#45567b80" slider-bg-hover="#45567b" slider-bg-fill="#45567b" pointer-bg="#45567b" pointer-bg-hover="#45567b" pointer-bg-focus="#45567b" pointer-border="0px solid #fff" point-border-hover="0px solid #fff" pointer-border-focus="0px solid #fff">
                        </tc-range-slider>
                    </div>
                    <div class="d-flex justify-content-between align-items-baseline">
                        <div class="">
                            Size
                        </div>
                        <div class="progress-value" aria-controls="set_value_modal"><span id="brush_size" data-label="Size:">35%</span></div>
                    </div>
                </div>
                <div class="filter-item brush-softness">
                    <div class="detail-set-progress">
                        <tc-range-slider id="sli_brush_softness" data-default-value="30" data-shower-id="brush_softness" min="0" max="100" value="30"  slider-width="100%" slider-height="8px" pointer-width="14px" pointer-height="14px" slider-bg="#45567b80" slider-bg-hover="#45567b" slider-bg-fill="#45567b" pointer-bg="#45567b" pointer-bg-hover="#45567b" pointer-bg-focus="#45567b" pointer-border="0px solid #fff" point-border-hover="0px solid #fff" pointer-border-focus="0px solid #fff">
                        </tc-range-slider>
                    </div>
                    <div class="d-flex justify-content-between align-items-baseline">
                        <div class="">
                            Softness
                        </div>
                        <div class="progress-value" aria-controls="set_value_modal"><span id="brush_softness" data-label="Softness:">30%</span></div>
                    </div>
                </div>
                <div class="filter-item brush-opacity">
                    <div class="detail-set-progress">
                        <tc-range-slider id="sli_brush_opacity" data-default-value="100" data-shower-id="brush_opacity" min="0" max="100" value="100"  slider-width="100%" slider-height="8px" pointer-width="14px" pointer-height="14px" slider-bg="#45567b80" slider-bg-hover="#45567b" slider-bg-fill="#45567b" pointer-bg="#45567b" pointer-bg-hover="#45567b" pointer-bg-focus="#45567b" pointer-border="0px solid #fff" point-border-hover="0px solid #fff" pointer-border-focus="0px solid #fff">
                        </tc-range-slider>
                    </div>
                    <div class="d-flex justify-content-between align-items-baseline">
                        <div class="">
                            Opacity
                        </div>
                        <div class="progress-value" aria-controls="set_value_modal"><span id="brush_opacity" data-label="Opacity:">100%</span></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.dom.appendChild(brushSection);

    var filterSection = document.createElement('div');
    filterSection.className = "tool-dialog inactive";
    filterSection.id = "filter-tool";
    filterSection.innerHTML = `
        <div class="d-flex flex-column">
            <div class="drawer-header">Filters</div>
            <div class="d-flex flex-column">
                <div class="filter-item filter-opacity">
                    <div class="detail-set-progress">
                        <tc-range-slider id="sli_filter_opacity" data-default-value="100" data-shower-id="filter_opacity" min="0" max="100" value="100" slider-width="100%" slider-height="8px" pointer-width="14px"
                                                pointer-height="14px" slider-bg="#45567b80" slider-bg-hover="#45567b" slider-bg-fill="#45567b"
                                            pointer-bg="#45567b" pointer-bg-hover="#45567b" pointer-bg-focus="#45567b"
                                            pointer-border="0px solid #fff" point-border-hover="0px solid #fff" pointer-border-focus="0px solid #fff">
                        </tc-range-slider>
                    </div>
                    <div class="d-flex justify-content-between align-items-baseline">
                        <div class="">
                            Opacity
                        </div>
                        <div class="progress-value" aria-controls="set_value_modal"><span id="filter_opacity" data-label="Opacity:">100%</span></div>
                    </div>
                </div>
                <div class="filter-item filter-brightness">
                    <div class="detail-set-progress">
                        <tc-range-slider id="sli_filter_brightness" data-default-value="0" data-shower-id="filter_brightness" min="-100" max="100" value="0" slider-width="100%" slider-height="8px" pointer-width="14px"
                                                pointer-height="14px" slider-bg="#45567b80" slider-bg-hover="#45567b" slider-bg-fill="#45567b"
                                            pointer-bg="#45567b" pointer-bg-hover="#45567b" pointer-bg-focus="#45567b"
                                            pointer-border="0px solid #fff" point-border-hover="0px solid #fff" pointer-border-focus="0px solid #fff">
                        </tc-range-slider>
                    </div>
                    <div class="d-flex justify-content-between align-items-baseline">
                        <div class="">
                            Brightness
                        </div>
                        <div class="progress-value" aria-controls="set_value_modal"><span id="filter_brightness" data-label="Brightness:">0%</span></div>
                    </div>
                </div>
                <div class="filter-item filter-contrast">
                    <div class="detail-set-progress">
                        <tc-range-slider id="sli_filter_contrast" data-default-value="0" data-shower-id="filter_contrast" min="-100" max="100" value="0" slider-width="100%" slider-height="8px" pointer-width="14px"
                                                pointer-height="14px" slider-bg="#45567b80" slider-bg-hover="#45567b" slider-bg-fill="#45567b"
                                            pointer-bg="#45567b" pointer-bg-hover="#45567b" pointer-bg-focus="#45567b"
                                            pointer-border="0px solid #fff" point-border-hover="0px solid #fff" pointer-border-focus="0px solid #fff">
                        </tc-range-slider>
                    </div>
                    <div class="d-flex justify-content-between align-items-baseline">
                        <div class="">
                            Contrast
                        </div>
                        <div class="progress-value" aria-controls="set_value_modal"><span id="filter_contrast" data-label="Contrast:">0%</span></div>
                    </div>
                </div>
                <div class="filter-item filter-saturation">
                    <div class="detail-set-progress">
                        <tc-range-slider id="sli_filter_saturation" data-default-value="0" data-shower-id="filter_saturation" min="-100" max="100" value="0" slider-width="100%" slider-height="8px" pointer-width="14px"
                                                pointer-height="14px" slider-bg="#45567b80" slider-bg-hover="#45567b" slider-bg-fill="#45567b"
                                            pointer-bg="#45567b" pointer-bg-hover="#45567b" pointer-bg-focus="#45567b"
                                            pointer-border="0px solid #fff" point-border-hover="0px solid #fff" pointer-border-focus="0px solid #fff">
                        </tc-range-slider>
                    </div>
                    <div class="d-flex justify-content-between align-items-baseline">
                        <div class="">
                            Saturation
                        </div>
                        <div class="progress-value" aria-controls="set_value_modal"><span id="filter_saturation" data-label="Saturation:">0%</span></div>
                    </div>
                </div>
                <div class="filter-item filter-hue">
                    <div class="detail-set-progress">
                        <tc-range-slider id="sli_filter_hue" data-default-value="0" data-shower-id="filter_hue" min="-200" max="200" value="0" slider-width="100%" slider-height="8px" pointer-width="14px"
                                                pointer-height="14px" slider-bg="#45567b80" slider-bg-hover="#45567b" slider-bg-fill="#45567b"
                                            pointer-bg="#45567b" pointer-bg-hover="#45567b" pointer-bg-focus="#45567b"
                                            pointer-border="0px solid #fff" point-border-hover="0px solid #fff" pointer-border-focus="0px solid #fff">
                        </tc-range-slider>
                    </div>
                    <div class="d-flex justify-content-between align-items-baseline">
                        <div class="">
                            Hue
                        </div>
                        <div class="progress-value" aria-controls="set_value_modal"><span id="filter_hue" data-label="Hue:">0%</span></div>
                    </div>
                </div>
                <div class="filter-item filter-blur">
                    <div class="detail-set-progress">
                        <tc-range-slider id="sli_filter_blur" data-default-value="0" data-shower-id="filter_blur" min="0" max="100" value="0" slider-width="100%" slider-height="8px" pointer-width="14px"
                                                pointer-height="14px" slider-bg="#45567b80" slider-bg-hover="#45567b" slider-bg-fill="#45567b"
                                            pointer-bg="#45567b" pointer-bg-hover="#45567b" pointer-bg-focus="#45567b"
                                            pointer-border="0px solid #fff" point-border-hover="0px solid #fff" pointer-border-focus="0px solid #fff">
                        </tc-range-slider>
                    </div>
                    <div class="d-flex justify-content-between align-items-baseline">
                        <div class="">
                            Blur
                        </div>
                        <div class="progress-value" aria-controls="set_value_modal"><span id="filter_blur" data-label="Blur:">0%</span></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    container.dom.appendChild(filterSection);

    var colorPickerSection = document.createElement('div');
    colorPickerSection.className = "tool-dialog color-picker-container inactive";
    colorPickerSection.id = "color-tool";
    colorPickerSection.innerHTML = `
		<div class="color-picker-header d-flex flex-row justify-content-between">
			Colors
			<div class="d-flex align-items-center justify-content-center">
				<div class="color-picker-previewer first-color-previewer selected"></div>
			</div>
		</div>
		<div class="switch-container">
			<div class="d-flex bg-white" style="border-radius:10px">
				<div class="btn float-left btn-switch active" id="colors">Colors</div>
				<div class="btn float-right btn-switch" id="palettes">Palettes</div>
			</div>
		</div>
		<!-- <img src="/images/colorpanel.jpg" id="colorImage" style="display: none;"/> -->
		<div class="colorPanel-container main-color-panel" style="padding-top: 18px; padding-left: 30px; padding-right: 30px; color: white;" id="colors_container">
			<div id="snippet-block" class="snippet">
				<div style="position:relative; width:100%;">
					<input id="color-block"
							type="text"
							value="#ff8800"
							data-wheelcolorpicker
							data-wcp-format="css"
							data-wcp-layout="block"
							data-wcp-sliders="w"
							data-wcp-cssClass="color-block d-flex flex-column justify-content-center align-items-center"
							data-wcp-autoResize="true"
							data-wcp-mobile="true" />
					<button class="color-picker-stick d-none" id="color-picker-stick">
						<img class="color-stick-img" src="/images/color-picker-stick.svg" />
					</button>
				</div>
				<div class="brightnessValueContainer">
				<input type="range" min="0" max="1" value="1" step="0.01" id="brightness" class="brightnessSlider" />
				</div>
				<div class="d-flex flex-row justify-content-between align-items-center" style="width:100% !important; padding-top:8px; padding-bottom:8px;">
					<span class="color-setting-title">Hexadicimal</span>
					<input id="color-input" type="text" class="color-input form-control" style="padding:0 !important; font-size:16px !important; width:50%;"/>
				</div>
				<div class="color-history-container">
					<div class="history-control d-flex flex-row justify-content-between">
					<div class="color-setting-title">History</div>
					<div class="color-setting-title" style="text-align:right" id="clearHistory">Clear</div>
					</div>
					<div class="history-colors d-flex">
						<div class="oldColor flex-fill"></div>
						<div class="oldColor flex-fill"></div>
						<div class="oldColor flex-fill"></div>
						<div class="oldColor flex-fill"></div>
						<div class="oldColor flex-fill"></div>
						<div class="oldColor flex-fill"></div>
						<div class="oldColor flex-fill"></div>
						<div class="oldColor flex-fill"></div>
						<div class="oldColor flex-fill"></div>
					</div>
				</div>
				<div class="cur-palette d-flex flex-row justify-content-between" style="padding-top:24px; padding-bottom:24px" id="cur-palette">
				</div>
			</div>
		</div>
		<div class="colorPanel-container py-3 scrollbar8" id="palettes_container">
		</div>
    `;
    container.dom.appendChild(colorPickerSection);

    var background = new UIDiv();
    background.setClass("background ai-layer-image");
    imageSection.add(background);
    
    var loaderDiv = new UIDiv();
    loaderDiv.setClass("loader");
    loaderDiv.setDisplay("none");
    loaderDiv.setId("loader");
    var oneDiv = new UIDiv();
    oneDiv.setClass("inner one");
    loaderDiv.add(oneDiv);
    var twoDiv = new UIDiv();
    twoDiv.setClass("inner two");
    loaderDiv.add(twoDiv);
    var threeDiv = new UIDiv();
    threeDiv.setClass("inner three");
    loaderDiv.add(threeDiv);
    imageSection.add(loaderDiv);

    var canvas = document.createElement("canvas");
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.id = "previewer";
    imageSection.dom.appendChild(canvas);

    $(document).ready((e) => {
        window.dispatchEvent(new CustomEvent("load_canvas"));
        window.dispatchEvent(new CustomEvent("load_colorpicker"));

        $("tc-range-slider").on("change", function (e) {
            let shower_id = "#" + $(this).attr("data-shower-id") ?? "" + "";
            if($(this).attr("data-shower-id") != "") {
                if (shower_id != "ai_style") {
                    if ($(this)[0].value == 0) {
                        if (emptyMode == "None Button") {
                            $(shower_id).text('None');
                        }
                        else if (emptyMode == "Zero Percent") {
                            $(shower_id).text("0%");
                        }
                    }
                    else if ($(this)[0].value == $(this)[0].max) {
                        $(shower_id).text("Max");
                    }
                    else if ($(this)[0].value == $(this)[0].min) {
                        $(shower_id).text("Min");
                    }
                    else {
                        $(shower_id).text($(this)[0].value + "%")
                    }
                }
    
                switch (shower_id) {
                    case "#brush_size":
                        window.dispatchEvent(new CustomEvent("change_brush_size", { detail: { brush_size: $(this)[0].value } }));
                        break;
                    case "#brush_softness":
                        window.dispatchEvent(new CustomEvent("change_brush_softness", { detail: { brush_softness: $(this)[0].value } }));
                        break;
                    case "#brush_opacity":
                        let op = $(this)[0].value;
                        op = Math.pow(op / 100, 2) * 100;
                        window.dispatchEvent(new CustomEvent("change_brush_opacity", { detail: { brush_opacity: op } }));
                        break;
                    case "#filter_opacity":
                        window.dispatchEvent(new CustomEvent("filter_layer", { detail: { type: "opacity", value: $(this)[0].value } }));
                        break;
                    case "#filter_brightness":
                        window.dispatchEvent(new CustomEvent("filter_layer", { detail: { type: "brightness", value: $(this)[0].value } }));
                        break;
                    case "#filter_contrast":
                        window.dispatchEvent(new CustomEvent("filter_layer", { detail: { type: "contrast", value: $(this)[0].value } }));
                        break;
                    case "#filter_saturation":
                        window.dispatchEvent(new CustomEvent("filter_layer", { detail: { type: "saturation", value: $(this)[0].value } }));
                        break;
                    case "#filter_hue":
                        window.dispatchEvent(new CustomEvent("filter_layer", { detail: { type: "hue", value: $(this)[0].value } }));
                        break;
                    case "#filter_blur":
                        window.dispatchEvent(new CustomEvent("filter_layer", { detail: { type: "blur", value: $(this)[0].value } }));
                        break;
                    case "#ai_style":
                        ai_style = $(this)[0].value;
                        /*loadAiImage();*/
                        break;
                }
            }
        });
    })

    window.addEventListener("resize", ()=> {
        // let s = Math.min(drawSection.dom.clientWidth, drawSection.dom.clientHeight);
        $('.imageSection').height(drawSection.dom.clientHeight);
    });

    function addLayer(layer) {
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent("add-layer-image", { detail: { url: layer.url, fileType: "image/png", layerid: layer.id, layername: layer.name, selected: layer.selected, visible: layer.visible } }));
        }, 100);
    }

    signals.generateNewAiImage.add((layer) => {
        addLayer(layer);
        loaderDiv.setDisplay("none");
        background.setZIndex(0);
    });

    signals.stopGenAiImage.add((layer) => {
        loaderDiv.setDisplay("none");
        background.setZIndex(0);
    });

    signals.moveAiImageLayer.add(function(e) {
        let oldIndex = e.target.childNodes.length - e.oldDraggableIndex - 1;
        let newIndex = e.target.childNodes.length - e.newDraggableIndex - 1;
        window.dispatchEvent(new CustomEvent("move-layer-image", { detail: { oldIndex: oldIndex, newIndex: newIndex } })); 
    });

    signals.deleteAiImageLayer.add((layer) => {
       window.dispatchEvent(new CustomEvent("delete-layer-image", { detail: { layer: layer } })); 
    });

    signals.startGenAiImage.add((layer) => {
        loaderDiv.setDisplay("");
        background.setZIndex(998);
    });

    signals.showBrushPopupToggled.add((flag) => {
        if (flag) {
            $("#brush-tool").removeClass("inactive");
        }
        else {
            if (!$(".pin-it").hasClass("active")) {
                $("#brush-tool").addClass("inactive");
                $("#color-tool").addClass("inactive");    
            }
        }
    });

    signals.showFilterPopupToggled.add(() => {
        $("#filter-tool").toggleClass("inactive");
    });

    signals.showColorPickerToggled.add(() => {
        $("#color-tool").toggleClass("inactive");
    });

    signals.brushErase.add((layer) => {
        window.dispatchEvent(new CustomEvent("erase-draw"));
    });
    signals.brushDraw.add((layer) => {
        window.dispatchEvent(new CustomEvent("start-draw"));
    });
    signals.brushMove.add((layer) => {
        window.dispatchEvent(new CustomEvent("stop-draw"));
    });

    return container;
};

export { AiToolDrawPanel };
