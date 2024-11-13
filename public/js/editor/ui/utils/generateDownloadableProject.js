import JSZip from "jszip";

export default function generateDownloadableProject(){
    
    return new Promise((resolve, reject)=>{
        var zip = new JSZip();

        const config = editor.config;

        var output = editor.toJSON();
        delete output.history;
        output = JSON.stringify(output);
        zip.file("app.json", output);

        var title = config.getKey('project/name');


        var manager = new THREE.LoadingManager(function () {

            zip.generateAsync({type:"blob"})
                .then(function (blob) {
                // saveAs(blob, title);
                resolve([blob, title]);
            });

        });

        var loader = new THREE.FileLoader(manager);
        
        loader.load(`/js/download/index.html?cachebuster=${Date.now()}`, function (content) {

            const appAssets = window.editor.filterAppAssetsfromAssets()

            for (let assetType in appAssets){
                if (assetType !== "fonts"){
                    const folders = appAssets[assetType]
                    folders.forEach(folder=>{
                        const {items} = folder;
                        items.forEach(asset=>{
                            asset.url = `app_assets/${assetType}/${asset.id}`;
                        })
                    })
                }else if (assetType === "fonts"){
                    const items = appAssets[assetType];
                    items.forEach(asset=>{
                        asset.url = `app_assets/${assetType}/${asset.id}`;
                    })
                }
            }


            content = content.replace('<!-- title -->', title);
            zip.file('index.html', content);
            content = content.replace('const appAssets = [];', `const appAssets = ${JSON.stringify(appAssets)}; `);
            zip.file('index.html', content);
            // toZip['index.html'] = strToU8(content);

        });


        loader.load('/js/download/app.js', function (content) {
            zip.file('js/app.js', content);
        });

        loader.load(`/js/editor/libs/three.module.js?cachebuster=${Date.now()}`, function (content) {
            zip.file('js/three.module.js', content);
        });

        loader.load(`/js/app/js/vendor.min.js?cachebuster=${Date.now()}`, function (content) {
            zip.file('js/vendor.min.js', content);
        });

        loader.load(`/js/webapp.min.js?cachebuster=${Date.now()}`, function (content) {
            zip.file('js/webapp.min.js', content); 
        });

        loader.load('/js/download/VRButton.js', function (content) {
            zip.file('js/VRButton.js', content);
        });

        loader.load('/js/editor/libs/loading-bar/loading-bar.min.css', function (content) {
            zip.file('css/loading-bar.min.css', content);
        });

        loader.load('/css/app.css', function (content) {
            zip.file('css/app.css', content);
        });

        // download logicblock and similar assets

        const appAssets = window.editor.filterAppAssetsfromAssets();
        
        {
            var loader = new THREE.FileLoader(manager);
            loader.setResponseType('blob');

            for (let assetType in appAssets){
                if (assetType !== "fonts"){
                    let folders = appAssets[assetType];
                    folders.forEach(folder=>{
                        let items = folder.items;
                        items.forEach(item=>{
                            if (item.url){
                                loader.load(item.url, function (content) {
                                    zip.file(`app_assets/${assetType}/${item.id}`, content, {binary:true});
                                });
                            }
                        })
                    })
                }else if (assetType === "fonts"){
                    let items = appAssets[assetType];
                    items.forEach(item=>{
                        if (item.url){
                            loader.load(item.url, function (content) {
                                zip.file(`app_assets/${assetType}/${item.id}`, content, {binary:true});
                            });
                        }
                    })
                }
            }
        }
    })
    

}
