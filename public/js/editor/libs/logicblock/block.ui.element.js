const { RGBELoader } = require("../../core/loaders/RGBELoader");
const { default: createDialog } = require("../../ui/components/Dialog/index");
const { renderToCanvas } = require("../../ui/components/ui.three");
const { createCurve } = require("../../ui/easings-graph");
const { default: chartEditor } = require("../../ui/easings-graph/chartEditor");
const { isD3Easing } = require("../../ui/easings-graph/easeFunction");
const { default: stringToHtml } = require("../../ui/utils/stringToHtml");
const { clockDurationChangedEventName, logicBlockToggleKey, defaultEasing } = require("./constants");
const { default: getLogicBlockUsingChild } = require("./utils/getLogicBlockUsingChild");
const { default: refreshLogicBlock } = require("./utils/refreshLogicBlock");

window.BlockUIElement = {};

BlockUIElement.label = function ( className, key, label ) {

    return $(`<div data-key="${key}" class="${className}"><div class="block-text bar">${label}</div></div>`);

}

/** This is a description of the foo function. */
BlockUIElement.editable = function ( className, key, label, value ) {

    var object = $(`<div class="editable ${className}" spellcheck="false" data-key="${key}"></div>`);
    if (label != '' && label != undefined)
        object.append(`<div class="block-text-label">${label}</div>`);
    object.append(`<div class="block-text bar ${key}">${value == undefined ? '?' : value}</div>`);

    return object;

}


BlockUIElement.degree = function ( className, key, label, value ) {

    var object = $(`<div class="editable ${className}" data-key="${key}"></div>`);
    if (label != '' && label != undefined)
        object.append(`<div class="block-text-label">${label}</div>`);
    object.append(`<div class="block-text bar degree ${key}">${value == undefined ? '?' : value}</div>`);
    object.append('<div class="block-degree"></div>');

    return object;

}

BlockUIElement.toggle = function ( className, key, label, on, off ) {

    var image = '<img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/arrow.svg" width="12" height="12" alt="" class="menu">';
    var object = $(`<div data-key="${key}" data-toggle="${off}" class="toggle ${className}"></div>`);
    if (label != '' && label != undefined)
        object.append(`<div class="block-text-label">${label}</div>`);
    object.append(`<div class="block-text bar ${key}">${on}</div>`);
    object.append(image);

    return object;

}

BlockUIElement.imageToggle = function ( className, key, label, on, off ) {

    var image = '<img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/arrow.svg" width="12" height="12" alt="" class="menu">';
    var object = $(`<div data-key="${key}" data-toggle="${off}" class="toggle ${className}"></div>`);
    if (label != '' && label != undefined)
        object.append(`<div class="block-text-label">${label}</div>`);
    object.append(`<div class="block-text bar ${key}">${on}</div>`);
    object.append(image);

    return object;

}

BlockUIElement.color = function ( className, color ) {

    var object = $(`<div class="color-picker ${className}"></div>`);
    object.append(`<div class="block-color" style="background-color: ${color}"></div>`);
    object.append(`<input type="color" style="display: none;" value="${color}" />`);

    return object;

}

BlockUIElement.image = function ( className, asset, accept ) {

    var object = $(`<div class="image-picker ${className}" style="position:relative"><div class="w-lightbox-spinner" style="display: none;width: 20px;height: 20px;margin-top: -10px;margin-left: -10px;"></div></div>`);

    var canvas = $('<canvas class="block-file"></canvas>');

    object.append(canvas);
    object.append('<input type="file" style="display: none;" />');
    
    if ( asset && asset.texture) {

       

        var image = asset.texture.image;
        var context = canvas[0].getContext( '2d' );
        var scale = canvas[0].width / image.width;

        if ( image.data === undefined ) {

            context.drawImage( image, 0, 0, image.width * scale, image.height * scale );

        } else {

            var canvas2 = renderToCanvas( asset.texture );
            context.drawImage( canvas2, 0, 0, image.width * scale, image.height * scale );

        }

        // context.drawImage( image, 0, 0, image.width * scale, image.height * scale );

    }
    if (accept){
        object.attr('data-accept', accept);
    };
    return object;

}

BlockUIElement.clock = function ( parent, key, duration, end, options ) {

    var elem = $(`<div data-key="${ key ? key : 'duration' }" class="editable block ${end == true ? 'd-br-none' : ''}"></div>`);
    if(options && options.withoutOver){
      elem.append(`<div></div>`);
    }else{
      elem.append(`<div class="block-text-label ml-10">over :</div>`);
    }

    elem.append(`<div class="block-text bar">${duration ? duration : '?'}</div>`);
    elem.append(`<div class="block-text-label mr-10"> seconds</div>`);

    /** to update the value for easing duration */
    elem[0].querySelector('.block-text.bar').addEventListener("input", ()=>{
        let textElem = elem[0].querySelector('.block-text.bar');
        const clockDurationChangedEvent = new CustomEvent(clockDurationChangedEventName,{detail:{val:textElem.innerText, elem:textElem}});
        window.dispatchEvent(clockDurationChangedEvent);
    });
  
    parent.append(elem);

}

BlockUIElement.dropdown = function ( wrapperClassName, key, selectedClassName, selectedText, options, extraOptions ) {
    
    const onlyTwoItems = options.length === 2 ? 'only-two-items' : '';

    var dropdownWrapper = function ( className, key ) {

        return $('<div class="w-dropdown ' + className + '" data-key="' + key + '"></div>');

    }

    var dropdownSelected = function (className, type, name) {
        var image = '<img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/arrow.svg" width="12" height="12" alt="" class="menu">';
        var object = $('<div class="' + onlyTwoItems+ ' ' + className + ' dropdown"></div>');
        object.append('<div class="block-text bar ' + type + '">' + name + '</div>');
        object.append(image);

        return object;
    }

    var dropdownList = function () {
        return $('<nav class="dropdown-list w-dropdown-list"></nav>');
    }

    var dropdownItem = function (className, attrData, name) {
        var dom =  '<a href="#" class="dropdown-link w-dropdown-link ' + className + '" role="menuitem" tabindex="-1" ';
        for (key in attrData)
            dom += (' data-' + key + '="' + attrData[key] + '"');
        dom += '>' + name + '</a>';

        return dom;
    }

    var dropdown = dropdownWrapper(wrapperClassName, key);
    var dropdownSelected = dropdownSelected(selectedClassName, key, selectedText);


    // detecting onChange
    if (extraOptions && extraOptions.onChange){
        let blockText= dropdownSelected[0].querySelector(".block-text");
        const mutationObserver = new MutationObserver(entries=>{
            extraOptions.onChange();
        });
        mutationObserver.observe(dropdownSelected[0],{subtree:true, characterData:true, characterDataOldValue:true, childList: true} );
    }

    var dropdownList = dropdownList();
    options
        .map((x, index) => {
            if ( typeof x == 'string' ) { // string
                return { className: '', attrData: { type: x }, name: x }
            } else if ( x.channels ) { // timeline
                return { className: '', attrData: { type: index }, name: x.name }
            } else if ( x.easing ) {
                return { className: '', attrData: { easing: x.easing, type: x.type }, name: x.name }
            } else if ( !x.type ) { // AnimationAction
                return { className: '', attrData: { type: x.uuid, uuid: x.name }, name: x.name }
            } else if ( x.type == 'Audio' || x.type == 'Video' || x.type == 'Animation' ) { // assets
                return { className: '', attrData: { type: x.id, uuid: x.name }, name: x.name }
            } else { // objects
                return { className: '', attrData: { uuid: x.uuid, type: x.type }, name: x.name }
            }
        })
        .map(x => {
            dropdownList.append( dropdownItem(x.className, x.attrData, x.name));
        });
    dropdown.append(dropdownSelected);
    dropdown.append(dropdownList);

    return dropdown;
}

BlockUIElement.objectsDropdownWithTag = function ( editor, options, className ) {

    // objects in the SCENE
    var objectName = '';
    var objectItems = [
        { type: 'Scene', uuid: editor.scene.uuid, name: 'scene' }
    ];
    UtilsHelper.getObjectsDropdownList(editor.scene, objectItems);

    if (options.objectType == 'Scene') {
        objectName = 'scene';
        options.uuid = editor.scene.uuid;
    } else {
        var object = objectItems.find(x => x.uuid == options.uuid);
        if (object == undefined) {
            objectName = 'Tag';
            options.uuid = 'Tag';
            options.objectType = 'Tag';
        } else {
            objectName = object.name;
        }
    }

    objectItems.push({ type: 'Tag', uuid: 'Tag', name: 'Tags' });
    var objectDropdown = this.dropdown('objects', '', className, objectName, objectItems);

    objectDropdown.attr('data-uuid', options.uuid);
    objectDropdown.attr('data-objectType', options.objectType);

    return objectDropdown;
}

BlockUIElement.objectsDropdown = function ( editor, options, className ) {



    // objects in the SCENE
    var objectName = '';
    var objectItems = [
        { type: 'Scene', uuid: editor.scene.uuid, name: 'scene' }
    ];
    UtilsHelper.getObjectsDropdownList(editor.scene, objectItems);

   if (options.objectType == 'Scene') {
        objectName = 'scene';
        options.uuid = editor.scene.uuid;
    } else {
        var object = objectItems.find(x => x.uuid == options.uuid);
        if (object == undefined) {
            objectName = 'scene';
            options.uuid = editor.scene.uuid;
            options.objectType = 'Scene';
        } else {
            objectName = object.name;
        }
    }

    var objectDropdown = this.dropdown(className || 'objects', '', 'block', objectName, objectItems);

    objectDropdown.attr('data-uuid', options.uuid);
    objectDropdown.attr('data-objectType', options.objectType);

    return objectDropdown;
}

BlockUIElement.objectsDropdownByTypes = function ( editor, uuid, types, className, attrName ) {

    var object = {};
    var meshObjects = [];

    UtilsHelper.getObjectsDropdownList(editor.scene, meshObjects, types);

    if (uuid != undefined && editor.objectByUuid(uuid) != undefined) {
        object.uuid = uuid;
        object.name = editor.objectByUuid(uuid).name;
    }
    else if ( uuid == 'Tag' ) {
        object.name = 'Tags';
        object.uuid = 'Tag';
    }
    else if (meshObjects.length > 0) {
        object.uuid = meshObjects[0].uuid;
        object.name = meshObjects[0].name;
    }

    meshObjects.push({ type: 'Tag', uuid: 'Tag', name: 'Tags'});
    var dropdown = this.dropdown(className || 'objects', '', 'block', object.name, meshObjects);
    dropdown.attr(attrName || 'data-uuid', object.uuid);

    return dropdown;
}

BlockUIElement.playObjectsDropdown = function ( editor, options, className ) {

    // objects in the SCENE
    var objectName = '';
    var objectItems = [ { type: 'Scene', uuid: editor.scene.uuid, name: 'scene' } ];
    UtilsHelper.getObjectsDropdownList(editor.scene, objectItems, [ 'Mesh', 'TextMesh', 'Sprite' ]);

    if (options.objectType == 'Scene') {
        objectName = 'scene';
        options.objectUuid = editor.scene.uuid;
    } else {
        var object = objectItems.find(x => x.uuid == options.objectUuid);
        if (object == undefined) {
            objectName = 'scene';
            options.objectUuid = editor.scene.uuid;
            options.objectType = 'Scene';
        } else {
            objectName = object.name;
        }
    }

    var objectDropdown = this.dropdown('play-video-animation objects', '', className, objectName, objectItems);

    objectDropdown.attr('data-uuid', options.objectUuid);
    objectDropdown.attr('data-type', options.objectType);

    return objectDropdown;
}

BlockUIElement.collisionDropdown = function ( editor, uuid, target ) {
    var object = {};
    var meshObjects = [];
    var wrapperClassName = target == false ? 'objects' : 'targetObjects';

    UtilsHelper.getObjectsDropdownList(editor.scene, meshObjects, ['Mesh', 'TextMesh', 'Sprite']);

    if (target == true && meshObjects.length > 0)
        meshObjects.unshift( { type: 'Mesh', uuid: 'any', name: 'any object' } );

    meshObjects.push( { type: 'Tag', uuid: 'Tag', name: 'Tags' } );
    if (uuid != undefined && editor.objectByUuid(uuid) != undefined) {
        object.uuid = uuid;
        object.name = editor.objectByUuid(uuid).name;
    } else if (uuid == 'Tag') {
        object.uuid = 'Tag';
        object.name = 'Tag';
    } else if (meshObjects.length > 0) {
        object.uuid = meshObjects[0].uuid;
        object.name = meshObjects[0].name;
    }

    var dropdown = this.dropdown(wrapperClassName, '', 'block', object.name, meshObjects);
    dropdown.attr('data-uuid', object.uuid);

    return dropdown;
};

BlockUIElement.cameraDropdown = function ( editor, options, className ) {

    var dropdownData = [];
    for (const key in editor.cameras) {
        var cam = editor.cameras[key];
        if (cam.parent != null)
        dropdownData.push({ type: cam.type, uuid: cam.uuid, name: cam.name });
    }

    var dropdown = this.dropdown(className, 'cameraName', 'block', options.cameraName, dropdownData);
    dropdown.attr('data-objectType', options.cameraType);
    dropdown.attr('data-uuid', options.cameraUuid);

    return dropdown;

};

BlockUIElement.movementDropdown = function ( editor, attribute, options, className ) {

    // objects in the SCENE
    var objectName = '';
    var objectItems = [ { type: 'None', uuid: 'none', name: 'none' } ];

    if (className == 'movements') {
        objectItems.push( { type: 'Location', uuid: 'location', name: 'location' } );
        var selected = editor.objectByUuid( options.uuid );
        // if (selected && attribute == 'look at') {
        if (attribute == 'look at') {
            objectItems.push( { type: 'CursorLocation', uuid: 'cursor location', name: 'cursor location' } );
        }
    }

    UtilsHelper.getObjectsDropdownList(editor.scene, objectItems);
    objectItems.push({ type: 'Tag', uuid: 'Tag', name: 'Tags' });

    var object = objectItems.find(x => x.uuid == options.uuid);
    if (options.objectType == 'None') {
        objectName = 'none';
        options.uuid = 'none';
    } else if (options.objectType == 'Location') {
        objectName = 'location';
        options.uuid = 'location';
    } else {
        var object = objectItems.find(x => x.uuid == options.uuid);
        if (object == undefined) {
            objectName = 'none';
            options.uuid = 'none';
            options.objectType = 'None';
        } else {
            objectName = object.name;
        }
    }

    var objectDropdown = this.dropdown(className, '', 'block', objectName, objectItems);

    objectDropdown.attr('data-uuid', options.uuid);
    objectDropdown.attr('data-objectType', options.objectType);

    return objectDropdown;

}

BlockUIElement.tagDropdown = function ( editor, tag, className ) {

    // tags in the Editor
    var tagItems = [{ type: 'Tag', uuid: 'all', name: 'all tags'}];

    for ( var t in editor.tags ) {

        tagItems.push( { type: 'Tag', uuid: t, name: t } );

    }

    var tagItem = tagItems.find(x => x.uuid == tag);
    var tagName = tagItem == undefined ? 'all tags' : tagItem.name;
    var tagUuid = tagItem == undefined ? 'all' : tagItem.uuid;
    var wrapperClassName = className == undefined ? 'tags' : className;

    var tagDropdown = this.dropdown(wrapperClassName, '', 'block', tagName, tagItems);
    tagDropdown.attr('data-uuid', tagUuid);
    tagDropdown.attr('data-objectType', 'Tag');

    return tagDropdown;

}

BlockUIElement.easingDropdown = function ( key, easingName, easingType,duration, className ) {

    // all easings
    const currentEasing = (isEasingCustom(easingName) || isD3Easing(easingName))?easingName :  defaultEasing;

    function parseDuration(duration){
        return isNaN(parseFloat(duration)) ? 0 : parseFloat(duration)
    }
    
    duration = parseDuration(duration);

    var wrapperClassName = className == undefined ? 'easings' : 'easings ' + className;
    
    const easingsContainer = stringToHtml(
        `<div class="easings-graph-container" style="display:flex, justify-content:center,align-items:center,margin:auto, width:550px, height:500px, display:grid; place-items:center; "></div>`
    );

    /** giving a value here to get help with typescript typings  */
    let currentChart = chartEditor({});
    currentChart.element.remove();
   

    const chartEditorProps = {
        easePreview: true,
        enableD3Easing: true,
        boundFirstLast: false,
        duration: duration,
        defaultCurve: isD3Easing( currentEasing) ?
        currentEasing:createCurve(currentEasing),
        onDurationChange: (duration, e) => {
            e.preventDefault();
            chartEditorProps.duration = duration;
            let curve = currentChart.getCurve();
            chartEditorProps.defaultCurve = isD3Easing(curve)?curve: createCurve(curve);
            easingsContainer.innerHTML = "";
            easingsContainer.appendChild(getEasingsEditor().element);
        },
    };

    
    function getEasingsEditor() {

        currentChart = chartEditor(chartEditorProps);
        // return null;
        const { element  } = currentChart;
        element.style.width = "700px";
        return currentChart;
    }


    const btnContainerBlock=document.createElement("div");
    btnContainerBlock.className = `${wrapperClassName} block`
    

    const btn = document.createElement("btn");
    btn.className=` block-text bar `;
    
    const arrowDownImg= stringToHtml('<img src="https://arcadestudio-assets.s3.us-east-2.amazonaws.com/engine-ui/arrow.svg" width="12" height="12" alt="" class="menu">')
    
    btnContainerBlock.appendChild(btn);
    btnContainerBlock.appendChild(arrowDownImg);


    function isEasingCustom(easing){
        // throws no error on custom easing that is array
        let isCustom;
        try {
            JSON.parse(easing)
            isCustom = true;
        }catch{
            isCustom = false;
            
        }
        return isCustom;
    }

    btn.innerText= isEasingCustom(currentEasing)?"Custom easing":currentEasing ;
    btn.style.backgroundColor="transparent";
    btn.style.color="#7292db";
    if (key){
        btnContainerBlock.dataset.key=key;
    }
    if (currentEasing){
        btnContainerBlock.dataset.easing=currentEasing;
    }

    btnContainerBlock.onclick= () => {
        function onkeydown(e){
            if (e.target instanceof HTMLInputElement) return;

            if (e.key ===logicBlockToggleKey){
                closeDialog();
            }
        }

        const {container, close:closeDialog} = createDialog({onClose:()=>{

            window.removeEventListener("keydown", onkeydown);

            btnContainerBlock.dataset.easing=currentChart.getCurve();

            const durationElem = getLogicBlockUsingChild(btn).querySelector(`*[data-key="duration"] .block-text.bar`)
            durationElem.innerText= currentChart.getDuration();
            currentChart.element.remove();
            easingsContainer.innerHTML="";
            refreshLogicBlock();

        }});

        
        window.addEventListener("keydown", onkeydown)

        container.style.background="white";
        getEasingsEditor();
        easingsContainer.appendChild(currentChart.element)

        container.appendChild(easingsContainer)
    };
    const jqueryBtn= $(btnContainerBlock);


    window.addEventListener(clockDurationChangedEventName, e=>{
        console.log("Received event", clockDurationChangedEventName)
        let {val, elem} = e.detail;
        if (getLogicBlockUsingChild(elem) === getLogicBlockUsingChild(btn)){
            duration=parseDuration(val);
            chartEditorProps.duration = duration;
        }
    })

    return jqueryBtn;

}