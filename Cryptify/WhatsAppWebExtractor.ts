(async function () {

    let config = {
        MAX_SCROLLBACK_LENGTH: 2000,
        //MAX_SCROLLBACK_LENGTH: 5,
    };

    async function scrapeConversation() {
        let main = document.getElementById("main");

        let conversationName = (main.querySelector("div[role=button] span[title]") as HTMLElement).title;
        let messageList = main.querySelector(".copyable-area div[tabindex=\"0\"]") as HTMLElement;
        let senderNumber = null as string;
        
        for(let i = 0; i < config.MAX_SCROLLBACK_LENGTH && messageList.scrollTop > 0; ++i) {
            messageList.scrollTop = 0;

            for(let j = 0; j < 10 && messageList.scrollTop === 0; ++j) //Wait max 5 seconds for load but stop waiting as soon as loaded
                await wait(500);
        }

        //Window should now have loaded conversation in full (or as far back as we asked for - assuming server and phone stayed responsive)
        let messages = Array.from(messageList.getElementsByClassName("focusable-list-item")) as HTMLElement[];
        let conversation = await Promise.all(messages.map(async message => {
            let isOutbound = message.classList.contains("message-out");
            if(!senderNumber)
                senderNumber = message.getAttribute("data-id")?.split('@')[0].split('-')[0].split('_')?.[1];

            let textElement = message.getElementsByClassName("copyable-text")[0] as HTMLElement;
            let senderName = textElement?.getAttribute("data-pre-plain-text") || `${isOutbound ? "You" : "Info"}: `;

            let innerElement = textElement?.getElementsByClassName("copyable-text")[0] as HTMLElement;

            let readMoreButton: HTMLElement; //Check if the message is very long
            while(readMoreButton = Array.from<HTMLElement>(textElement?.querySelectorAll("span[role=\"button\"]") ?? []).find(x => x.textContent === " Read more")) {
                readMoreButton.click();
                await wait(50);
            }

            let messageText = innerElement?.textContent ?? textElement?.textContent ?? message.textContent;
            let tags = [] as string[];

            if(message.querySelector("span[data-testid=\"forwarded\"]"))
                tags.push("forwarded");

            let predecessor = (message.getElementsByClassName("quoted-mention")[0] as HTMLElement)?.parentElement.parentElement; //ugh
            if(predecessor) {
                tags.push(`reply to sender: ${predecessor.children[0].textContent}`);
                tags.push(`reply to message: ${predecessor.children[1].textContent}`);
            }

            let base64Image = void 0 as string;
            // let image = message.getElementsByTagName("img")[0];
            let image = Array.from<HTMLImageElement>(message.querySelectorAll("div[role=\"button\"] img")).pop(); //Sometimes will have a thumbnail if a local copy isn't available
            if(image) {

                let canvas = document.createElement("canvas");
                try {
                    document.body.appendChild(canvas);
                    canvas.width = image.naturalWidth;
                    canvas.height = image.naturalHeight;
                    canvas.style.width = `${canvas.width}px`;
                    canvas.style.height = `${canvas.height}px`;


                    await wait();

                    let context = canvas.getContext("2d");
                    context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);

                    let dataUrl = canvas.toDataURL("image/png", 1);
                    base64Image = dataUrl.split(',')[1];

                    if(!base64Image)
                        throw new TypeError("Failed to re-draw image");
                }
                catch(err) {
                    console.error(err);
                    console.log("Trying fetch");

                    try {
                        let response = await fetch(image.src);
                        
                        let bytes = new Uint8Array(await response.arrayBuffer());
                        
                        let binary = Array(bytes.byteLength).fill(0).map((x, idx) => bytes[idx]).map(x => String.fromCharCode(x));
                        base64Image = btoa(binary.join(''));
                    }
                    catch(err) {
                        console.error(err);
                    }
                }
                finally {
                    document.body.removeChild(canvas);
                }
                
            }

            return { senderName, messageText, image: base64Image, tags };
        }));

        return {
            name: conversationName,
            senderNumber,
            conversation
        };
    }

    async function downloadFile(filename: string, data: ArrayBuffer | Uint8Array): Promise<void> {
        let array = data instanceof Uint8Array ? data : new Uint8Array(data);
        data = null;
        await wait(); //Trying to only keep one copy in memory as much as possible (not guaranteed but browser will eventually try to reclaim dereferenced objects)

        let blob = new Blob([array]);
        array = null;
        await wait();

        if(window.navigator["msSaveOrOpenBlob"]) { //Edge
            window.navigator.msSaveOrOpenBlob(blob, filename);
            return await wait();
        }
        else  { //HTML5
            let url = URL.createObjectURL(blob);

            let anchor = document.createElement('a');
            if(anchor.download !== void 0) {  //HTML5 route
                anchor.href = url;
                anchor.download = filename;
                anchor.textContent = "."; //Give non-whitespace content so it is 'clickable'
                document.body.appendChild(anchor);
                await wait();
                anchor.click();
                await wait();
                document.body.removeChild(anchor);
            }
            else {
                window.open(url); //fallback - filename cannot be provided
            }
        }
    }

    /** Promise wrapper for setTimeout */
    const wait = (timeout_ms = 0) => new Promise<void>(r => setTimeout(r, timeout_ms));

    let conversation = await scrapeConversation();
    let now = new Date();
    let isoDate = `${now.getUTCFullYear()}${(now.getUTCMonth() + 1).toString().padStart(2, '0')}${now.getUTCDate().toString().padStart(2, '0')} ${now.getUTCHours().toString().padStart(2, '0')}${now.getUTCMinutes().toString().padStart(2, '0')}${now.getUTCSeconds().toString().padStart(2, '0')}`;
    let conversationString = JSON.stringify(conversation, void 0, 4);
    let bytes = new TextEncoder().encode(conversationString);

    await downloadFile(`${isoDate} ${conversation.name}.json`, bytes);
})();
