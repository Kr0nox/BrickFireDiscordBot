export class Day {

    day : number;
    month : number;
    year : number;

    constructor(day: number, month: number, year:number) {
        this.day = day;
        this.month = month;
        this.year = year;
    }


    // TODO: Add week day
    toString() : string {
        return (this.day < 10 ? "0":"") + this.day + "." + (this.month < 10 ? "0":"") + this.month + ".";
    }
}

export function stringToDay(s : string) : Day {
    let splits = s.split(new RegExp("\\.|:"), 3);
    if (splits.length < 2) {
        throw new Error(s + " hat das falsche Format");
    }
    return new Day(+splits[0], +splits[1],splits.length == 3 ? +splits[2] : new Date().getFullYear());
}
