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
    const getAlgorithmParameters = (counter) => ({ name: "AES-CTR", counter: (counter !== null && counter !== void 0 ? counter : crypto.getRandomValues(new Uint8Array(16))), length: 128 });
    Encryption.encrypt = (data) => __awaiter(this, void 0, void 0, function* () {
        if (!data)
            throw new TypeError("No data provided to encrypt");
        try {
            let algorithm = getAlgorithmParameters();
            let key = (yield crypto.subtle.generateKey({ name: algorithm.name, length: algorithm.length }, true, ["encrypt", "decrypt"]));
            let encrypted_data = yield crypto.subtle.encrypt(algorithm, key, data);
            let sKey = btoa(stringFromArrayBuffer(yield crypto.subtle.exportKey("raw", key)));
            sKey += ';' + btoa(stringFromUint8Array(algorithm.counter));
            sKey = btoa(sKey);
            return { data: encrypted_data, key: sKey };
        }
        catch (err) {
            console.error(err);
            throw new TypeError("Failed to encrypt file");
        }
    });
    Encryption.decrypt = (key, content) => __awaiter(this, void 0, void 0, function* () {
        if (!key || !content)
            throw new TypeError("Could not decrypt file from the parameters provided");
        try {
            key = atob(key);
            let [rawKey, counter] = key.split(';').map(atob).map(uint8ArrayFromString);
            let algorithm = getAlgorithmParameters(counter);
            let cryptoKey = yield crypto.subtle.importKey("raw", rawKey, algorithm, true, ["encrypt", "decrypt"]);
            let decryptedData = yield crypto.subtle.decrypt(algorithm, cryptoKey, content);
            content = null;
            yield wait();
            return { data: decryptedData };
        }
        catch (err) {
            console.error(err);
            throw new TypeError("Failed to decrypt file");
        }
    });
})(Encryption || (Encryption = {}));
//# sourceMappingURL=Encryption.js.map