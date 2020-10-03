var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Encryption;
(function (Encryption) {
    const getAlgorithmParameters = () => ({ name: "AES-CTR", counter: crypto.getRandomValues(new Uint8Array(16)), length: 128 });
    Encryption.encryptFile = (filenameAppendix = null) => __awaiter(this, void 0, void 0, function* () {
        try {
            let algorithm = getAlgorithmParameters();
            let { data, filename } = yield FileManager.uploadFile();
            let key = (yield crypto.subtle.generateKey({ name: algorithm.name, length: algorithm.length }, true, ["encrypt", "decrypt"]));
            let encrypted_data = yield crypto.subtle.encrypt(algorithm, key, data);
            let sKey = btoa(stringFromArrayBuffer(yield crypto.subtle.exportKey("raw", key)));
            sKey += ';' + btoa(stringFromUint8Array(algorithm.counter));
            if (filenameAppendix)
                filename += filenameAppendix;
            return { data: encrypted_data, filename, key: sKey };
        }
        catch (err) {
            console.error(err);
        }
    });
    Encryption.decryptFile = (filename = null, content = null) => __awaiter(this, void 0, void 0, function* () {
        try {
            let algorithm = getAlgorithmParameters();
            let rawKey;
            let counter;
            let sRawKey = document.getElementById("txtKey").value;
            if (sRawKey)
                rawKey = uint8ArrayFromString(sRawKey.trim());
            else {
                let { data } = yield FileManager.uploadFile(".KEY");
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
                    content = yield (yield fetch(filename)).arrayBuffer();
                else {
                    ({ data: content, filename } = yield FileManager.uploadFile(".ENCRYPTED"));
                }
            }
            else if (!filename) {
                filename = "decryptedfile.ENCRYPTED";
            }
            let key = yield crypto.subtle.importKey("raw", rawKey, algorithm, true, ["encrypt", "decrypt"]);
            let decrypted_data = yield crypto.subtle.decrypt(algorithm, key, content);
            content = null;
            yield wait();
            if (filename.includes("ENCRYPTED"))
                filename = filename.substr(0, filename.indexOf("ENCRYPTED"));
            return { filename: filename, data: decrypted_data };
        }
        catch (err) {
            console.log(err);
        }
    });
})(Encryption || (Encryption = {}));
//# sourceMappingURL=Encryption.js.map