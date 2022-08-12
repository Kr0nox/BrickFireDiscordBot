import {readFileSync, writeFileSync} from "fs";

export default class Settings {
    defaultMeetMention : string = ""
    private path: string

    constructor(path:string) {
        let obj = JSON.parse(readFileSync(path).toString())
        this.defaultMeetMention = obj.defaultMeetMention;
        this.path = path;
    }

    save() {
        writeFileSync(this.path, JSON.stringify(this))
    }
}