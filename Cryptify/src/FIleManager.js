var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class FileManager {
    static downloadFile(filename, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let blob = new Blob([data instanceof Uint8Array ? data : new Uint8Array(data)]);
            data = null;
            if (window["msSaveOrOpenBlob"]) { //Edge
                window.navigator.msSaveOrOpenBlob(blob, filename);
                return yield wait();
            }
            else { //HTML5
                let url = URL.createObjectURL(blob);
                //sData = "data:;base64," + btoa(sData); //convert to base 64 data URL
                let anchor = document.createElement('a');
                if (anchor.download !== void 0) { //HTML5 route
                    anchor.href = url;
                    anchor.download = filename;
                    anchor.textContent = "."; //Give non-whitespace content so it is 'clickable'
                    document.body.appendChild(anchor);
                    yield wait();
                    anchor.click();
                    yield wait();
                    document.body.removeChild(anchor);
                }
                else {
                    window.open(url); //fallback - filename cannot be provided
                }
            }
        });
    }
    static uploadFile(accept = "") {
        return __awaiter(this, void 0, void 0, function* () {
            let fUpload = document.createElement("input");
            try {
                fUpload.type = "file";
                fUpload.accept = accept;
                document.body.appendChild(fUpload);
                yield wait();
                fUpload.click(); //trigger upload dialog
                let e = yield Promise.race([
                    new Promise(r => fUpload.onchange = r),
                    wait(() => { throw new Error("Timed out waiting for input"); }, this.UPLOAD_TIMEOUT_MS)
                ]);
                if (fUpload.files.length < 1)
                    throw new Error("No files selected");
                let fr = new FileReader();
                fr.readAsArrayBuffer(fUpload.files[0]);
                yield new Promise(r => fr.onload = r);
                let result = fr.result;
                return { filename: fUpload.files[0].name, data: result };
            }
            finally {
                document.body.removeChild(fUpload);
            }
        });
    }
}
FileManager.UPLOAD_TIMEOUT_MS = 300000; //Five minutes
//# sourceMappingURL=FIleManager.js.map