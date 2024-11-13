/**
 * @author mrdoob / http://mrdoob.com/
 */

import isDefined from '../utils/index';
import { UIDiv } from './components/ui.js';

var AppSplash = function ( editor, app ) {

    var assets = editor.assets;
    var storage = editor.storage;
	var signals = editor.signals;

	var container = new UIDiv();
	container.setId( 'splash' );

    if ( app ) {

        var loadingBar = new UIDiv();
        loadingBar.setClass( 'ldBar' );
        loadingBar.addClass( 'label-center' );
        loadingBar.setWidth( '20%' );
        loadingBar.setHeight( '100%' );
        loadingBar.setMargin( '0 auto' );
    
        var progress = 0;
        
        var bar = new ldBar( loadingBar.dom, {
            'preset': 'circle',
            'stroke': '#7292db',
            'stroke-width': 1,
            'stroke-trail': '#7292db',
            'stroke-trail-width': 0.5,
            'value': progress,
        });
        
        container.add( loadingBar );
    
        storage.load( app, onStateProgress ).then( () => {

            var tasks = [];
            var types = [ 'Image', 'Environment', 'Audio', 'Video', 'Font', 'Animation' ];

              
            const assetsAreAvailable = Boolean(window.appAssets);    

            if (storage.state && storage.state.assets && !assetsAreAvailable){

                for ( var type of types ) {
    
                    var lower = type.toLowerCase();
                    var ids = storage.state.assets[ lower + 's' ];
                    var url = '/app_asset/' + lower;
    
                    if (ids && ids.filter){
                        ids = ids.filter(id=>{
                            return isDefined(id) && id !== "undefined";
                        })
                    }
    
                    if ( ids && ids.length > 0 ) {
                        for ( let i = 0; i < ids.length; i++ ) {
    
                            url = url + ( i == 0 ? '?' : '&' ) + 'id=' + ids[ i ];
        
                        }
    
                       
                        if ( type == 'Font' ) {

                            tasks.push( assets.loadFont( type, url, onAssetProgress ) );
    
                        } else {
                            tasks.push( assets.load( type, url, onAssetProgress ) );
    
                        }
                        
    
    
                        
        
                    }
        
                }
            } else if (assetsAreAvailable) {
                for ( var type of types ) {
                    var lowercaseType = type.toLowerCase();

                    if (type !== "Font"){
                        tasks.push( assets.addAssets( type, window.appAssets[lowercaseType+'s'], onAssetProgress ) );
                    }else {
                        let fonts = window.appAssets[lowercaseType+'s'];

                        fonts.forEach(font=>{
                            tasks.push(assets.addFont(font));
                        })
                    }
                    
                }
            }
    
           

    
            Promise.all( tasks ).then( results => {
    
                bar.set( 100 );
        
                setTimeout( function () {
        
                    signals.loadingFinished.dispatch();
        
                }, 1000 );
        
            } );
        
            function onAssetProgress( value ) {
        
                progress += 80 / tasks.length * value;
                
                bar.set( progress );
                
            }

        } );
    
        function onStateProgress( value ) {
    
            progress += 20 * value;
            
            bar.set( progress );
            
        }
    
    }

	return container;

};

export { AppSplash };
