export class Day {

    day : number;
    month : number;
    year : number;

    constructor(day: number, month: number, year:number) {
        this.day = day;
        this.month = month;
        // ugly quick fix
        const now = new Date();
        if (month < now.getMonth()) {
            this.year = now.getFullYear() + 1;
        } else {
            this.year = now.getFullYear();
        }
    }


    // TODO: Add week day
    toString() : string {
        return (this.day < 10 ? "0":"") + this.day + "." + (this.month < 10 ? "0":"") + this.month + ".";
    }

    /**
     * 1 : this is after d
     * 0: equal
     * -1 : this is before d
     * @param d
     */
    compare(d:Day) : number {
        if (this.year == d.year && this.month == d.month && this.day == d.day) {
            return 0;
        }
        if (this.year > d.year) {
            return 1;
        }
        if (this.year == d.year) {
            if (this.month > d.month) {
                return 1;
            } else if (this.month == d.month) {
                return this.day > d.day ? 1 : (this.day == d.day ? 0:-1);
            }
        }
        return -1;
    }

    nextWeek() : Day {
        const d = new Date(this.year, this.month - 1, this.day)
        const nd = new Date(d.getTime()+ 604800000)
        return new Day(nd.getDate(), nd.getMonth() + 1, nd.getFullYear());
    }


    weekDayString() : string {
        return ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"]
            [new Date(this.year, this.month-1, this.day).getDay()];
    }
}

export function stringToDay(s : string) : Day {
    let splits = s.split(new RegExp("[.:]"), 3);
    if (splits.length < 2
        || +splits[0] < 1 || +splits[0] > 31
        || +splits[1] < 1 || +splits[1] > 12) {
        throw new Error(s + " hat das falsche Format");
    }


    return new Day(+splits[0], +splits[1], splits.length == 3 ?  +splits[2] : new Date().getFullYear());
}
