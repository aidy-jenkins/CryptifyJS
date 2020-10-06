import * as JSZipModule from "jszip";

declare global {
    export const JSZip: typeof JSZipModule;
    export module JSZip {
        export type JSZipLoadOptions = JSZipModule.JSZipLoadOptions;
        export type JSZipObject = JSZipModule.JSZipObject;
    }    
}