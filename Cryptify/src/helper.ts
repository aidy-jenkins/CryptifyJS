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