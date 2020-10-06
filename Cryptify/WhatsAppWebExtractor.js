var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        let config = {
            MAX_SCROLLBACK_LENGTH: 2000,
        };
        function scrapeConversation() {
            return __awaiter(this, void 0, void 0, function* () {
                let main = document.getElementById("main");
                let conversationName = main.querySelector("div[role=button] span[title]").title;
                let messageList = main.querySelector(".copyable-area div[tabindex=\"0\"]");
                let senderNumber = null;
                for (let i = 0; i < config.MAX_SCROLLBACK_LENGTH && messageList.scrollTop > 0; ++i) {
                    messageList.scrollTop = 0;
                    for (let j = 0; j < 10 && messageList.scrollTop === 0; ++j) //Wait max 5 seconds for load but stop waiting as soon as loaded
                        yield wait(500);
                }
                //Window should now have loaded conversation in full (or as far back as we asked for - assuming server and phone stayed responsive)
                let messages = Array.from(messageList.getElementsByClassName("focusable-list-item"));
                let conversation = yield Promise.all(messages.map((message) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                    let isOutbound = message.classList.contains("message-out");
                    if (!senderNumber)
                        senderNumber = (_b = (_a = message.getAttribute("data-id")) === null || _a === void 0 ? void 0 : _a.split('@')[0].split('-')[0].split('_')) === null || _b === void 0 ? void 0 : _b[1];
                    let textElement = message.getElementsByClassName("copyable-text")[0];
                    let senderName = ((_c = textElement) === null || _c === void 0 ? void 0 : _c.getAttribute("data-pre-plain-text")) || `${isOutbound ? "You" : "Info"}: `;
                    let innerElement = (_d = textElement) === null || _d === void 0 ? void 0 : _d.getElementsByClassName("copyable-text")[0];
                    let readMoreButton; //Check if the message is very long
                    while (readMoreButton = Array.from((_f = (_e = textElement) === null || _e === void 0 ? void 0 : _e.querySelectorAll("span[role=\"button\"]"), (_f !== null && _f !== void 0 ? _f : []))).find(x => x.textContent === " Read more")) {
                        readMoreButton.click();
                        yield wait(50);
                    }
                    let messageText = (_k = (_h = (_g = innerElement) === null || _g === void 0 ? void 0 : _g.textContent, (_h !== null && _h !== void 0 ? _h : (_j = textElement) === null || _j === void 0 ? void 0 : _j.textContent)), (_k !== null && _k !== void 0 ? _k : message.textContent));
                    let tags = [];
                    if (message.querySelector("span[data-testid=\"forwarded\"]"))
                        tags.push("forwarded");
                    let predecessor = (_l = message.getElementsByClassName("quoted-mention")[0]) === null || _l === void 0 ? void 0 : _l.parentElement.parentElement; //ugh
                    if (predecessor) {
                        tags.push(`reply to sender: ${predecessor.children[0].textContent}`);
                        tags.push(`reply to message: ${predecessor.children[1].textContent}`);
                    }
                    let base64Image = void 0;
                    // let image = message.getElementsByTagName("img")[0];
                    let image = Array.from(message.querySelectorAll("div[role=\"button\"] img")).pop(); //Sometimes will have a thumbnail if a local copy isn't available
                    if (image) {
                        let canvas = document.createElement("canvas");
                        try {
                            document.body.appendChild(canvas);
                            canvas.width = image.naturalWidth;
                            canvas.height = image.naturalHeight;
                            canvas.style.width = `${canvas.width}px`;
                            canvas.style.height = `${canvas.height}px`;
                            yield wait();
                            let context = canvas.getContext("2d");
                            context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
                            let dataUrl = canvas.toDataURL("image/png", 1);
                            base64Image = dataUrl.split(',')[1];
                            if (!base64Image)
                                throw new TypeError("Failed to re-draw image");
                        }
                        catch (err) {
                            console.error(err);
                            console.log("Trying fetch");
                            try {
                                let response = yield fetch(image.src);
                                let bytes = new Uint8Array(yield response.arrayBuffer());
                                let binary = Array(bytes.byteLength).fill(0).map((x, idx) => bytes[idx]).map(x => String.fromCharCode(x));
                                base64Image = btoa(binary.join(''));
                            }
                            catch (err) {
                                console.error(err);
                            }
                        }
                        finally {
                            document.body.removeChild(canvas);
                        }
                    }
                    return { senderName, messageText, image: base64Image, tags };
                })));
                return {
                    name: conversationName,
                    senderNumber,
                    conversation
                };
            });
        }
        function downloadFile(filename, data) {
            return __awaiter(this, void 0, void 0, function* () {
                let array = data instanceof Uint8Array ? data : new Uint8Array(data);
                data = null;
                yield wait(); //Trying to only keep one copy in memory as much as possible (not guaranteed but browser will eventually try to reclaim dereferenced objects)
                let blob = new Blob([array]);
                array = null;
                yield wait();
                if (window.navigator["msSaveOrOpenBlob"]) { //Edge
                    window.navigator.msSaveOrOpenBlob(blob, filename);
                    return yield wait();
                }
                else { //HTML5
                    let url = URL.createObjectURL(blob);
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
        /** Promise wrapper for setTimeout */
        const wait = (timeout_ms = 0) => new Promise(r => setTimeout(r, timeout_ms));
        let conversation = yield scrapeConversation();
        let now = new Date();
        let isoDate = `${now.getUTCFullYear()}${(now.getUTCMonth() + 1).toString().padStart(2, '0')}${now.getUTCDate().toString().padStart(2, '0')} ${now.getUTCHours().toString().padStart(2, '0')}${now.getUTCMinutes().toString().padStart(2, '0')}${now.getUTCSeconds().toString().padStart(2, '0')}`;
        let conversationString = JSON.stringify(conversation, void 0, 4);
        let bytes = new TextEncoder().encode(conversationString);
        yield downloadFile(`${isoDate} ${conversation.name}.json`, bytes);
    });
})();
//# sourceMappingURL=WhatsAppWebExtractor.js.map