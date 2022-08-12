export class Day {

    day : number;
    month : number;
    year : number;

    constructor(day: number, month: number, year:number) {
        this.day = day;
        this.month = month;
        // ugly quick fix
        this.year = year > 2000 ? year:2022;
    }


    // TODO: Add week day
    toString() : string {
        return (this.day < 10 ? "0":"") + this.day + "." + (this.month < 10 ? "0":"") + this.month + ".";
    }

    isAfter(d:Day) : boolean {
        if (this.year > d.year) {
            return true;
        } else if (this.year == d.year) {
            if (this.month > d.month) {
                return true;
            } else if (this.month == d.month) {
                return this.day > d.day;
            }
        }
        return false;
    }

    nextWeek() : Day {
        const d = new Date(this.year, this.month - 1, this.day)
        const nd = new Date(d.getTime()+ 604800000)
        return new Day(nd.getDate(), nd.getMonth() + 1, nd.getFullYear());
    }
}

export function stringToDay(s : string) : Day {
    let splits = s.split(new RegExp("\\.|:"), 3);
    if (splits.length < 2
        || +splits[0] < 1 || +splits[0] > 31
        || +splits[1] < 1 || +splits[1] > 12) {
        throw new Error(s + " hat das falsche Format");
    }


    return new Day(+splits[0], +splits[1], splits.length == 3 ?  +splits[2] : new Date().getFullYear());
}
