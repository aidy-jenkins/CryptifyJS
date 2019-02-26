function wait<T>(callback?: (...args) => T, timeout?: number, ...args): Promise<T> {
    return new Promise<T>((resolve, reject) => setTimeout(() => {
        try {
            resolve((callback || (() => {})).apply(null, ...args));
        }
        catch(e) {
            reject(e);
        }
    }, timeout));
}

function stringFromArrayBuffer(buffer: ArrayBuffer) {
    return stringFromUint8Array(new Uint8Array(buffer));
}

function stringFromUint8Array(arr: Uint8Array) {
    return String.fromCharCode(...arr);
}

function uint8ArrayFromString(str: string) {
    return new Uint8Array(Array(str.length).fill(0).map((_, idx) => str.charCodeAt(idx)));
}