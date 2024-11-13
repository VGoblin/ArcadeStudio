
import { UIDiv, UIPanel, UIButton, UIRow, UIImageButton, UIText, UIRowShelf, UINumber, UIInput, UIImage, UITextArea } from '../components/ui.js';
import { LibraryAiToolLayerMenu } from "./../library/Library.AiTool.Layer.Menu.js";

const axios = require('axios');

import Sortable from 'sortablejs';

var AiToolControlBar = function (editor) {

    var assets = editor.assets;
    var config = editor.config;
    var container = new UIPanel().setWidth("250px").setMarginLeft('auto').setFontSize('12px').setClass('ai-control-panel d-flex');
    var params = {};
    var cnt = 0;
    var signals = editor.signals;
    var api = editor.api;
    var loader = editor.loader;
    var layers = [
    ];
    var stopItems = [];
    var isGenerating = false;
    var isExporting = false;
    var isSaving = false;
    var layerSection = new UIDiv();
    layerSection.setClass("layerSection");
    layerSection.addClass("drawer-mainpanel");
    container.add(layerSection);

    var generateSection = new UIDiv();
    generateSection.setClass("generateSection");
    //Mult-Threading
    //As a worker normally take another JavaScript file to execute we convert the function in an URL: http://stackoverflow.com/a/16799132/2576706
    function getScriptPath(foo) { return window.URL.createObjectURL(new Blob([foo.toString().match(/^\s*function\s*\(\s*\)\s*\{(([\s\S](?!\}$))*[\s\S])/)[1]], { type: 'text/javascript' })); }

    function encode (input) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
    
        while (i < input.length) {
            chr1 = input[i++];
            chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
            chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here
    
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
    
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                      keyStr.charAt(enc3) + keyStr.charAt(enc4);
        }
        return output;
    }
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

    editor.signals.generateNewAiImage.add((layer) => {
        addLayer(layer, false);
    });

    editor.signals.endSaveAiImage.add(() => {
        isExporting = false;
        signals.hideWrapper.dispatch();
        signals.saveAiLayer.dispatch();
    });

    editor.signals.endSaveAiLayer.add(() => {
        stopItems = [];
        isSaving = false;
        signals.hideWrapper.dispatch();
    });

    editor.signals.saveAiLayer.add(() => {
        if (layers.length == 0)
        {
            return;
        }
        // if (isExporting)
        // {
        //     alert("Now Exporting Image...");
        //     return;
        // }
        if (isGenerating)
        {
            // alert("Now Generating Image...");
            return;
        }
        if (isSaving)
        {
            // alert("Now Saving Layers...");
            return;
        }
        isSaving = true;
        
        signals.showWrapper.dispatch( "SAVING ... ");

        let order = layerSection.dom.childNodes.length;
        layerSection.dom.childNodes.forEach((child)=>{
            // let layername = child.classList[1];
            let layername = child.attr("class").replace("ai-layer", "").trim();
            layers.map((layer) => {
                if (layer.name == layername)
                {
                    layer.order = order --;
                    return layer;
                }
            })
        })

        api.post( '/asset/ai-image/update', { items: layers } ).then( res => {
            if (res.status == "error")
            {
                // alert(res.message);
            }
            else
            {
                cnt = layerSection.dom.childNodes.length;
                layers = layers.filter(layer => !layer.removed);
            }
            signals.endSaveAiLayer.dispatch( );
        } );
    });

    editor.signals.saveAiImage.add((isWhole) => {
        var layerId = 0, imageId = 0;
        if (!isWhole)
        {
            if (layers.length == 0)
                return;
            let layer = $(".layer-drawer-mainitem.menu-selected");
            layerId = layer.attr("data-layer-id");
            imageId = layer.attr("id");
        }
        // if (isSaving)
        // {
        //     alert("Now Saving Layer...");
        //     return;
        // }
        if (isExporting)
        {
            // alert("Now Exporting Image...");
            return;
        }
        isExporting = true;
        signals.showWrapper.dispatch("Exporting ...");
        window.dispatchEvent(new CustomEvent("prepare-layer-image", { detail: {layerId: layerId, imageId: imageId, isWhole: isWhole, projectId: editor.projectId} }));
    });

    window.addEventListener("export-layer-image", (e) => {
        signals.exportAiImage.dispatch( e.detail.files, e.detail.imageId );
    });

    function addLayer(layer, flag = true) {
        var uilayer = new UIDiv();
        if (layer.selected) {
            uilayer.setClass("menu-selected");
        }
        uilayer.addClass("ai-layer");
        uilayer.addClass(layer.name);
        uilayer.addClass("layer-drawer-mainitem");
        
        uilayer.dom.attr("data-layer-id", layer.id);
        uilayer.dom.attr("data-layer-name", layer.name);
        uilayer.setId(layer.id);
        var icon = new UIImage(layer.url);
        icon.setClass("ai-layer-icon");
        icon.setWidth(34);
        uilayer.add(icon);

        // icon.onContextMenu(function(e) {
        //     e.preventDefault();
        //     e.stopPropagation();
        // });
        icon.dom.ondragstart = () => {
            return false;
        };

        var prompt = new UIText(layer.prompt);
        prompt.setClass("ai-layer-prompt");
        uilayer.add(prompt);

        var visibleButton = new UIImage(config.getImage('engine-ui/visible-btn.svg'));
        visibleButton.setClass('layer-hide VisibleButton');

        var notVisibleButton = new UIImage(config.getImage('engine-ui/not-visible-btn.svg'));
        notVisibleButton.setClass('layer-show VisibleButton');

        if (layer.visible) {
            visibleButton.setDisplay('block');
            notVisibleButton.setDisplay('none');

        } else {
            visibleButton.setDisplay('none');
            notVisibleButton.setDisplay('block');
        }
        visibleButton.onClick(function (e) {
            layer.visible = false;
            visibleButton.setDisplay('none');
            notVisibleButton.setDisplay('block');
            layers.map((item) => {
                if (layer.id == item.id)
                {
                    layer.visible = false;
                    return layer;
                }
            })
            window.dispatchEvent(new CustomEvent("show-layer-image", { detail: { layer: layer } }));
        });
        notVisibleButton.onClick(function (e) {
            layer.visible = true;
            notVisibleButton.setDisplay('none');
            visibleButton.setDisplay('block');
            layers.map((item) => {
                if (layer.id == item.id)
                {
                    layer.visible = true;
                    return layer;
                }
            })
            window.dispatchEvent(new CustomEvent("show-layer-image", { detail: { layer: layer } }));
        });
        uilayer.add(visibleButton);
        uilayer.add(notVisibleButton);

        var menu = new LibraryAiToolLayerMenu();
        uilayer.add( menu.container );

        menu.onDelete( function () {

            layerSection.dom.removeChild(uilayer.dom);

            layers.map((item) => {
                if (layer.id == item.id)
                {
                    layer.removed = true;
                    return layer;
                }
            })
            signals.deleteAiImageLayer.dispatch( layer );
            menu.container.setDisplay("none");

		} );

		menu.onCopyPrompt( function () {

			navigator.clipboard.writeText(layer.prompt).then(
                function () {
                },
                function (err) {
                  console.error("Async: Could not copy text: ", err)
                }
            )
            menu.container.setDisplay("none");

		} );

        uilayer.onClick(function(e) {
            $(".layer-drawer-mainitem").removeClass("menu-selected");
            $(this)[0].addClass("menu-selected");
        });

        uilayer.onContextMenu(function(e) {
            e.preventDefault();
            e.stopPropagation();
            $('.FolderItemMenu').hide();
            var { top, left } = uilayer.dom.getBoundingClientRect();
			menu.container.setLeft( ( e.clientX - left ) + 'px' );
			menu.container.setTop( ( e.clientY - top ) + 'px' );
			menu.container.setDisplay( 'block' );
        });

        layerSection.prepend(uilayer);
    }

    window.addEventListener("loaded_canvas", (e) => {
        console.log("loaded_canvas");
        api.get( '/asset/ai-image' ).then( res => {
            let images = res.items;
            images.sort((a, b) => (a.order - b.order));
            images.map((image, index) => {
                if (image) {
                    var newlayer = {
                        url: image.url,
                        name: image.name,
                        prompt: image.prompt,
                        visible: image.visible,
                        id: image.id,
                        imageId: image.imageId,
                        order: image.order,
                        selected: (index == images.length - 1)
                    };
                    cnt = Math.max(cnt, newlayer.order);
                    layers.push(newlayer);
                    signals.generateNewAiImage.dispatch( newlayer );
                }
            });
        } ).catch( err => {
            console.log( err );
        } );
    });
    //
    var observe;
    if (window.attachEvent) {
        observe = function (element, event, handler) {
            element.attachEvent('on'+event, handler);
        };
    }
    else {
        observe = function (element, event, handler) {
            element.addEventListener(event, handler, false);
        };
    }
    var promptInput = new UITextArea('');
    promptInput.setClass("prompt");
    var text = promptInput.dom;
    text.placeholder = "Start typing your prompt here...";
    function resize () {
        text.style.height = 'auto';
        text.style.height = text.scrollHeight+'px';
    }
    /* 0-timeout to get the already changed text */
    function delayedResize () {
        window.setTimeout(resize, 0);
    }
    observe(text, 'change',  resize);
    observe(text, 'cut',     delayedResize);
    observe(text, 'paste',   delayedResize);
    observe(text, 'drop',    delayedResize);
    observe(text, 'keydown', delayedResize);

    text.focus();
    text.select();
    resize();
    //

    var generateBtn = new UIButton("Generate");
    generateBtn.setClass("generate");

    const controller = new AbortController();

    var stopGenerate = function() {
        // controller.abort();
        stopItems.push(cnt);
        isGenerating = false;
        generateBtn.setLabel("Generate");
        signals.stopGenAiImage.dispatch( );
    }
    
    var endGenerate = function() {
        promptInput.setValue('');
        generateBtn.setLabel("Generate");
        isGenerating = false;
        signals.stopGenAiImage.dispatch( );
    }

    var generateAiImage = async function(e) {
        if (isGenerating)
        {
            stopGenerate();
            return;
        }
        // if (isSaving)
        // {
        //     alert("Now Saving Layer...");
        //     return;
        // }
        const prompt_text = promptInput.getValue();
        if (!prompt_text.trim())
        {
            alert("Please enter a valid prompt");
            return;
        }
        cnt ++;
        isGenerating = true;
        generateBtn.setLabel("Stop");
        let data = {prompt: prompt_text, cnt: cnt};
        signals.startGenAiImage.dispatch( );
        api.post( '/asset/image/gen-ai-image', data ).then( res => {
            try {
                if (res.error)
                {
                    // alert(res.error.message);
                    stopGenerate();
                    return;
                }
                if (stopItems.indexOf(data.cnt) != -1)
                {
                    return;
                }
                let image_url = res.result;
                var bs = atob(encode(res.data.data));
                var buffer = new ArrayBuffer(bs.length);
                var ba = new Uint8Array(buffer);
                for (var i = 0; i < bs.length; i++) {
                    ba[i] = bs.charCodeAt(i);
                }
                var myBlob = new Blob([ba],{type:"image/png"});
                var myFile = new File([myBlob], 'image.png');
                var files = [
                    myFile
                ];

                var formData = new FormData();
                formData.append( 'type', 'Image' );
                formData.append( 'order', cnt );
                formData.append( 'prompt', prompt_text );
                formData.append( 'ai_url', image_url );
                formData.append( 'projectId', editor.projectId );
                for ( let i = 0; i < files.length; i++ ) {
                    formData.append( 'file', files[i] );
                }

                api.post( '/asset/ai-image/upload', formData ).then( res => {
                    if (res.status == "error")
                    {
                        console.log(res.message);
                    }
                    else
                    {
                        for ( var file of res.files ) {
                            var newlayer = {
                                url: file.url,
                                name: file.name,
                                prompt: prompt_text,
                                visible: true,
                                id: file.id,
                                imageId: file.imageId,
                                order: cnt,
                                selected: true
                            };
    
                            layers.push(newlayer);
                            signals.generateNewAiImage.dispatch( newlayer );  
                        }
                    }
                    endGenerate();
                } );
            } catch (error) {
                console.log(error);
                endGenerate();
            }

        } );

    };
    
    generateBtn.dom.addEventListener("click", generateAiImage, { signal: controller.signal });

    new Sortable(layerSection.dom, {
        draggable: ".ai-layer",
        swapThreshold: 1,
        animation: 150,
        onUpdate: function (e) {
            // console.log(e);
            signals.moveAiImageLayer.dispatch( e );
        },
    });

    generateSection.add(promptInput);
    generateSection.add(generateBtn);

    container.add(generateSection);
    return container;
};

export { AiToolControlBar };
