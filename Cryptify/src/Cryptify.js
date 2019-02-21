var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Cryptify {
    constructor() {
    }
    static get ALGORITHM_PARAMS() { return { name: "AES-CTR", counter: crypto.getRandomValues(new Uint8Array(16)), length: 128 }; }
    static encryptFile(saveKeyfile = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let algorithm = this.ALGORITHM_PARAMS;
                let key = (yield crypto.subtle.generateKey({ name: algorithm.name, length: algorithm.length }, true, ["encrypt", "decrypt"]));
                let { data, filename } = yield FileManager.uploadFile();
                let encrypted_data = yield crypto.subtle.encrypt(algorithm, key, data);
                let rawKey = btoa(String.fromCharCode(...new Uint8Array(yield crypto.subtle.exportKey("raw", key))));
                rawKey += ';' + btoa(String.fromCharCode(...algorithm.counter));
                yield FileManager.downloadFile(filename + '.ENCRYPTED', encrypted_data);
                if (saveKeyfile)
                    yield FileManager.downloadFile(filename + '.KEY', new Uint8Array(Array(rawKey.length).fill(0).map((_, idx) => rawKey.charCodeAt(idx))));
                else
                    document.getElementById("txtKey").value = rawKey;
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    static decryptFile(filename = null) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let algorithm = this.ALGORITHM_PARAMS;
                let rawKey;
                let counter;
                let sRawKey = document.getElementById("txtKey").value;
                if (sRawKey)
                    rawKey = new Uint8Array(Array(sRawKey.length).fill(0).map((_, idx) => sRawKey.charCodeAt(idx)));
                else {
                    let { data } = yield FileManager.uploadFile(".KEY");
                    rawKey = new Uint8Array(data);
                }
                let [sKey, sCounter] = String.fromCharCode(...new Uint8Array(rawKey)).split(';');
                sKey = atob(sKey);
                sCounter = atob(sCounter);
                rawKey = new Uint8Array(Array(sKey.length).fill(0).map((_, idx) => sKey.charCodeAt(idx)));
                counter = new Uint8Array(Array(sCounter.length).fill(0).map((_, idx) => sCounter.charCodeAt(idx)));
                algorithm.counter = counter;
                let data;
                if (filename)
                    data = yield (yield fetch(filename)).arrayBuffer();
                else {
                    ({ data, filename } = yield FileManager.uploadFile(".ENCRYPTED"));
                }
                let key = yield crypto.subtle.importKey("raw", rawKey, algorithm, true, ["encrypt", "decrypt"]);
                let decrypted_data = yield crypto.subtle.decrypt(algorithm, key, data);
                yield FileManager.downloadFile(filename.substr(0, filename.lastIndexOf('.')), decrypted_data);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    static generateSelfDecrypt() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
}
//# sourceMappingURL=Cryptify.js.map