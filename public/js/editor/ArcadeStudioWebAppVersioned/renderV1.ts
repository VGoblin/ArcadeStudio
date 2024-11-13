import JSZip from "jszip";
import JSZipUtils from "jszip-utils/dist/jszip-utils.js";


export default function renderV1(zipFileUrl:string, onProgess?: any){
    JSZipUtils.getBinaryContent(zipFileUrl,{progress:onProgess, callback:function (err:any, data:any) {
        if(err) {
           throw err; // or handle the error
        }

        var new_zip = new JSZip();
        
        new_zip.loadAsync(data).then(zip=>{
        
            zip.file("index.html")?.async("string").then(async (file)=>{
    
                //replace style Tags

                const styleTag1= '<link rel="stylesheet" href="css/loading-bar.min.css">';
                const styleContent1 =  await zip.file("css/loading-bar.min.css")?.async("string");
                file = file.replace(styleTag1, `<style>${styleContent1}</style>`);
    
                const styleTag2 = `<link rel="stylesheet" href="css/app.css">`
                const styleContent2 =  await zip.file("css/app.css")?.async("string");
                file = file.replace(styleTag2, `<style>${styleContent2}</style>`);
    
                // replace script Tags
                {
                    const scriptTag1 = `<script src="js/vendor.min.js"></script>`;
                    const scriptContent1 =  await zip.file("js/vendor.min.js")?.async("string")!;
    
                    let blob1 = new Blob([scriptContent1]);
                    let url1 = URL.createObjectURL(blob1);
                    file = file.replace(scriptTag1, `<script src="${url1}"></script>`);
                }
    
                {
                    const scriptTag2 = `<script src="js/webapp.min.js"></script>`;
                    const scriptContent2 =  await zip.file("js/webapp.min.js")?.async("string")!;
    
                    let blob2 = new Blob([scriptContent2]);
                    let url2 = URL.createObjectURL(blob2);
                    file = file.replace(scriptTag2, `<script src='${url2}'></script>`);
                }
                
                // replace app.json
    
                {
                    const appJSON = `"app.json"`;
                    const jsonContent =  await zip.file("app.json")?.async("string")!;
                    let blob2 = new Blob([jsonContent]);
                    let url2 = URL.createObjectURL(blob2);
                    file = file.replace(appJSON, `'${url2}'`);
                }
    
                // replace appAssets

                let assetURLPromises=[] as Promise<any>[];
                let regexPattern = new RegExp(`// appAssets start(.|\n)*// appAssets end`);
                let appAssets= {} as any;
                {
                    
                    let textArr = regexPattern.exec(file)!;;
                    let text = textArr[0];
    
                    if (text){
    
                        let startRegexPattern = new RegExp(`// appAssets start(.|\n)*?{`);
                        text = text.replace(startRegexPattern,'');
                        let endRegexPattern = new RegExp(`;(.|\n)*?// appAssets end$`);
                        text =text.replace(endRegexPattern,'');
    
                        text= "{"+text;
    
                        appAssets = JSON.parse(text) as any;
    
                        for (let assetType in appAssets){
                            let folders = appAssets[assetType] as any[];
                            folders.forEach(folder=>{
                                let items = folder.items as any[];
                                items.forEach(async item=>{
                                    let url = item.url as string;
                                    if (url[0]=="/") url = url.substring(1, url.length);
                                    let promise=zip.file(url)?.async("blob");
    
                                    if (promise){
                                        assetURLPromises.push(new Promise((resolve)=>{
                                            promise?.then(file=>{
                                                let newURL = URL.createObjectURL(file);
                                                item.url = newURL;
                                                resolve(null);
                                            })
                                        }))
                                        
                                        assetURLPromises.push(promise);
                                    }
                                    
                                })
                            })
                        }
    
    
    
                    }
                    
    
                }
    
                Promise.all(assetURLPromises).then(()=>{
                    const iframe = document.createElement("iframe");
                    iframe.style.width="100vw";
                    iframe.style.height="100vh";
                    iframe.style.border="0";
    
                    file= file.replace(regexPattern, `const appAssets = ${JSON.stringify(appAssets)};`)
                    iframe.srcdoc= file;
                    document.body.appendChild(iframe);
   
                })
    
            })
        })
        
    }});
}




