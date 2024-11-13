import { brushPath, bcolor, scolor, bwidth, bopacity, bsoftness, setBrushSoftness, setBrushWidth, setBrushColor, setSecondaryColor, setBrushOpacity, shapes, textures, effects, DatGui, getFabricCanvas, fabricCanvas } from './initialize.js'

var documentMediaId = $("#document_media_id").val();
var canvasDemo = null;
var ai_style = "None";
var isJsonLoad = false;
var initJsonData = [];
var additional_attribute = [
    "hasBorders",
    "hasControls",
    'model',
    'lockMovementX',
    'lockMovementY',
    'lockRotation',
    'lockScalingX',
    'lockScalingY',
    'lockUniScaling',
    'cornerStyle',
    'figureID',
    'side',
    'borderColor',
    'cornerColor',
    'selectable',
    'borderDashArray',
    'fillRule',
    'fillDegree',
    'perPixelTargetFind',
    'spot',
    'guideName',
    'editable',
    'objectCaching',
    'linePatternNum',
    '_controlsvisible',
    'patternColor',
    'svgBg',
    'lockMovment',
    'layerCnt',
    'layername',
    'layerid',
    'brightness',
    'contrast',
    'saturation',
    'hue',
    'blur',
    'isFrame'
];

function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
}

function base64URLProcess(base64Str) {
    return (base64Str == "") ? "" : base64Str.substr(22);
}

function renderCanvas() {
    let layer = $(".layer-drawer-mainitem.menu-selected");
    let layerid = layer.attr("data-layer-id");

    fabricCanvas.getObjects().forEach((object, index) => {
        object.erasable = false;
        if (object.layerid == layerid) {
            object.erasable = true;
        }
        if ($(".layer-drawer-mainitem[data-layer-name='" + object.layername + "'] input").length > 0)
            object.visible = $(".layer-drawer-mainitem[data-layer-name='" + object.layername + "'] .layer-hide")[0].style.display != 'none';
    });

    fabricCanvas.getObjects().forEach((object, index) => {
        object.selectable = false;
        if (object.layerid == layerid) {
            object.selectable = true;
        }
    });

    fabricCanvas.discardActiveObject(null);
    fabricCanvas.renderAll();
}

function reloadLayers() {
    $(".layers-list").empty();
    fabricCanvas.renderAll.bind(fabricCanvas);
    fabricCanvas.getObjects().forEach((object, index) => {
        window.dispatchEvent(new CustomEvent("add_layer", {
            detail: {
                selected: (index == (fabricCanvas.getObjects().length - 1)),
                layername: object.layername,
                layerid: object.layerid,
                visible: object.visible,
                isExist: true
            }
        }));
    });
    setTimeout(() => {
        isJsonLoad = false;
    }, 200);
}

function addObjectToLayer(selectedGroup, obj) {
    if (obj.filters) {
        obj.filters.length = 0;
        obj.filters.push(new fabric.Image.filters.Brightness({ brightness: parseFloat(selectedGroup.brightness ? selectedGroup.brightness : 0) }));
        obj.filters.push(new fabric.Image.filters.Contrast({ contrast: parseFloat(selectedGroup.contrast ? selectedGroup.contrast : 0) }));
        obj.filters.push(new fabric.Image.filters.Saturation({ saturation: parseFloat(selectedGroup.saturation ? selectedGroup.saturation : 0) }));
        obj.filters.push(new fabric.Image.filters.HueRotation({ rotation: parseFloat(selectedGroup.hue ? selectedGroup.hue : 0) }));
        obj.filters.push(new fabric.Image.filters.Blur({ blur: parseFloat(selectedGroup.blur ? selectedGroup.blur : 0) }));
        obj.applyFilters();
    }

    selectedGroup.addWithUpdate(obj);
}

function addLayer(e) {
    let layername = e.detail.layername;
    let layerid = e.detail.layerid;
    let visible = e.detail.visible ?? true;
    var group = null;
    if (!e.detail.isExist) {
        if (!fabricCanvas.layerCnt) {
            fabricCanvas.layerCnt = 1;
        }
        else
            fabricCanvas.layerCnt++;
        if (layerid == "")
            layerid = "Layer" + fabricCanvas.layerCnt;
        if (layername == "")
            layername = "Layer" + fabricCanvas.layerCnt;

        var objects = [];
        if (e.detail.objects)
            objects = e.detail.objects;

        fabricCanvas.getContext().globalCompositeOperation = 'overlay';

        group = new fabric.Group(objects);
        group.layername = layername;
        group.layerid = layerid;
        group.visible = visible;
        group.erasable = false;
        group.deep = false;
        group.dirty = true;
        group.orgWidth = 0;
        group.orgHeight = 0;
        group.orgTop = group.orgLeft = 0;
        fabricCanvas.add(group);

        if (e.detail.isCopy) {
            let selectedGroup = fabricCanvas.getObjects().filter(x => x.layerid == e.detail.clayerid)[0];
            selectedGroup.getObjects().forEach(function (path) {
                path.clone((copy) => {
                    group.addWithUpdate(copy);
                    if (group.size() == selectedGroup._objects.length) {
                        group
                            .set("top", selectedGroup.top + 5)
                            .set("left", selectedGroup.left + 5)
                            .setCoords();
                        if (selectedGroup.eraser) {
                            group.eraser = new fabric.Eraser();
                            selectedGroup.eraser.clone((copyeraser) => {
                                copyeraser.getObjects().forEach(function (eraserPath) {
                                    group.eraser.addWithUpdate(eraserPath);
                                })
                                renderCanvas();
                            })
                        }
                        else
                            renderCanvas();
                    }
                })
            });
            
        }
    }
    else {
        let selectedGroup = fabricCanvas.getObjects().filter(x => x.layerid == layerid);
        if (selectedGroup.length > 0) {
            group = selectedGroup[0];
        }
    }

    if (group.isFrame)
        $(".layer-drawer-submenu-item[data-action='frame']").addClass("menu-selected");
    else
        $(".layer-drawer-submenu-item[data-action='frame']").removeClass("menu-selected");

    if (e.detail.selected) {
        $(".layer-drawer-mainitem").removeClass("selected");
    }

    if (!e.detail.objects) {
        $("#sli_filter_opacity").val(parseFloat(group.opacity ? group.opacity * 100 : 0));
        $("#sli_filter_brightness").val(parseFloat(group.brightness ? group.brightness * 100 : 0));
        $("#sli_filter_contrast").val(parseFloat(group.contrast ? group.contrast * 100 : 0));
        $("#sli_filter_saturation").val(parseFloat(group.saturation ? group.saturation * 100 : 0));
        $("#sli_filter_hue").val(parseFloat(group.hue ? group.hue * 100 : 0));
        $("#sli_filter_blur").val(parseFloat(group.blur ? group.blur * 100 : 0));
    }

    $(".layer-drawer-mainitem[data-layer-id='" + layerid + "']").click(function (e) {
        if ($(this).hasClass("elected")) {
            //$("#layer-tool-sub").toggleClass("d-none");
        }
        else {
            //$("#layer-tool-sub").addClass("d-none");
            $(".layer-drawer-mainitem").removeClass("menu-selected");
            $(this).addClass("menu-selected");
        }
        let layer = $(this);
        let layerid = layer.attr("data-layer-id");
        let selectedGroup = fabricCanvas.getObjects().filter(x => x.layerid == layerid)[0];
        $(".layer-drawer-submenu-item").removeClass("menu-selected");
        if (selectedGroup.isFrame) {
            $(".layer-drawer-submenu-item[data-action='frame']").addClass("menu-selected");
        }
        else {
            $(".layer-drawer-submenu-item[data-action='frame']").removeClass("menu-selected");
        }
        isJsonLoad = true;
        $("#sli_filter_opacity").val(parseFloat(selectedGroup.opacity ? selectedGroup.opacity * 100 : 0));
        $("#sli_filter_brightness").val(parseFloat(selectedGroup.brightness ? selectedGroup.brightness * 100 : 0));
        $("#sli_filter_contrast").val(parseFloat(selectedGroup.contrast ? selectedGroup.contrast * 100 : 0));
        $("#sli_filter_saturation").val(parseFloat(selectedGroup.saturation ? selectedGroup.saturation * 100 : 0));
        $("#sli_filter_hue").val(parseFloat(selectedGroup.hue ? selectedGroup.hue * 100 : 0));
        $("#sli_filter_blur").val(parseFloat(selectedGroup.blur ? selectedGroup.blur * 100 : 0));
        setTimeout(() => { isJsonLoad = false; }, 100);
        renderCanvas();
    });

    if (e.detail.objects)
    {
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent("stop-draw"));
            $(".layer-drawer-mainitem.menu-selected").click();
            
        }, 200);
    }
    else
        renderCanvas();
}

function loadCanvas() {
    (canvasID => {
        let brush = localStorage.getItem("CurBrush");
        if (brush == null) {
            brush = "SauceBrush";
            localStorage.setItem("CurBrush", brush);
        }
        let brushOpts = JSON.parse(localStorage.getItem(brush) || "{}");
        brushOpts.brushCol = shapes[brushOpts.brushCol];
        brushOpts.patternCol = textures[brushOpts.patternCol];
        brushOpts.effectCol = effects[brushOpts.effectCol];
        brushOpts.brushName = brush;
        brushOpts.color = bcolor;
        $(".first-color-previewer").css("background-color", bcolor);
        brushOpts.scolor = scolor;
        // $(".second-color-previewer").css("background-color", scolor);
        brushOpts.width = bwidth;
        $("#sli_brush_size").val(bwidth * 100);
        brushOpts.opacity = bopacity;
        $("#sli_brush_opacity").val(bopacity * 100);
        brushOpts.softness = bsoftness;
        $("#sli_brush_softness").val(bsoftness * 100);
        getFabricCanvas(canvasID, "CustomBrush", brushOpts);

        canvasDemo = (function () {
            var _config = {
                canvasState: [],
                currentStateIndex: -1,
                undoStatus: false,
                redoStatus: false,
                undoFinishedStatus: 1,
                redoFinishedStatus: 1,
                undoButton: document.getElementById('btn-undo'),
                redoButton: document.getElementById('btn-redo'),
            };
            fabricCanvas.on(
                'object:modified', function () {
                    updateCanvasState();
                }
            );

            fabricCanvas.on(
                'object:added', function () {
                //  /   updateCanvasState();
                }
            );

            var updateCanvasState = function () {
                let objs = fabricCanvas.getObjects();
                objs.forEach((obj, index) => {
                    if (!obj.layerid)
                        fabricCanvas.remove(obj);
                    else {
                        obj.orgLeft = 0;
                        obj.orgTop = 0;
                        obj.orgWidth = 0;
                        obj.orgHeight = 0;
                    }
                })

                // if (isJsonLoad)
                //     return;

                // let objs = fabricCanvas.getObjects();
                // objs.forEach((obj, index) => {
                //     if (!obj.layerid)
                //         fabricCanvas.remove(obj);
                // })

                // if ((_config.undoStatus == false && _config.redoStatus == false)) {
                //     var jsonData = fabricCanvas.toJSON(additional_attribute);
                //     var canvasAsJson = JSON.stringify(jsonData);
                //     if (_config.currentStateIndex < _config.canvasState.length - 1) {
                //         var indexToBeInserted = _config.currentStateIndex + 1;
                //         _config.canvasState[indexToBeInserted] = canvasAsJson;
                //         var numberOfElementsToRetain = indexToBeInserted + 1;
                //         _config.canvasState = _config.canvasState.splice(0, numberOfElementsToRetain);
                //     } else {
                //         _config.canvasState.push(canvasAsJson);
                //     }
                //     _config.currentStateIndex = _config.canvasState.length - 1;
                //     if ((_config.currentStateIndex == _config.canvasState.length - 1) && _config.currentStateIndex != -1) {
                //         _config.redoButton.setAttribute("disabled", true);
                //     }
                // }
            }

            var undo = function () {
                if (_config.undoFinishedStatus) {
                    if (_config.currentStateIndex == -1) {
                        _config.undoStatus = false;
                    }
                    else {
                        if (_config.canvasState.length >= 1) {
                            _config.undoFinishedStatus = 0;
                            if (_config.currentStateIndex != 0) {
                                _config.undoStatus = true;
                                isJsonLoad = true;
                                window.dispatchEvent(new CustomEvent("stop-draw"));
                                fabricCanvas.loadFromJSON(_config.canvasState[_config.currentStateIndex - 1], function () {
                                    fabricCanvas.renderAll();
                                    _config.undoStatus = false;
                                    _config.currentStateIndex -= 1;
                                    _config.undoButton.removeAttribute("disabled");
                                    if (_config.currentStateIndex !== _config.canvasState.length - 1) {
                                        _config.redoButton.removeAttribute('disabled');
                                    }
                                    _config.undoFinishedStatus = 1;
                                    reloadLayers();
                                    window.dispatchEvent(new CustomEvent("start-draw"));
                                });
                            }
                            else if (_config.currentStateIndex == 0) {
                                isJsonLoad = true;
                                window.dispatchEvent(new CustomEvent("stop-draw"));
                                fabricCanvas.loadFromJSON(initJsonData, function () {
                                    fabricCanvas.renderAll();
                                    reloadLayers();
                                    window.dispatchEvent(new CustomEvent("start-draw"));
                                });

                                _config.undoFinishedStatus = 1;
                                _config.undoButton.setAttribute("disabled", true);
                                _config.redoButton.removeAttribute('disabled');
                                _config.currentStateIndex -= 1;
                            }
                        }
                    }
                }
            }

            var redo = function () {
                if (_config.redoFinishedStatus) {
                    if ((_config.currentStateIndex == _config.canvasState.length - 1) && _config.currentStateIndex != -1) {
                        _config.redoButton.setAttribute("disabled", true);
                    } else {
                        if (_config.canvasState.length > _config.currentStateIndex && _config.canvasState.length != 0) {
                            _config.redoFinishedStatus = 0;
                            _config.redoStatus = true;
                            isJsonLoad = true;
                            window.dispatchEvent(new CustomEvent("stop-draw"));
                            fabricCanvas.loadFromJSON(_config.canvasState[_config.currentStateIndex + 1], function () {
                                fabricCanvas.renderAll();
                                _config.redoStatus = false;
                                _config.currentStateIndex += 1;
                                if (_config.currentStateIndex != -1) {
                                    _config.undoButton.removeAttribute('disabled');
                                }
                                _config.redoFinishedStatus = 1;
                                if ((_config.currentStateIndex == _config.canvasState.length - 1) && _config.currentStateIndex != -1) {
                                    _config.redoButton.setAttribute("disabled", true);
                                }
                                reloadLayers();
                                window.dispatchEvent(new CustomEvent("start-draw"));
                            });
                        }
                    }
                }
            }

            return {
                undoButton: _config.undoButton,
                redoButton: _config.redoButton,
                undo: undo,
                redo: redo,
                updateCanvasState: updateCanvasState
            }

        })();

        // canvasDemo.undoButton.addEventListener('click', function () {
        //     canvasDemo.undo();
        // });

        // canvasDemo.redoButton.addEventListener('click', function () {
        //     canvasDemo.redo();
        // });

        $(".loading-view").show();

        // $.ajax({
        //     url: "/draw/getdocument/" + documentMediaId,
        //     type: "GET",
        //     success: function (res) {
        //         current_doc = res.document;
        //         if (current_doc.jsonPath != "") {
        //             $.ajax({
        //                 url: "/uploads/documents/" + current_doc.jsonPath + "?v=" + current_doc.version,
        //                 dataType: 'json',
        //                 success: function (data) {
        //                     if (data) {
        //                         isJsonLoad = true;
        //                         window.dispatchEvent(new CustomEvent("stop-draw"));
        //                         fabricCanvas.loadFromJSON(data, function () {
        //                             reloadLayers();
        //                             setTimeout(() => {
        //                                 isJsonLoad = false;
        //                                 initJsonData = data;
        //                                 $(".loading-view").hide();
        //                             }, 200);
        //                         });
        //                     }
        //                     else {
        //                         window.dispatchEvent(new CustomEvent("add_layer", { detail: { selected: true, layername: "", layerid: "", visible: true, isExist: false } }));
        //                         setTimeout(() => {
        //                             initJsonData = fabricCanvas.toJSON(additional_attribute);
        //                             $(".loading-view").hide();
        //                         }, 500);
        //                     }
        //                 },
        //                 error: function (data) {
        //                     window.dispatchEvent(new CustomEvent("add_layer", { detail: { selected: true, layername: "", layerid: "", visible: true, isExist: false } }));
        //                     setTimeout(() => {
        //                         initJsonData = fabricCanvas.toJSON(additional_attribute);
        //                         $(".loading-view").hide();
        //                     }, 500);
        //                 }
        //             });
        //         }
        //         else {
        //             isJsonLoad = true;
        //             window.dispatchEvent(new CustomEvent("add_layer", { detail: { selected: true, layername: "", layerid: "", visible: true, isExist: false } }));
        //             setTimeout(() => {
        //                 isJsonLoad = false;
        //                 initJsonData = fabricCanvas.toJSON(additional_attribute);
        //                 $(".loading-view").hide();
        //             }, 200);
        //         }
        //     },
        //     fail: function (err) {
        //         setTimeout(() => {
        //             initJsonData = fabricCanvas.toJSON(additional_attribute);
        //             $(".loading-view").hide();
        //         }, 500);
        //     }
        // });
       
        const dat = DatGui(brushOpts, fabricCanvas);

        window.addEventListener("add_layer", (e) => {
            addLayer(e);
        });

        window.addEventListener("change_brush_color", (e) => {
            let fcolor = $(".first-color-previewer").css("background-color");
            // let scolor = $(".second-color-previewer").css("background-color");
            setBrushColor(fcolor);
            fabricCanvas.freeDrawingBrush.color = fcolor;
            // fabricCanvas.freeDrawingBrush.scolor = scolor;
        });

        $(".layer-drawer-submenu-item").click(function (e) {
            $(this).addClass("menu-selected");
            let action = $(this).data("action");

            let layer = $(".layer-drawer-mainitem.menu-selected");
            let layerid = layer.attr("data-layer-id");
            let layername = layer.attr("data-layer-name");

            let selectedGroup = fabricCanvas.getObjects().filter(x => x.layerid == layerid);
            if (selectedGroup.length > 0) {
                selectedGroup = selectedGroup[0];
            }
            else
                return;

            switch (action) {
                case "rename":
                    {
                        layer.find(".layer-drawer-mainitem-text").addClass("editable-object");
                        layer.find(".layer-drawer-mainitem-text").dblclick();
                    }
                    break;
                case "copy":
                    {
                        window.dispatchEvent(new CustomEvent("add_layer", { detail: { selected: true, layername: layername + "-copy", layerid: "", visible: true, isExist: false, isCopy: true, clayerid: layerid } }));
                    }
                    break;
                case "clear":
                    {
                        let objs = selectedGroup.getObjects();
                        objs.forEach((obj, index) => {
                            selectedGroup.removeWithUpdate(obj);
                        })
                        renderCanvas();
                    }
                    break;
                case "delete":
                    {
                        let objs = selectedGroup.getObjects();
                        objs.forEach((obj, index) => {
                            selectedGroup.removeWithUpdate(obj);
                        })
                        fabricCanvas.remove(selectedGroup);
                        if (layer.next()) {
                            layer.next().click();
                        }
                        layer.remove();
                        renderCanvas();
                    }
                    break;
                case "frame":
                    {
                        if (layer.find(".layer-hide")[0].style.display != 'none') {
                            if (selectedGroup.getObjects().length > 0) {
                                if (selectedGroup.isFrame) {
                                    selectedGroup.isFrame = false;
                                    selectedGroup.orgWidth = 0;
                                    selectedGroup.orgHeight = 0;
                                    selectedGroup.orgTop = selectedGroup.orgLeft = 0;
                                    $(".layer-drawer-submenu-item[data-action='frame']").removeClass("menu-selected");
                                }
                                else {
                                    selectedGroup.isFrame = true;
                                    selectedGroup.orgWidth = 0;
                                    selectedGroup.orgHeight = 0;
                                    selectedGroup.orgTop = selectedGroup.orgLeft = 0;
                                    $(".layer-drawer-submenu-item[data-action='frame']").addClass("menu-selected");
                                }
                                // canvasDemo.updateCanvasState();
                            }
                            else {
                                if (selectedGroup.isFrame) {
                                    selectedGroup.isFrame = false;
                                    selectedGroup.orgWidth = 0;
                                    selectedGroup.orgHeight = 0;
                                    selectedGroup.orgTop = selectedGroup.orgLeft = 0;
                                    $(this).removeClass("menu-selected");
                                }
                                else
                                    alert("Current layer is empty.");
                            }
                        }
                    }
                    break;
                case "move_down":
                    {
                        let index = fabricCanvas.getObjects().indexOf(selectedGroup);
                        if (index > 0) {
                            selectedGroup.sendBackwards();
                            let layer = $(".layer-drawer-mainitem.menu-selected");
                            layer.insertAfter(layer.next());
                            $(".layer-drawer-mainitem[data-layer-id='" + selectedGroup.layerid + "'").click();
                        }
                    }
                    break;
                case "move_up":
                    {
                        let index = fabricCanvas.getObjects().indexOf(selectedGroup);
                        let len = fabricCanvas.getObjects().length;
                        if (index != -1 && index != len - 1) {
                            selectedGroup.bringForward();
                            let layer = $(".layer-drawer-mainitem.menu-selected");
                            layer.insertBefore(layer.prev());
                            $(".layer-drawer-mainitem[data-layer-id='" + selectedGroup.layerid + "'").click();
                        }
                    }
                    break;
                case "merge_down":
                    {
                        let index = fabricCanvas.getObjects().indexOf(selectedGroup);
                        if (index > 0) {
                            let downGroup = fabricCanvas.getObjects()[index - 1];
                            let items = selectedGroup._objects;
                            // translate the group-relative coordinates to canvas relative ones
                            selectedGroup._restoreObjectsState();
                            // remove the original group and add all items back to the canvas
                            fabricCanvas.remove(selectedGroup);
                            for (var i = 0; i < items.length; i++) {
                                fabricCanvas.add(items[i]);
                                addObjectToLayer(downGroup, items[i]);
                                fabricCanvas.remove(items[i]);
                            }
                            // if you have disabled render on addition
                            fabricCanvas.remove(selectedGroup);
                            layer.remove();
                            $(".layer-drawer-mainitem[data-layer-id='" + downGroup.layerid + "'").click();
                        }
                    }
                    break;
            }

            $(".layer-drawer-submenu-item:not([data-action='frame'])").removeClass("menu-selected");
        });

        window.addEventListener("frame_event", (e) => {
            let selectedGroup = e.detail.group;
            fabricCanvas.clearContext(fabricCanvas.contextTop);
            fabricCanvas.contextTop.drawImage(selectedGroup._cacheCanvas, selectedGroup.left, selectedGroup.top);
            //clear
            let objs = selectedGroup.getObjects();
            objs.forEach((obj, index) => {
                selectedGroup.removeWithUpdate(obj);
            })
            renderCanvas();
        })

        window.addEventListener("change_layer_name", (e) => {
            let selectedGroup = fabricCanvas.getObjects().filter(x => x.layerid == e.detail.id);
            if (selectedGroup.length > 0) {
                selectedGroup = selectedGroup[0];
            }
            else
                return;
            selectedGroup.layername = e.detail.name;

            $("[data-layer-id='" + e.detail.id + "'] .layer-name").removeClass("editable-object");
            $("[data-layer-id='" + e.detail.id + "'] .layer-name").attr("contenteditable", false);
        });

        window.addEventListener("change_brush_size", (e) => {
            let value = e.detail.brush_size * 0.01;
            setBrushWidth(value);
            fabricCanvas.freeDrawingBrush.width = value;
            fabricCanvas.freeDrawingBrush.setSize(value);
        });

        window.addEventListener("change_brush_opacity", (e) => {
            let value = e.detail.brush_opacity * 0.01;
            setBrushOpacity(value);
            fabricCanvas.freeDrawingBrush.opacity = value;
        });

        window.addEventListener("change_brush_softness", (e) => {
            let value = e.detail.brush_softness * 0.01;
            setBrushSoftness(value);
            fabricCanvas.freeDrawingBrush.softness = value;
            fabricCanvas.freeDrawingBrush.setSoftness(value);
        });

        window.addEventListener("filter_layer", (e) => {
            let layer = $(".layer-drawer-mainitem.menu-selected");
            let layerid = layer.attr("data-layer-id");

            let selectedGroup = fabricCanvas.getObjects().filter(x => x.layerid == layerid);
            if (selectedGroup.length > 0) {
                selectedGroup = selectedGroup[0];
            }
            else
                return;
            selectedGroup[e.detail.type] = e.detail.value * 0.01;
            selectedGroup._objects.forEach((object, index) => {
                if (object.filters && !isJsonLoad) {
                    object.filters.length = 0;
                    selectedGroup.clipTo = false;
                    object.filters.push(new fabric.Image.filters.Brightness({ brightness: parseFloat(selectedGroup.brightness ? selectedGroup.brightness : 0) }));
                    object.filters.push(new fabric.Image.filters.Contrast({ contrast: parseFloat(selectedGroup.contrast ? selectedGroup.contrast : 0) }));
                    object.filters.push(new fabric.Image.filters.Saturation({ saturation: parseFloat(selectedGroup.saturation ? selectedGroup.saturation : 0) }));
                    object.filters.push(new fabric.Image.filters.HueRotation({ rotation: parseFloat(selectedGroup.hue ? selectedGroup.hue : 0) }));
                    object.filters.push(new fabric.Image.filters.Blur({ blur: parseFloat(selectedGroup.blur ? selectedGroup.blur : 0) }));
                    object.applyFilters();
                    selectedGroup.clipTo = true;
                }
            });
            fabricCanvas.renderAll();
        });
        dat.addButtons();
        fabricCanvas.contextTop.globalAlpha = brushOpts.opacity;
    })('previewer');
}

$(document).ready(function () {
    $('.imageSection').hide();
    shapes.forEach((shape) => {
        $('.image-load').append('<img src="' + shape + '" style="visible: hidden;"/>');
    })
    textures.forEach((texture) => {
        $('.image-load').append('<img src="' + texture + '" style="visible: hidden;"/>');
    })
    var imgs = $('.image-load').find("img"),
        len = imgs.length,
        counter = 0;

    [].forEach.call(imgs, function (img) {
        if (img.complete)
            incrementCounter();
        else
            img.addEventListener('load', incrementCounter, false);
    });

    window.addEventListener("load_canvas", (e) => {
        loadCanvas();
        window.dispatchEvent(new CustomEvent("loaded_canvas", {}));
        $('.imageSection').show();
    })

    function incrementCounter() {
        counter++;
        if (counter === len) {
            console.log('All images loaded!');
            $.getJSON("/static/" + brushPath, function (data) {
                var items = [];
                $.each(data, function (key, val) {
                    if (localStorage.getItem(key) == null) {
                        // console.log(key, val);
                        localStorage.setItem(key, JSON.stringify(val));
                    }
                });
            });
        }
    }

    var emptyMode = "None Button";
    $(document).on("mouseup", "tc-range-slider", function (e) {
        // canvasDemo.updateCanvasState();
    });

    $(document).on("click", ".color-picker-previewer", function (e) {
        $(".color-picker-previewer").removeClass("selected");
        $("#color-block").wheelColorPicker("setValue", $(this).css("background-color"));
        $(this).addClass("selected");
    })

    let _prevFabricCanvasJson = null;
    function saveDoc(goHome = false) {
        if (fabricCanvas.freeDrawingBrush._isErasing)
            return;
        let canvasJson = fabricCanvas.toJSON(additional_attribute);
        if (_.isEqual(_prevFabricCanvasJson, canvasJson)) {
            if (goHome)
                window.location = "/";
            return;
        };
        _prevFabricCanvasJson = canvasJson;
        let fabricdata = JSON.stringify(canvasJson);
        let blob = new Blob([fabricdata], { type: 'application/json' });
        let jsonfile = new File([blob], 'fabric.json');

        var imgdata = base64URLProcess(fabricCanvas.toDataURL({ "multiplier": 1 }));
        
        var formData = new FormData();
        formData.append("fabricJsonFile", jsonfile, 'fabric.json');
        formData.append("previewImgFile", b64toBlob(imgdata, "image/png"), 'preview.png');
        $.ajax({
            url: "/draw/save/" + documentMediaId,
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                console.log("success saved!");
                if (goHome)
                    window.location = "/";
            },
            fail: function (xhr, textStatus, errorThrown) {
                console.log("save failed!");
                if (goHome)
                    window.location = "/";
            }
        });
    }

    // var saveIntervalId = setInterval(saveDoc, 60 * 1000);

    async function getBase64ImageFromUrl(imageUrl) {
        var res = await fetch(imageUrl);
        var blob = await res.blob();

        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.addEventListener("load", function () {
                resolve(reader.result);
            }, false);

            reader.onerror = () => {
                return reject(this);
            };
            reader.readAsDataURL(blob);
        })
    }

    function addLayerFromImage(url, fileType="", layerid = "", layername = "", selected = false, visible = true) {
        var cw = window.innerWidth - ($("#library").hasClass("closed") ? 0 : 380) - $("#sidebar")[0].clientWidth;
        var ch = window.innerHeight - $("#timeliner")[0].clientHeight - 20;
        cw = Math.min(cw, ch);
        ch = cw;
        addLayer({ detail: { selected: selected, layername: layername, layerid: layerid, visible: visible, isExist: false, objects: [] } });
        let selectedGroup = fabricCanvas.getObjects().filter(x => x.layerid == layerid);
        if (selectedGroup.length > 0) {
            selectedGroup = selectedGroup[0];
        }
        let size = Math.min(cw, ch) * 0.8;
        if (fileType === 'image/svg+xml') { //check if svg
            fabric.loadSVGFromURL(url, function (objects, options) {
                var svg = fabric.util.groupSVGElements(objects, options);
                let w, h;
                if (svg.height > svg.width) {
                    h = size;
                    w = (svg.width / svg.height) * size;
                }
                else {
                    w = size;
                    h = (svg.height / svg.width) * size;
                }
                w = Math.floor(w), h = Math.floor(h);
                let left = Math.floor((cw - w) / 2), top = Math.floor((ch - h) / 2);
                svg.scaleToWidth(w);
                svg.scaleToHeight(h);
                svg.set({
                    left: left,
                    top: top
                });
                fabricCanvas.add(svg);
                addObjectToLayer(selectedGroup, svg);
                fabricCanvas.remove(svg);
            });
        }
        else {
            fabric.Image.fromURL(url, function (img) {
                let w, h;
                if (img.height > img.width) {
                    h = size;
                    w = (img.width / img.height) * size;
                }
                else {
                    w = size;
                    h = (img.height / img.width) * size;
                }
                w = Math.floor(w), h = Math.floor(h);
                let left = Math.floor((cw - w) / 2), top = Math.floor((ch - h) / 2);
                getBase64ImageFromUrl(url)
                    .then(result => {
                        img._element.src = result;
                        img.scaleToWidth(w);
                        img.scaleToHeight(h);
                        img.set({
                            left: left,
                            top: top
                        });
                        fabricCanvas.add(img);
                        addObjectToLayer(selectedGroup, img);
                        fabricCanvas.remove(img);
                    })
                    .catch(err => {
                        console.error(err);
                    });
            });
        }
    }

    window.addEventListener("add-layer-image", (e) => {
        addLayerFromImage(e.detail.url, e.detail.fileType, e.detail.layerid, e.detail.layername, e.detail.selected, e.detail.visible);
    })

    window.addEventListener("show-layer-image", (e) => {
        let selectedGroup = fabricCanvas.getObjects().filter(x => x.layerid == e.detail.layer.id);
        if (selectedGroup.length > 0) {
            selectedGroup = selectedGroup[0];
            selectedGroup.visible = e.detail.layer.visible;
            fabricCanvas.renderAll();
        }
    })

    window.addEventListener("delete-layer-image", (e) => {
        let selectedGroup = fabricCanvas.getObjects().filter(x => x.layerid == e.detail.layer.id);
        objs.forEach((obj, index) => {
            selectedGroup.removeWithUpdate(obj);
        })
        fabricCanvas.remove(selectedGroup);
        if (layer.next()) {
            layer.next().click();
        }
        layer.remove();
        renderCanvas();
    });

    window.addEventListener("prepare-layer-image", (e) => {
        if (e.detail.isWhole) {
            // Convert the canvas to a blob object
            var imgdata = base64URLProcess(fabricCanvas.toDataURL({ "multiplier": 1 }));
            var blob = b64toBlob(imgdata, "image/png")
            // Create a new file object from the blob
            var file = new File([blob], 'file.png', {type: 'image/png'});

            var formData = new FormData();
            formData.append('type', 'Image');
            formData.append('projectId', e.detail.projectId);
            formData.append('file', file);

            $.ajax({
                url: "/asset/my-image/upload",
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function (res) {
                    console.log("success uploaded!");
                    window.dispatchEvent(new CustomEvent("export-layer-image", {detail:{files: [file], imageId: res.files[0].imageId}}))
                },
                fail: function (xhr, textStatus, errorThrown) {
                    console.log("upload failed!");
                }
            });
        }
        else {
            let id = e.detail.layerId;
            let selectedGroup = fabricCanvas.getObjects().filter(x => x.layerid == id);
            // Convert the canvas to a blob object
            selectedGroup[0].toCanvasElement().toBlob(function(blob) {
                // Create a new file object from the blob
                var file = new File([blob], 'image.png', {type: 'image/png'});
                window.dispatchEvent(new CustomEvent("export-layer-image", {detail:{files: [file], imageId: e.detail.imageId}}))
            }, 'image/png');
        }
    });

    window.addEventListener("move-layer-image", (e) => {
        var objs = fabricCanvas.getObjects();
        let oldObj = objs[e.detail.oldIndex];
        oldObj.moveTo(e.detail.newIndex);
        renderCanvas();
    })


    $(document).on("click", ".drawSection", function (event) {
        if (!event.clientX)
            return;
        if ($(".tool-dialog:not(.inactive)").length > 0) {
            var rect = $(".tool-dialog:not(.inactive)")[0].getBoundingClientRect();
            var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height
                && rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
            if (!isInDialog) {
                if ($(".pin-it").hasClass("active")) {
                    $(".tool-dialog:not(#brush-tool)").addClass("inactive");
                }
                else
                    $(".tool-dialog").addClass("inactive");
            }
        }
    });

    $(document).on("click", ".btn-brush", function (event) {
        window.dispatchEvent(new CustomEvent("start-draw"));
    });

    $(document).on("click", ".btn-erase", function (event) {
        window.dispatchEvent(new CustomEvent("erase-draw"));
    });

    $(document).on("click", ".btn-move", function (event) {
        window.dispatchEvent(new CustomEvent("stop-draw"));
    });

    $(document).on("click", ".pin-it", function (event) {
        $(this).toggleClass('active');
    });

    $(document).on("click", ".toolbar-icon", function (e) {
        switch ($(this).attr('id')) {
            case "color-previewer":
                {
                    // $(".tool-dialog:not(#color-tool)").addClass("inactive");
                    $("#color-tool").toggleClass("inactive");
                }
                break;
            case "filter":
                {
                    $(".tool-dialog:not(#filter-tool)").addClass("inactive");
                    $("#filter-tool").toggleClass("inactive");
                }
                break;
            default:
                $(".tool-dialog").addClass("inactive");
                break;
        }

        $(".toolbar-icon").removeClass("selected");
        $(this).addClass("selected");
        if ($(".tool-dialog:not(.inactive)").length > 0) {
            $(".modal-backdrop").removeClass("d-none");
        }
        else
            $(".modal-backdrop").addClass("d-none");
    });

});