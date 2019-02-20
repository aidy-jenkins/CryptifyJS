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
//# sourceMappingURL=helper.js.map