module Encryption {
    const getAlgorithmParameters = (counter?: AesCtrParams["counter"]) => ({ name: "AES-CTR", counter: counter ?? crypto.getRandomValues(new Uint8Array(16)), length: 128 } as AesCtrParams);

    export const encryptFile = async (filenameAppendix = null) => {
        try {
            let algorithm = getAlgorithmParameters();
            let { data, filename } = await FileManager.uploadFile();
            let key = (await crypto.subtle.generateKey({ name: algorithm.name, length: algorithm.length }, true, ["encrypt", "decrypt"])) as CryptoKey;

            let encrypted_data = await crypto.subtle.encrypt(algorithm, key, data);

            let sKey = btoa(stringFromArrayBuffer(await crypto.subtle.exportKey("raw", key)));
            sKey += ';' + btoa(stringFromUint8Array(algorithm.counter as Uint8Array));
            sKey = btoa(sKey);

            if (filenameAppendix)
                filename += filenameAppendix;

            return { data: encrypted_data, filename, key: sKey };
        }
        catch (err) {
            console.error(err);

            throw new TypeError("Failed to encrypt file");
        }
    }
    
    export const decryptFile = async (filename = null as string, key: string, content: Uint8Array | ArrayBuffer) => {
        if(!key || !content)
            throw new TypeError("Could not decrypt file from the parameters provided");

        try {
            key = atob(key);
            let [rawKey, counter] = key.split(';').map(atob).map(uint8ArrayFromString);
            
            let algorithm = getAlgorithmParameters(counter);

            let cryptoKey = await crypto.subtle.importKey("raw", rawKey, algorithm, true, ["encrypt", "decrypt"]);

            let decryptedData = await crypto.subtle.decrypt(algorithm, cryptoKey, content);

            content = null;
            await wait();

            if (!filename) {
                filename = "decryptedfile";
            }
            else if (filename.includes("ENCRYPTED"))
                filename = filename.substr(0, filename.indexOf("ENCRYPTED"));

            return { filename: filename, data: decryptedData };
        }
        catch (err) {
            console.error(err);

            throw new TypeError("Failed to decrypt file");
        }
    }

}