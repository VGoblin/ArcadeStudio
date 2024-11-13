export async function getResourceSize(url:string, skipHeaderMethod=true) {

        if (!skipHeaderMethod){
        // Fetch resource headers
            let response = await fetch(url, { method: 'HEAD' });
        
            if(response.ok) {
                let size = response.headers.get('Content-Length');
                
                // If Content-Length header is present and valid, return it
                if(size !== null) {
                    return parseInt(size);
                }
            }
        }

        // If HEAD request failed or Content-Length header is missing, fetch the entire resource
        let response = await fetch(url);

        if(!response.ok) {
            throw new Error('Resource not found');
        }

        // Read the response body as Blob
        const blob = await response.blob();
        
        // Return the size of the Blob data
        return blob.size;

    
}
