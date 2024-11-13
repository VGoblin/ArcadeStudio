import { UIDiv } from '../ui/components/ui.js';
import "../../editor/libs/loading-bar/loading-bar.min.js";
export default function createSplash(progress:number){
    var container = new UIDiv() as any;
	container.setId( 'splash' );
    container.dom.style.zIndex="999999999";
    container.dom.style.backgroundColor="black";
    
    var loadingBar = new UIDiv() as any;
    loadingBar.setClass( 'ldBar' );
    loadingBar.addClass( 'label-center' );
    loadingBar.setWidth( '20%' );
    loadingBar.setHeight( '100%' );
    loadingBar.setMargin( '0 auto' );

    var bar = new (window as any).ldBar( loadingBar.dom, {
        'preset': 'circle',
        'stroke': '#7292db',
        'stroke-width': 1,
        'stroke-trail': '#7292db',
        'stroke-trail-width': 0.5,
        'value': progress,
    });
    
    container.add( loadingBar );

    return {
        element:container,
        updateSplash:(progress:number)=>bar.set(progress),
        removeSpash:()=>container.delete()
    }
    
}