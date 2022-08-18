
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

    compare(t:Time) {
        if (t.hour == this.hour && t.minute == this.minute) {
            return 0;
        }
        if (this.hour > t.hour) {
            return 1;
        }
        if (this.hour == t.hour) {
            return this.minute > t.minute ? 1:(this.minute == t.minute ? 0:-1);
        }
        return -1;
    }

}

export function stringToTime(s : string) : Time {
    let splits = s.split(new RegExp("[.:]"), 2);
    if (splits.length != 2
        || +splits[0] < 0 || +splits[0] > 23
        || +splits[1] < 0 || +splits[1] > 59) {
        throw new Error(s + " hat das falsche Format");
    }
    return new Time(+splits[0], +splits[1]);
}