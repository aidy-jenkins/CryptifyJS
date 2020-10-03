module Encryption {
    const getAlgorithmParameters = () => ({ name: "AES-CTR", counter: crypto.getRandomValues(new Uint8Array(16)), length: 128 } as AesCtrParams);

    export const encryptFile = async (filenameAppendix = null) => {
        try {
            let algorithm = getAlgorithmParameters();
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
    
    export const decryptFile = async (filename = null as string, content = null as Uint8Array | ArrayBuffer) => {
        try {
            let algorithm = getAlgorithmParameters();

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
                    content = await(await fetch(filename)).arrayBuffer();
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

}