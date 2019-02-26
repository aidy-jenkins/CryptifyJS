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
            let { data, filename, key } = yield this.encryptFile_internal();
            yield FileManager.downloadFile(filename + '.ENCRYPTED', data);
            if (saveKeyfile)
                yield FileManager.downloadFile(filename + '.KEY', uint8ArrayFromString(key));
            else
                document.getElementById("txtKey").value = key;
        });
    }
    static encryptFile_internal() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let algorithm = this.ALGORITHM_PARAMS;
                let key = (yield crypto.subtle.generateKey({ name: algorithm.name, length: algorithm.length }, true, ["encrypt", "decrypt"]));
                let { data, filename } = yield FileManager.uploadFile();
                let encrypted_data = yield crypto.subtle.encrypt(algorithm, key, data);
                let sKey = btoa(stringFromArrayBuffer(yield crypto.subtle.exportKey("raw", key)));
                sKey += ';' + btoa(stringFromUint8Array(algorithm.counter));
                return { data: encrypted_data, filename: filename + '.ENCRYPTED', key: sKey };
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    static decryptFile(filename = null, content = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let { filename: fName, data } = yield this.decryptFile_internal(filename, content);
            yield FileManager.downloadFile(fName, data);
        });
    }
    static decryptFile_internal(filename = null, content = null) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let algorithm = this.ALGORITHM_PARAMS;
                let rawKey;
                let counter;
                let sRawKey = document.getElementById("txtKey").value;
                if (sRawKey)
                    rawKey = uint8ArrayFromString(sRawKey);
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
                return { filename: filename.substr(0, filename.lastIndexOf('.')), data: decrypted_data };
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    static generateSelfDecrypt(saveKeyfile = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = document.createElement("html");
            const head = document.createElement("head");
            const body = document.createElement("body");
            const span = document.createElement("span");
            const txtKey = document.createElement("input");
            txtKey.id = "txtKey";
            txtKey.type = "text";
            const btnDecrypt = document.createElement("input");
            btnDecrypt.type = "button";
            btnDecrypt.value = "Decrypt file";
            btnDecrypt.id = "btnDecrypt";
            let { data, filename, key } = yield this.encryptFile_internal();
            document.getElementById("txtKey").value = key;
            span.id = "spData";
            span.dataset["filename"] = filename;
            span.textContent = btoa(stringFromArrayBuffer(data));
            span.style.display = "none";
            html.appendChild(head);
            html.appendChild(body);
            body.appendChild(span);
            body.appendChild(txtKey);
            body.appendChild(btnDecrypt);
            for (let scr of Array.from(document.getElementsByTagName("script"))) {
                let script = document.createElement("script");
                script.type = "text/javascript";
                script.textContent = yield fetch(scr.src).then(x => x.text());
                head.appendChild(script);
            }
            let scrip = document.createElement("script");
            scrip.type = "text/javascript";
            scrip.textContent = "setTimeout(() => document.getElementById('btnDecrypt').onclick = e => Cryptify.decryptFile('" + filename + "', uint8ArrayFromString(atob(document.getElementById('spData').textContent))));";
            head.appendChild(scrip);
            yield FileManager.downloadFile(filename + ".decryptor.html", uint8ArrayFromString(html.outerHTML));
        });
    }
}
//# sourceMappingURL=Cryptify.js.map