var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Cryptify {
    constructor() {
    }
    static get ALGORITHM_PARAMS() { return { name: "AES-CTR", counter: crypto.getRandomValues(new Uint8Array(16)), length: 128 }; }
    static encryptFile(saveKeyfile = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let { data, filename, key } = yield this.encryptFile_internal('.ENCRYPTED');
            yield FileManager.downloadFile(filename + '.ENCRYPTED', data);
            if (saveKeyfile)
                yield FileManager.downloadFile(filename + '.KEY', uint8ArrayFromString(key));
            else
                document.getElementById("txtKey").value = key;
        });
    }
    static encryptFile_internal(filenameAppendix = null) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let algorithm = this.ALGORITHM_PARAMS;
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
    }
    static decryptFile(filename = null, content = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let decryption = this.decryptFile_internal(filename, content);
            content = null;
            let { filename: fName, data } = yield decryption;
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
    }
    static generateSelfDecrypt(saveKeyfile = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let { filename, content } = yield (() => __awaiter(this, void 0, void 0, function* () {
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
                let { data, filename, key } = yield this.encryptFile_internal();
                //(document.getElementById("txtKey") as HTMLInputElement).value = key; <-- for custom keys
                document.getElementById("txtKey").textContent = key;
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
                    script.textContent = yield fetch(scr.src).then(x => x.text());
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
            }))();
            let data = uint8ArrayFromString(content);
            content = null;
            try {
                yield FileManager.downloadFile(filename + ".encrypted.html", data);
            }
            catch (err) {
                console.log("Failed to download content");
                console.error(err);
            }
        });
    }
}
//# sourceMappingURL=Cryptify.js.map