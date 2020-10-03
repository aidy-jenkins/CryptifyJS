class Cryptify {
    constructor() { }

    public static async selfDecrypt() {
        let spData = document.getElementById("spData") as HTMLSpanElement;

        let filename = spData.dataset["filename"];
        let data = spData.textContent;
        spData.parentElement.removeChild(spData);
        spData = null;

        await wait();

        let bytes = uint8ArrayFromString(atob(data));
        data = null;

        await wait();
        
        Cryptify.decryptFile(filename, bytes);
    }

    public static async decryptFile(filename = null as string, content = null as Uint8Array | ArrayBuffer) {
        let decryption = Encryption.decryptFile(filename, content);
        content = null;

        let { filename: fName, data } = await decryption;
        await FileManager.downloadFile(fName, data);
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

    
    public static async generateSelfDecrypt(saveKeyfile = false) {
        let { filename, content } = await (async () => {

            let {html, head, body} = this.createPageWrapper();

            let dvSelfDecrypt = document.getElementById("dvSelfDecrypt") as HTMLDivElement;
            dvSelfDecrypt = dvSelfDecrypt.cloneNode(true) as HTMLDivElement;

            dvSelfDecrypt.style.display = "";
            let spData = dvSelfDecrypt.querySelector("#spData") as HTMLSpanElement;

            let { data, filename, key } = await Encryption.encryptFile();
            
            (document.getElementById("txtKey") as HTMLSpanElement).textContent = key;
            
            spData.dataset["filename"] = filename;
            spData.textContent = btoa(stringFromArrayBuffer(data));
            data = null;

            body.appendChild(dvSelfDecrypt);

            let scriptPackage = await this.packageScripts();
            for(let script of scriptPackage)
                head.appendChild(script);

            let scrip = document.createElement("script");
            scrip.type = "text/javascript";
            scrip.textContent = `document.getElementById('btnDecrypt').onclick = e => Cryptify.selfDecrypt();`;
            body.appendChild(scrip);
            return { filename, content: html.outerHTML };
        })();

        let data = uint8ArrayFromString(content);
        content = null;

        try {
            await FileManager.downloadFile(filename + ".encrypted.html", data);
        }
        catch (err) {
            console.log("Failed to download content");
            console.error(err);
        }
        
    }
}