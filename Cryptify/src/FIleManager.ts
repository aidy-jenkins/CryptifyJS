class FileManager {
    public static readonly UPLOAD_TIMEOUT_MS = 300000; //Five minutes

    public static async downloadFile(filename: string, data: Blob | ArrayBuffer | Uint8Array): Promise<void> {
        if(!(data instanceof Blob)) {
            data = new Blob([data]);
            await wait(); 
            //Trying to only keep one copy in memory as much as possible in case the file is quite large and resources are low
            //Forcing an async call here is not guaranteed to prevent "Out of Memory" but should reduce likelihood
        }

        if(window.navigator["msSaveOrOpenBlob"]) { //IE & Edge
            await wait(); //Force save to be async for consistency with HTML5 path
            window.navigator.msSaveOrOpenBlob(data, filename);
            return;
        }
        else {
            let url = URL.createObjectURL(data);
            
            let anchor = document.createElement('a');
            if(anchor.download !== void 0) {  //HTML5 route
                anchor.href = url;
                anchor.download = filename;
                anchor.textContent = ".";
                document.body.appendChild(anchor);
                await wait(); //Give non-whitespace content and load anchor into DOM so it can be 'clicked'
                anchor.click();
                await wait(); //Allow DOM click event to be handled before removing
                document.body.removeChild(anchor);
            }
            else {
                window.open(url); //fallback - filename cannot be provided
            }
        }
    }

    public static async uploadFile({ accept = "", onFileSelect = null as (e: Event) => void } = {}): Promise<{ filename: string; data: ArrayBuffer }> {
        let fUpload = document.createElement("input");
        try {
            fUpload.type = "file";
            fUpload.accept = accept;
            document.body.appendChild(fUpload);
            fUpload.click(); //trigger upload dialog
            let e = await Promise.race([
                new Promise<Event>(r => fUpload.onchange = r),
                wait(() => { throw new Error("Timed out waiting for input") }, this.UPLOAD_TIMEOUT_MS)
            ]);
            if (fUpload.files.length < 1)
                throw new Error("No files selected");

            if(onFileSelect)
                onFileSelect(e);

            let filename = fUpload.files[0].name;
            let file = fUpload.files[0];

            document.body.removeChild(fUpload);
            fUpload = null; //dereference to allow it to be disposed 

            let fr = new FileReader();
            fr.readAsArrayBuffer(file);

            file = null; //blob will be cleared once no longer needed by FileReader

            await new Promise(r => fr.onload = r);
            let result = fr.result as ArrayBuffer;

            return { filename: filename, data: result };

        }
        catch (err) {
            console.error(err);
            throw err;
        }
        finally {
            if (fUpload != null)
                document.body.removeChild(fUpload); //Make sure it gets ditched
        }
    }
}