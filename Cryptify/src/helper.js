function wait(callback, timeout, ...args) {
    return new Promise((resolve, reject) => setTimeout(() => {
        try {
            resolve((callback || (() => { })).apply(null, ...args));
        }
        catch (e) {
            reject(e);
        }
    }, timeout));
}
function stringFromArrayBuffer(buffer) {
    return stringFromUint8Array(new Uint8Array(buffer));
}
function stringFromUint8Array(arr) {
    return Array.prototype.map.call(arr, x => String.fromCharCode(x)).join('');
}
function uint8ArrayFromString(str) {
    return new Uint8Array(Array(str.length).fill(0).map((_, idx) => str.charCodeAt(idx)));
}
//# sourceMappingURL=helper.js.map