var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/** Main controller class to manage the page */
class Cryptify {
    static isCompressable(filename) {
        return !this.COMPRESSION_BLACKLIST.includes(this.getFileExtension(filename));
    }
    static getFileExtension(filename) {
        let parts = filename.split('.');
        let extension = parts[parts.length - 1];
        return extension;
    }
    static generateSelfDecrypt(saveKeyfile = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { filename, content } = yield (() => __awaiter(this, void 0, void 0, function* () {
                    let { html, head, body } = this.createPageWrapper();
                    let dvSelfDecrypt = document.getElementById("dvSelfDecrypt");
                    dvSelfDecrypt = dvSelfDecrypt.cloneNode(true);
                    dvSelfDecrypt.style.display = "";
                    let spData = dvSelfDecrypt.querySelector("#spData");
                    let { data, filename } = yield FileManager.uploadFile({ onFileSelect: () => this.updateStatus("Uploading file") });
                    let compress = document.getElementById("chkCompress").checked;
                    compress = compress && this.isCompressable(filename);
                    if (compress) {
                        yield this.updateStatus("Compressing - optimising for best file size");
                        data = yield Compression.compress(data, "arraybuffer", { base64: true });
                    }
                    yield this.updateStatus("Encrypting");
                    let { data: encryptedData, key } = yield Encryption.encrypt(data);
                    yield this.updateStatus("Preparing bundle");
                    document.getElementById("txtKey").textContent = key;
                    spData.dataset["filename"] = filename;
                    spData.dataset["compressed"] = compress.toString();
                    spData.textContent = btoa(stringFromArrayBuffer(encryptedData));
                    encryptedData = null;
                    body.appendChild(dvSelfDecrypt);
                    let packages = [...yield this.packageScripts(), ...yield this.packageStyles()];
                    for (let item of packages)
                        head.appendChild(item);
                    let scrip = document.createElement("script");
                    scrip.type = "text/javascript";
                    scrip.textContent = `document.getElementById('btnDecrypt').onclick = e => Cryptify.selfDecrypt();`;
                    body.appendChild(scrip);
                    return { filename, content: html.outerHTML };
                }))();
                yield this.updateStatus("Preparing file for download");
                let data = uint8ArrayFromString(content);
                content = null;
                let dvKey = document.getElementById("dvKey");
                dvKey.style.display = "";
                try {
                    yield FileManager.downloadFile(filename + ".encrypted.html", data);
                }
                catch (err) {
                    this.updateStatus("Failed to download content");
                    console.error(err);
                }
                this.updateStatus("");
            }
            catch (err) {
                this.updateStatus("Failed");
            }
        });
    }
    static selfDecrypt() {
        return __awaiter(this, void 0, void 0, function* () {
            let spData = document.getElementById("spData");
            let filename = spData.dataset["filename"];
            let compressed = JSON.parse(spData.dataset["compressed"]);
            let data = spData.textContent;
            spData.parentElement.removeChild(spData);
            spData = null;
            yield this.updateStatus("Unpacking bundle");
            let bytes = uint8ArrayFromString(atob(data));
            data = null;
            yield wait();
            Cryptify.decryptFile(bytes, compressed, filename);
        });
    }
    static decryptFile(content, compressed, filename = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let key = document.getElementById("txtKey").value;
            yield this.updateStatus("Decrypting data");
            let decryption = Encryption.decrypt(key, content);
            content = null;
            let { data } = yield decryption;
            if (compressed) {
                yield this.updateStatus("Decompressing file");
                data = yield Compression.decompress(data, "arraybuffer", { base64: true });
            }
            if (!filename) {
                filename = this.DEFAULT_DOWNLOAD_FILENAME;
            }
            else if (filename.includes("ENCRYPTED"))
                filename = filename.substr(0, filename.indexOf("ENCRYPTED"));
            yield this.updateStatus("Downloading file");
            yield FileManager.downloadFile(filename, data);
            this.updateStatus("");
            window.location.reload();
        });
    }
    static copyKeyToClipboard() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let key = document.getElementById("txtKey").textContent;
                yield navigator.clipboard.writeText(key);
                let status = document.getElementById("copyStatus");
                status.textContent = "Copied!";
                yield wait(2000);
                status.textContent = "";
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    static createPageWrapper() {
        let html = document.createElement("html");
        let head = document.createElement("head");
        let body = document.createElement("body");
        html.appendChild(head);
        html.appendChild(body);
        return { html, head, body };
    }
    static packageScripts() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Promise.all(Array.from(document.getElementsByTagName("script")).map((scr) => __awaiter(this, void 0, void 0, function* () {
                let script = document.createElement("script");
                script.type = "text/javascript";
                script.textContent = yield fetch(scr.src).then(x => x.text());
                return script;
            })));
        });
    }
    static packageStyles() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Promise.all(Array.from(document.getElementsByTagName("link")).filter(x => x.rel === "stylesheet").map((stylesheet) => __awaiter(this, void 0, void 0, function* () {
                let style = document.createElement("style");
                style.type = "text/css";
                style.textContent = yield fetch(stylesheet.href).then(x => x.text());
                return style;
            })));
        });
    }
    static updateStatus(message) {
        return __awaiter(this, void 0, void 0, function* () {
            document.getElementById("lblStatus").textContent = message;
            yield wait(200);
        });
    }
}
Cryptify.DEFAULT_DOWNLOAD_FILENAME = "decryptedfile";
Cryptify.COMPRESSION_BLACKLIST = [
    "zip",
    "rar",
    "7z",
    "gz",
    "mp4",
    "mp3",
    "mpeg",
    "jpg",
    "jpeg"
];
//# sourceMappingURL=Cryptify.js.map