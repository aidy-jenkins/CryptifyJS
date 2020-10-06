var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Compression;
(function (Compression) {
    Compression.compress = (data, outputType, options) => __awaiter(this, void 0, void 0, function* () {
        return yield new JSZip().file("file.abc", data, options).generateAsync({ type: outputType, compression: "DEFLATE", compressionOptions: { level: 9 } });
    });
    Compression.decompress = (data, outputType, options) => __awaiter(this, void 0, void 0, function* () {
        let archive = yield JSZip.loadAsync(data, options);
        return yield archive.file("file.abc").async(outputType);
    });
})(Compression || (Compression = {}));
//# sourceMappingURL=Compression.js.map