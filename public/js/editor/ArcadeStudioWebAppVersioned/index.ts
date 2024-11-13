import renderV1 from "./renderV1";
import createSplash from "./splash";

let {publishingVersion, zipFileUrl} =  window as any;

if (publishingVersion === "0" || publishingVersion !== "1"){
    function addTheUsualScriptTags(){
        [
            "/js/lib/jquery.min.js",
            "/js/lib/lottie_canvas.js",
            "/js/lib/lottie-player.js",
            "/js/app/js/vendor.min.js",
            "/js/webapp.min.js",
        ].forEach(tag=>{
            const script = document.createElement("script");
            script.src=tag;
            document.body.appendChild(script);
        })
    }
    addTheUsualScriptTags();
} else if (publishingVersion === "1"){
    const splash = createSplash(0)
    document.body.appendChild(splash.element.dom);
    renderV1(zipFileUrl, ({percent}:any)=>{
        splash.updateSplash(parseInt(percent));
        if (parseInt(percent)===100){
            setTimeout(()=>{
                splash.removeSpash()
            }, 2500)
        }
    });

}



