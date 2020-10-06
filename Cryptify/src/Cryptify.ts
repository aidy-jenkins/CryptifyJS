/** Main controller class to manage the page */
class Cryptify {
    protected static readonly DEFAULT_DOWNLOAD_FILENAME = "decryptedfile";

    public static async generateSelfDecrypt(saveKeyfile = false) {
        try {
            let { filename, content } = await (async () => {

                let {html, head, body} = this.createPageWrapper();

                let dvSelfDecrypt = document.getElementById("dvSelfDecrypt") as HTMLDivElement;
                dvSelfDecrypt = dvSelfDecrypt.cloneNode(true) as HTMLDivElement;

                dvSelfDecrypt.style.display = "";
                let spData = dvSelfDecrypt.querySelector("#spData") as HTMLSpanElement;
                let compress = (document.getElementById("chkCompress") as HTMLInputElement).checked;
                
                let { data, filename } = await FileManager.uploadFile({ onFileSelect: () => this.updateStatus("Uploading file") });
                
                if(compress) {
                    await this.updateStatus("Compressing - optimising for best file size");
                    data = await Compression.compress(data, "arraybuffer", { base64: true });
                }

                await this.updateStatus("Encrypting");
                let { data: encryptedData, key } = await Encryption.encrypt(data);
                
                await this.updateStatus("Preparing bundle");
                (document.getElementById("txtKey") as HTMLSpanElement).textContent = key;
                
                spData.dataset["filename"] = filename;
                spData.dataset["compressed"] = compress.toString();
                spData.textContent = btoa(stringFromArrayBuffer(encryptedData));
                encryptedData = null;

                body.appendChild(dvSelfDecrypt);
                
                let packages = [ ...await this.packageScripts(), ...await this.packageStyles()];
                for(let item of packages)
                    head.appendChild(item);

                let scrip = document.createElement("script");
                scrip.type = "text/javascript";
                scrip.textContent = `document.getElementById('btnDecrypt').onclick = e => Cryptify.selfDecrypt();`;
                body.appendChild(scrip);
                return { filename, content: html.outerHTML };
            })();

            await this.updateStatus("Preparing file for download");

            let data = uint8ArrayFromString(content);
            content = null;

            let dvKey = document.getElementById("dvKey");
            dvKey.style.display = "";

            try {
                await FileManager.downloadFile(filename + ".encrypted.html", data);
            }
            catch (err) {
                this.updateStatus("Failed to download content");
                console.error(err);
            }

            this.updateStatus("");
        }
        catch(err) {
            this.updateStatus("Failed");
        }
    
    }

    public static async selfDecrypt() {
        let spData = document.getElementById("spData") as HTMLSpanElement;

        let filename = spData.dataset["filename"];
        let compressed = JSON.parse(spData.dataset["compressed"]) as boolean;
        let data = spData.textContent;
        spData.parentElement.removeChild(spData);
        spData = null;

        await this.updateStatus("Unpacking bundle");

        let bytes = uint8ArrayFromString(atob(data));
        data = null;

        await wait();
        
        Cryptify.decryptFile(bytes, compressed, filename);
    }

    public static async decryptFile(content: Uint8Array | ArrayBuffer, compressed: boolean, filename = null as string) {
        let key = (document.getElementById("txtKey") as HTMLInputElement).value;

        await this.updateStatus("Decrypting data");
        let decryption = Encryption.decrypt(key, content);
        content = null;

        let { data } = await decryption;

        if(compressed) {
            await this.updateStatus("Decompressing file");
            data = await Compression.decompress(data, "arraybuffer", { base64: true });
        }

        if (!filename) {
            filename = this.DEFAULT_DOWNLOAD_FILENAME;
        }
        else if (filename.includes("ENCRYPTED"))
            filename = filename.substr(0, filename.indexOf("ENCRYPTED"));

        await this.updateStatus("Downloading file");

        await FileManager.downloadFile(filename, data);

        this.updateStatus("");

        window.location.reload();
    }

    public static async copyKeyToClipboard() {
        try {
            let key = (document.getElementById("txtKey") as HTMLSpanElement).textContent;

            await navigator.clipboard.writeText(key);

            let status = document.getElementById("copyStatus") as HTMLSpanElement;
            status.textContent = "Copied!";

            await wait(2000);

            status.textContent = "";
        }
        catch(err) {
            console.error(err);
        }
    }

    protected static createPageWrapper() {
        let html = document.createElement("html");
        let head = document.createElement("head");
        let body = document.createElement("body");
        html.appendChild(head);
        html.appendChild(body);

        return { html, head, body };
    }

    protected static async packageScripts() {
        return await Promise.all(Array.from(document.getElementsByTagName("script")).map(async scr => {
            let script = document.createElement("script");
            script.type = "text/javascript";
            script.textContent = await fetch(scr.src).then(x => x.text());
            return script;
        }));
    }

    protected static async packageStyles() {
        return await Promise.all(Array.from(document.getElementsByTagName("link")).filter(x => x.rel === "stylesheet").map(async stylesheet => {
            let style = document.createElement("style");
            style.type = "text/css";
            style.textContent = await fetch(stylesheet.href).then(x => x.text());
            return style;
        }));
    }

    protected static async updateStatus(message: string) {
        document.getElementById("lblStatus").textContent = message;
        await wait(200);
    }
}