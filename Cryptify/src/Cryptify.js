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
    static encryptFile() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let key = (yield crypto.subtle.generateKey({ name: "AES-CTR", length: 128 }, true, ["encrypt", "decrypt"]));
                console.log("reached");
                let { data, filename } = yield FileManager.uploadFile();
                let encrypted_data = yield crypto.subtle.encrypt({ name: "AES-CTR", counter: new Uint8Array(16), length: 128 }, key, data);
                let rawKey = yield crypto.subtle.exportKey("raw", key);
                yield FileManager.downloadFile(filename + '.ENCRYPTED', encrypted_data);
                yield FileManager.downloadFile(filename + '.KEY', rawKey);
            }
            catch (err) {
                console.log((err && err.message) || err);
            }
        });
    }
    static decryptFile() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { data: rawKey } = yield FileManager.uploadFile(".KEY");
                let { data: file, filename } = yield FileManager.uploadFile(".ENCRYPTED");
                let key = yield crypto.subtle.importKey("raw", rawKey, { name: "AES-CTR", length: 128 }, true, ["encrypt", "decrypt"]);
                let decrypted_data = yield crypto.subtle.decrypt({ name: "AES-CTR", counter: new Uint8Array(16), length: 128 }, key, file);
                yield FileManager.downloadFile(filename.substr(0, filename.lastIndexOf('.')), decrypted_data);
            }
            catch (err) {
                console.log((err && err.message) || err);
            }
        });
    }
}
//# sourceMappingURL=Cryptify.js.map