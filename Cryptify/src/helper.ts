/** Promise wrapper for setTimeout
 * @param timeout The timeout in milliseconds to wait before resolving
 */
function wait(timeout?: number): Promise<void>;
/**
 * Promise wrapper for setTimeout
 * @param callback A callback function to be executed, the promise will be resolved to its return value
 * @param timeout The timeout in milliseconds to wait before executing callback
 * @param args Optional additional arguments for the callback when it is executed
 */
function wait<T>(callback: (...args: any[]) => T, timeout?: number, ...args: any[]): Promise<T>;
function wait<T>(firstArg: number | ((...args: any[]) => T), timeout?: number, ...args): Promise<T> {

    let callback = (typeof firstArg === "number" ? void(timeout = firstArg) : firstArg) ?? (() => {});

    return new Promise<T>((resolve, reject) => setTimeout(() => {
        try {
            resolve(callback.apply(null, ...args));
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
    return (Array.prototype.map.call(arr, x => String.fromCharCode(x)) as string[]).join('');

}

function uint8ArrayFromString(str: string) {
    return new Uint8Array(Array(str.length).fill(0).map((_, idx) => str.charCodeAt(idx)));
}