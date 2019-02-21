class FileManager {
    public static readonly UPLOAD_TIMEOUT_MS = 300000; //Five minutes

    public static async downloadFile(filename: string, data: ArrayBuffer | Uint8Array): Promise<void> {
        let blob = new Blob([data instanceof Uint8Array ? data : new Uint8Array(data)]);
        data = null;

        if(window["msSaveOrOpenBlob"]) { //Edge
            window.navigator.msSaveOrOpenBlob(blob, filename);
            return await wait<void>();
        }
        else  { //HTML5
            let url = URL.createObjectURL(blob);
            //sData = "data:;base64," + btoa(sData); //convert to base 64 data URL

            let anchor = document.createElement('a');
            if(anchor.download !== void 0) {  //HTML5 route
                anchor.href = url;
                anchor.download = filename;
                anchor.textContent = "."; //Give non-whitespace content so it is 'clickable'
                document.body.appendChild(anchor);
                await wait();
                anchor.click();
                await wait();
                document.body.removeChild(anchor);
            }
            else {
                window.open(url); //fallback - filename cannot be provided
            }
        }
    }

    public static async uploadFile(accept = ""): Promise<{ filename: string; data: ArrayBuffer }> {
        let fUpload = document.createElement("input");
        try {
            fUpload.type = "file";
            fUpload.accept = accept;
            document.body.appendChild(fUpload);
            await wait();
            fUpload.click(); //trigger upload dialog
            let e = await Promise.race([
                new Promise<Event>(r => fUpload.onchange = r),
                wait(() => { throw new Error("Timed out waiting for input") }, this.UPLOAD_TIMEOUT_MS)
            ]);
            if (fUpload.files.length < 1)
                throw new Error("No files selected");

            let fr = new FileReader();
            fr.readAsArrayBuffer(fUpload.files[0]);
            await new Promise(r => fr.onload = r);
            let result = fr.result as ArrayBuffer;

            return { filename: fUpload.files[0].name, data: result };

        }
        finally {
            document.body.removeChild(fUpload);
        }
    }
}