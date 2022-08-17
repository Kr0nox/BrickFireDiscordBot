import {readFileSync, writeFileSync} from "fs";

export default class Settings {
    defaultMeetMention : string = ""
    privateMentionTime : number = 0;
    private path: string

    constructor(path:string) {
        let obj = JSON.parse(readFileSync(path).toString())
        this.defaultMeetMention = obj.defaultMeetMention;
        this.privateMentionTime = obj.privateMentionTime;
        this.path = path;
    }

    save() {
        writeFileSync(this.path, JSON.stringify(this))
    }
}