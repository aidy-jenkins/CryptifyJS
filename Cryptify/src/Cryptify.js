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
    constructor() { }
    static selfDecrypt() {
        return __awaiter(this, void 0, void 0, function* () {
            let spData = document.getElementById("spData");
            let filename = spData.dataset["filename"];
            let data = spData.textContent;
            spData.parentElement.removeChild(spData);
            spData = null;
            yield wait();
            let bytes = uint8ArrayFromString(atob(data));
            data = null;
            yield wait();
            Cryptify.decryptFile(filename, bytes);
        });
    }
    static decryptFile(filename = null, content = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let key = document.getElementById("txtKey").value;
            let decryption = Encryption.decryptFile(filename, key, content);
            content = null;
            let { filename: fName, data } = yield decryption;
            yield FileManager.downloadFile(fName, data);
        });
    }
    static copyKeyToClipboard() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let key = document.getElementById("txtKey").textContent;
                yield navigator.clipboard.writeText(key);
                let status = document.getElementById("copyStatus");
                status.textContent = "Copied!";
                yield wait(null, 2000);
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
    static generateSelfDecrypt(saveKeyfile = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let { filename, content } = yield (() => __awaiter(this, void 0, void 0, function* () {
                let { html, head, body } = this.createPageWrapper();
                let dvSelfDecrypt = document.getElementById("dvSelfDecrypt");
                dvSelfDecrypt = dvSelfDecrypt.cloneNode(true);
                dvSelfDecrypt.style.display = "";
                let spData = dvSelfDecrypt.querySelector("#spData");
                let { data, filename, key } = yield Encryption.encryptFile();
                document.getElementById("txtKey").textContent = key;
                spData.dataset["filename"] = filename;
                spData.textContent = btoa(stringFromArrayBuffer(data));
                data = null;
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
            let data = uint8ArrayFromString(content);
            content = null;
            let dvKey = document.getElementById("dvKey");
            dvKey.style.display = "";
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