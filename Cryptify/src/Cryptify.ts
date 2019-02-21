class Cryptify {
    constructor() {

    }

    public static async encryptFile() {
        try {
            let key = (await crypto.subtle.generateKey({ name: "AES-CTR", length: 128 }, true, ["encrypt", "decrypt"])) as CryptoKey;
            console.log("reached");
            let { data, filename } = await FileManager.uploadFile();

            let encrypted_data = await crypto.subtle.encrypt({ name: "AES-CTR", counter: new Uint8Array(16), length: 128 } as AesCtrParams, key, data);

            let rawKey = await crypto.subtle.exportKey("raw", key);

            await FileManager.downloadFile(filename + '.ENCRYPTED', encrypted_data);
            await FileManager.downloadFile(filename + '.KEY', rawKey);
        }
        catch (err) {
            console.log(err);
        }
    }

    public static async decryptFile() {
        try {
            let { data: rawKey } = await FileManager.uploadFile(".KEY");
            let { data: file, filename } = await FileManager.uploadFile(".ENCRYPTED");

            let key = await crypto.subtle.importKey("raw", rawKey, { name: "AES-CTR", length: 128 }, true, ["encrypt", "decrypt"]);

            let decrypted_data = await crypto.subtle.decrypt({ name: "AES-CTR", counter: new Uint8Array(16), length: 128 }, key, file);

            await FileManager.downloadFile(filename.substr(0, filename.lastIndexOf('.')), decrypted_data);
        }
        catch (err) {
            console.log(err);
        }
    }
}