
import { UIDiv, UIPanel, UIButton, UIRow, UIImageButton, UIText, UIRowShelf, UINumber } from '../components/ui.js';
import { Spectrogram } from '../../../lib/spectrogram/spectrogram.js';
import { LibraryAudioFolderItem } from '../library/Library.Audio.Folder.Item.js';
import { Toast } from 'bootstrap';

const sfxr = require("../../../lib/jsfxr").sfxr;
const PARAMS = require("../../../lib/jsfxr").PARAMS;

var JsfxrControlBar = function ( editor ) {

    var assets = editor.assets;
    var config = editor.config;
    var container = new UIPanel().setWidth("250px").setMarginLeft('auto').setFontSize('12px').setClass('jsfxr-control-panel');
    var params = {};
    var soundParams = {wave_type: 0};
    var signals = editor.signals;
    soundParams = sfxr.generate('random');
    soundParams.wave_type = 1;
    soundParams.sample_rate = 44100;
    var api = editor.api;

    var btnTexts = [{ type: "text", list: [['Coin', 'pickupCoin'], ['Hit', 'hitHurt']]},
                    { type: "text", list: [['Explosion', 'explosion'], ['Jump', 'jump']]},
                    { type: "text", list: [['Powerup', 'powerUp'], ['Laser', 'laserShoot']]},
                    { type: "text", list: [['Click', 'click'], ['Blip', 'blipSelect']]},
                    { type: "text", list: [['Synth', 'synth'], ['Tone', 'tone']]},
                    { type: "text", list: [['Random', 'random']]},
                    { type: "text", list: [['44k', 'sample_rate'], ['22k', 'sample_rate'], ['11k', 'sample_rate'], ['6k', 'sample_rate']]},
                    { type: "image",list: [[config.getImage('engine-ui/Jsfxr-audio-tool/audio+wave+square.svg'), 'wave_type'], [config.getImage('engine-ui/Jsfxr-audio-tool/audio+wave+synth.svg'), 'wave_type'], [config.getImage('engine-ui/Jsfxr-audio-tool/audio+wave+sin.svg'), 'wave_type'], [config.getImage('engine-ui/Jsfxr-audio-tool/audio+wave+noise.svg'), 'wave_type']]}
    ];
    const hrzButtons  = [];
    const waveButtons = [];

    //Mult-Threading
    //As a worker normally take another JavaScript file to execute we convert the function in an URL: http://stackoverflow.com/a/16799132/2576706
    function getScriptPath(foo){ return window.URL.createObjectURL(new Blob([foo.toString().match(/^\s*function\s*\(\s*\)\s*\{(([\s\S](?!\}$))*[\s\S])/)[1]],{type:'text/javascript'})); }

    /*
     *	Here are the workers
     */
//Worker 1
    var worker1 = new Worker(getScriptPath(function(){
        self.addEventListener('message', function(e) {
            var value = 0;
            console.log(value);
            // while(value <= e.data){
                self.postMessage(e.data);
                // value++;
            // }
        }, false);
    }));

//We add a listener to the worker to get the response and show it in the page
    worker1.addEventListener('message', function(e) {
        console.log(e);
        var bf = sfxr.toWebAudio(e.data, new AudioContext()).buffer;
        Spectrogram(bf);
    }, false);



    editor.signals.playJsfxrAudio.add(() => {
        Spectrogram(sfxr.toWebAudio(soundParams, new AudioContext()).buffer);
    });

    editor.signals.mutateJsfxrAudio.add(() => {
        // const sound = sfxr.generate('random');
        // let sfxr_params = PARAMS.fromJson(soundParams);
        // sfxr_params.mutate();
        // soundParams = sfr_params;
        const sound = soundParams.mutate();
        for(var param in sound){
            if(params[param] !== undefined){
                params[param].setValue(sound[param]);
            }
        }
        soundParams = sound;
        worker1.postMessage(soundParams);

    });

    editor.signals.saveJsfxrAudio.add(() => {
        const dataURItoBlob = function (dataURI) {
            console.log(dataURI);
            // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {type:mimeString});
        }

        //Save Audio
        console.log('saving');

        const symbolless = new Date().toISOString().replace(/[\-\.\:ZT]/g,"").substr(2,10);
        const result = {filename: 'jsfxr_' +  symbolless + ".wav", buffer: sfxr.toWebAudio(soundParams, new AudioContext()).buffer};

        var asset = editor.assets.uploadAudio( result.filename, result.buffer );
        assets[ result.filename ] = asset;

        // var item = new LibraryAudioFolderItem( editor, 0, asset );
        // items[ result.filename ] = item;
        // item.setLoading( true );

        signals.audioAssetAdded.dispatch(asset, 0);

        var formData = new FormData();
        formData.append( 'type', 'Audio' );
        formData.append( 'projectId', editor.projectId );

        var dataURI = sfxr.toWave(soundParams).dataURI;
        console.log(dataURI);
        var blob = new dataURItoBlob(dataURI);
        formData.append( 'file', blob, result.filename);

        $(".toast").stop().fadeIn(1000).delay(2500).fadeOut(1000);

        api.post( '/asset/my-audio/upload', formData ).then( res => {

            for ( var file of res.files ) {

                assets[ file.name ].id = file.id;
                assets[ file.name ].audioId = file.audioId;

            }

        } );
    });

    for (var btnRow of btnTexts) {
        var row = new UIRow().setPadding('0');
        var width = 100 / btnRow["list"].length;
        //Styling
        if(btnRow["list"].length == 4 || btnRow["list"].length == 2 ){
            row.addClass("GappedRow")
        }
        for(var text of btnRow['list']) {
            if(btnRow['type'] == 'text')
                var btn = new UIButton(text[0]).setClass('jsfxr-control-button').setWidth(width + "%").setId(text[1]);
            if(btnRow['type'] == 'image')
                var btn = new UIImageButton(text[0]).setClass('jsfxr-control-button').setWidth(width + "%").setId(text[1]);
            if(text[1] == 'sample_rate'){
                hrzButtons.push(btn);
                if(text[0] == '44k'){
                    btn.setClass('jsfxr-control-button-clicked');
                }
                btn.onClick((e) => {
                    var rate = 0;
                    console.log(e);
                    hrzButtons.map((btn) => {btn.setClass('jsfxr-control-button')});
                    switch (e.target.innerText) {
                        case '44k':
                            rate = 44100;
                            e.target.className = 'jsfxr-control-button-clicked';
                            break;
                        case '22k':
                            rate = 22050;
                            e.target.className = 'jsfxr-control-button-clicked';
                            break;
                        case '11k':
                            rate = 11025;
                            e.target.className = 'jsfxr-control-button-clicked';
                            break;
                        case '6k':
                            rate = 5512;
                            e.target.className = 'jsfxr-control-button-clicked';
                            break;
                    }
                    soundParams['sample_rate'] = rate;
                    console.log(soundParams);
                    Spectrogram(sfxr.toWebAudio(soundParams, new AudioContext()).buffer);
                });
                row.add(btn);
            }
            else if(text[1] == 'wave_type'){
                waveButtons.push(btn);
                if(text[0] == config.getImage('engine-ui/Jsfxr-audio-tool/audio+wave+synth.svg')){
                    btn.setClass('jsfxr-control-button-clicked');
                }
                btn.onClick((e) => {
                    var wType = 0;
                    console.log(e);
                    waveButtons.map((btn) => {btn.setClass('jsfxr-control-button')});
                    switch (e.target.children[0].currentSrc) {
                        case config.getImage('engine-ui/Jsfxr-audio-tool/audio+wave+square.svg'):
                            wType = 0;
                            e.target.className = 'jsfxr-control-button-clicked';
                            break;
                        case config.getImage('engine-ui/Jsfxr-audio-tool/audio+wave+synth.svg'):
                            wType = 1;
                            e.target.className = 'jsfxr-control-button-clicked';
                            break;
                        case config.getImage('engine-ui/Jsfxr-audio-tool/audio+wave+sin.svg'):
                            wType = 2;
                            e.target.className = 'jsfxr-control-button-clicked';
                            break;
                        case config.getImage('engine-ui/Jsfxr-audio-tool/audio+wave+noise.svg'):
                            wType = 3;
                            e.target.className = 'jsfxr-control-button-clicked';
                            break;
                    }
                    soundParams['wave_type'] = wType;
                    Spectrogram(sfxr.toWebAudio(soundParams, new AudioContext()).buffer);
                });
                row.add(btn);
            }else {
                btn.onClick((e) => {
                    const preset = e.target.id;
                    console.log(preset);
                    const sound = sfxr.generate(preset);
                    console.log(sound);
                    for (var param in sound) {
                        if (params[param] !== undefined) {
                            params[param].setValue(sound[param]);
                        }
                    }
                    soundParams = sound;
                    Spectrogram(sfxr.toWebAudio(soundParams, new AudioContext()).buffer);
                });
                row.add(btn);
            }
        }
        container.add(row);
    }

    var jsfxrStatus = {
        "Envelope" :        [{label: "Attack time", number: 0, unit: "sec", param: "p_env_attack"},
                            {label: "Sustain time", number: 0, unit: "sec", param: "p_env_sustain"},
                            {label: "Sustain punch", number: 0, unit: "%", param: "p_env_punch"},
                            {label: "Decay time", number: 0, unit: "sec", param: "p_env_decay"},],
        "Frequency" :       [{label: "Start frequency", number: 0, unit: "Hz", param: "p_base_freq"},
                            {label: "Min freq. cutoff", number: 0, unit: "Hz", param: "p_freq_limit"},
                            {label: "Slide", number: 0, unit: "8va/sec", param: "p_freq_ramp"},
                            {label: "Delta slide", number: 0, unit: "8va/sec^2", param: "p_freq_dramp"},],
        "Vibrato" :         [{label: "Depth", number: 0, unit: "%", param: "p_vib_strength"},
                            {label: "Speed", number: 0, unit: "%", param: "p_vib_speed"},],
        "Arpeggiation" :    [{label: "Frequency multiplier", number: 0, unit: "x", param: "p_arp_mod"},
                            {label: "Change speed", number: 0, unit: "sec", param: "p_arp_speed"},],
        "Duty Cycle" :      [{label: "Duty cycle", number: 0, unit: "%", param: "p_duty"},
                            {label: "Sweep", number: 0, unit: "%/sec", param: "p_duty_ramp"},],
        "Retrigger" :       [{label: "Rate", number: 0, unit: "Hz", param: "p_repeat_speed"},],
        "Flanger" :         [{label: "Offset", number: 0, unit: "msec", param: "p_pha_offset"},
                            {label: "Sweep", number: 0, unit: "msec/sec", param: "p_pha_ramp"},],
        "Low-Pass Filter" : [{label: "Cutoff frequency", number: 0, unit: "Hz", param: "p_lpf_freq"},
                            {label: "Cutoff sweep", number: 0, unit: "^sec", param: "p_lpf_ramp"},
                            {label: "Resonance", number: 0, unit: "%", param: "p_lpf_resonance"},],
        "High-Pass Filter" :[{label: "Cutoff frequency", number: 0, unit: "Hz", param: "p_hpf_freq"},
                            {label: "Cutoff sweep", number: 0, unit: "^sec", param: "p_hpf_ramp"},],
    }

    var subPropertyDiv = new UIDiv();
    subPropertyDiv.addClass("jsfxr-sub-property");

    for(var title in jsfxrStatus){
        var row = new UIRow().setPadding('0');
        row.add(new UIText(title).setMarginLeft("15px"));
        row.addClass("jsfxr-head-row");
        subPropertyDiv.add(row);
        for(var item of jsfxrStatus[title]){
            var subRow = new UIRow().setPadding('0').addClass("jsfxr-sub-row");
            subRow.add(new UIText(item['label']).setMarginLeft("15px").setMarginRight("auto"));
            var numInput = new UINumber(item['number']).setWidth("100px").setTextAlign("right").setId(item['param'])
                .onChange((e) => {
                    var paramid = e.target.id;
                    soundParams[paramid] = e.target.value;
                    console.log(soundParams);
                });
            subRow.add(numInput);
            params[item['param']] = numInput;
            subRow.add(new UIText(item['unit']).setMarginRight("10px"));
            subPropertyDiv.add(subRow);
        }
    }
    container.add(subPropertyDiv);
    return container;
};

export { JsfxrControlBar };
