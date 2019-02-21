class Cryptify {
    constructor() {

    }

    private static get ALGORITHM_PARAMS() { return { name: "AES-CTR", counter: crypto.getRandomValues(new Uint8Array(16)), length: 128 } as AesCtrParams; }

    public static async encryptFile(saveKeyfile = false) {
        try {
            let algorithm = this.ALGORITHM_PARAMS;
            let key = (await crypto.subtle.generateKey({ name: algorithm.name, length: algorithm.length }, true, ["encrypt", "decrypt"])) as CryptoKey;
            let { data, filename } = await FileManager.uploadFile();

            let encrypted_data = await crypto.subtle.encrypt(algorithm, key, data);

            let rawKey = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.exportKey("raw", key))));
            rawKey += ';' + btoa(String.fromCharCode(...algorithm.counter as Uint8Array));

            await FileManager.downloadFile(filename + '.ENCRYPTED', encrypted_data);
            if (saveKeyfile)
                await FileManager.downloadFile(filename + '.KEY', new Uint8Array(Array(rawKey.length).fill(0).map((_, idx) => rawKey.charCodeAt(idx))));
            else
                (document.getElementById("txtKey") as HTMLInputElement).value = rawKey;
        }
        catch (err) {
            console.log(err);
        }
    }

    public static async decryptFile(filename = null as string) {
        try {
            let algorithm = this.ALGORITHM_PARAMS;
            
            let rawKey: Uint8Array;
            let counter: Uint8Array;
            let sRawKey = (document.getElementById("txtKey") as HTMLInputElement).value;
            if (sRawKey)
                rawKey = new Uint8Array(Array(sRawKey.length).fill(0).map((_, idx) => sRawKey.charCodeAt(idx)));
            else {
                let { data } = await FileManager.uploadFile(".KEY");
                rawKey = new Uint8Array(data);
            }

            let [sKey, sCounter] = String.fromCharCode(...new Uint8Array(rawKey)).split(';');

            sKey = atob(sKey);
            sCounter = atob(sCounter);
            rawKey = new Uint8Array(Array(sKey.length).fill(0).map((_, idx) => sKey.charCodeAt(idx)));
            counter = new Uint8Array(Array(sCounter.length).fill(0).map((_, idx) => sCounter.charCodeAt(idx)));

            algorithm.counter = counter;

            let data: ArrayBuffer;
            if (filename)
                data = await (await fetch(filename)).arrayBuffer();
            else {
                ({ data, filename } = await FileManager.uploadFile(".ENCRYPTED"));
            }

            let key = await crypto.subtle.importKey("raw", rawKey, algorithm, true, ["encrypt", "decrypt"]);

            let decrypted_data = await crypto.subtle.decrypt(algorithm, key, data);

            await FileManager.downloadFile(filename.substr(0, filename.lastIndexOf('.')), decrypted_data);
        }
        catch (err) {
            console.log(err);
        }
    }

    public static async generateSelfDecrypt() {
        
    }
}