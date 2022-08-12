import {Day} from "./Day";

export class Time {
    hour : number;
    minute : number;

    constructor(hour: number, minute: number) {
        this.hour = hour;
        this.minute = minute;
    }

    toString() : string {
        return (this.hour < 10 ? "0":"") + this.hour + ":" + (this.minute < 10 ? "0":"") + this.minute;
    }

}

export function stringToTime(s : string) : Time {
    let splits = s.split(new RegExp("\\.|:"), 2);
    if (splits.length != 2) {
        throw new Error(s + " hat das falsche Format");
    }
    return new Time(+splits[0], +splits[1]);
}