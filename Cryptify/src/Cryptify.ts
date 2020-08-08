class Cryptify {
    constructor() {

    }

    private static get ALGORITHM_PARAMS() { return { name: "AES-CTR", counter: crypto.getRandomValues(new Uint8Array(16)), length: 128 } as AesCtrParams; }

    public static async encryptFile(saveKeyfile = false) {
        let { data, filename, key } = await this.encryptFile_internal('.ENCRYPTED');

        await FileManager.downloadFile(filename + '.ENCRYPTED', data);
        if (saveKeyfile)
            await FileManager.downloadFile(filename + '.KEY', uint8ArrayFromString(key));
        else
            (document.getElementById("txtKey") as HTMLInputElement).value = key;
    }

    protected static async encryptFile_internal(filenameAppendix = null) {
        try {
            let algorithm = this.ALGORITHM_PARAMS;
            let { data, filename } = await FileManager.uploadFile();
            let key = (await crypto.subtle.generateKey({ name: algorithm.name, length: algorithm.length }, true, ["encrypt", "decrypt"])) as CryptoKey;

            let encrypted_data = await crypto.subtle.encrypt(algorithm, key, data);

            let sKey = btoa(stringFromArrayBuffer(await crypto.subtle.exportKey("raw", key)));
            sKey += ';' + btoa(stringFromUint8Array(algorithm.counter as Uint8Array));

            if (filenameAppendix)
                filename += filenameAppendix;

            return { data: encrypted_data, filename, key: sKey };
        }
        catch (err) {
            console.error(err);
        }
    }

    public static async decryptFile(filename = null as string, content = null as Uint8Array | ArrayBuffer) {
        let decryption = this.decryptFile_internal(filename, content);
        content = null;

        let { filename: fName, data } = await decryption;
        await FileManager.downloadFile(fName, data);
    }

    protected static async decryptFile_internal(filename = null as string, content = null as Uint8Array | ArrayBuffer) {
        try {
            let algorithm = this.ALGORITHM_PARAMS;
            
            let rawKey: Uint8Array;
            let counter: Uint8Array;
            let sRawKey = (document.getElementById("txtKey") as HTMLInputElement).value;
            if (sRawKey)
                rawKey = uint8ArrayFromString(sRawKey.trim());
            else {
                let { data } = await FileManager.uploadFile(".KEY");
                rawKey = new Uint8Array(data);
            }

            let [sKey, sCounter] = stringFromUint8Array(rawKey).split(';');

            sKey = atob(sKey);
            sCounter = atob(sCounter);
            rawKey = uint8ArrayFromString(sKey);
            counter = uint8ArrayFromString(sCounter);

            algorithm.counter = counter;

            if (!content) {
                if (filename)
                    content = await (await fetch(filename)).arrayBuffer();
                else {
                    ({ data: content, filename } = await FileManager.uploadFile(".ENCRYPTED"));
                }
            }
            else if (!filename) {
                filename = "decryptedfile.ENCRYPTED";
            }

            let key = await crypto.subtle.importKey("raw", rawKey, algorithm, true, ["encrypt", "decrypt"]);

            let decrypted_data = await crypto.subtle.decrypt(algorithm, key, content);

            content = null;
            await wait();

            if (filename.includes("ENCRYPTED"))
                filename = filename.substr(0, filename.indexOf("ENCRYPTED"));

            return { filename: filename, data: decrypted_data };
        }
        catch (err) {
            console.log(err);
        }
    }

    public static async generateSelfDecrypt(saveKeyfile = false) {
        let { filename, content } = await (async () => {
            const html = document.createElement("html");
            const head = document.createElement("head");
            const body = document.createElement("body");
            const span = document.createElement("span");
            const keyLabel = document.createElement("span");
            keyLabel.textContent = "Encryption key: ";
            const txtKey = document.createElement("input");
            txtKey.id = "txtKey";
            txtKey.type = "text";
            const btnDecrypt = document.createElement("input");
            btnDecrypt.type = "button";
            btnDecrypt.value = "Decrypt file";
            btnDecrypt.id = "btnDecrypt";

            let { data, filename, key } = await this.encryptFile_internal();

            //(document.getElementById("txtKey") as HTMLInputElement).value = key; <-- for custom keys
            (document.getElementById("txtKey") as HTMLSpanElement).textContent = key;

            span.id = "spData";
            span.dataset["filename"] = filename;
            span.textContent = btoa(stringFromArrayBuffer(data));
            data = null;
            span.style.display = "none";

            html.appendChild(head);
            html.appendChild(body);
            body.appendChild(span);
            body.appendChild(keyLabel);
            body.appendChild(txtKey);
            body.appendChild(btnDecrypt);

            for (let scr of Array.from(document.getElementsByTagName("script"))) {
                let script = document.createElement("script");
                script.type = "text/javascript";
                script.textContent = await fetch(scr.src).then(x => x.text());
                head.appendChild(script);
            }
            let scrip = document.createElement("script");
            scrip.type = "text/javascript";
            scrip.textContent = `
let filename = '${filename}';
document.getElementById('btnDecrypt').onclick = e => decrypt_clicked()

async function decrypt_clicked() {
    let spData = document.getElementById('spData');
    let data = spData.textContent;

    document.body.removeChild(spData);
    spData = null;

    data = atob(data);
    data = uint8ArrayFromString(data);
    
    await wait();

    Cryptify.decryptFile(filename, data);
}`;
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