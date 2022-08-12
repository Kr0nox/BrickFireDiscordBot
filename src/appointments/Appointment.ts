import {Day} from "./Day";
import {Time} from "./Time"
import {Embed, EmbedBuilder} from "discord.js";

export class Appointment {

    mention: string;
    date : Day;
    start: Time;
    end : Time | undefined;
    description : string;
    repeat : boolean;
    there : string[];
    notThere : string[]
    online : string[]

    constructor(mention:string, date:Day, start: Time, end? : Time,
                description? : string, repeat? : boolean) {
        this.mention = mention
        this.date = date;
        this.start = start;
        this.end = end;
        this.description = description == undefined ? "":description;
        this.repeat = repeat != undefined ? repeat:false;
        this.there = ["dss"];
        this.notThere = []
        this.online = []
    }

    toString() : string {
        return (this.mention != ""? this.mention+ "\n":"")
            + this.date.toString()
            + (this.end == undefined ? " um ":" von ") + this.start.toString()
            + (this.end == undefined ? "":" bis " + this.end.toString())
            + (this.description != "" ? "\n"+this.description:"");
    }

   getEmbed() : EmbedBuilder {
       let emb = new EmbedBuilder()
           .setColor(0xe67e22);
           /*.addFields(
               { name: 'Sind da:', value: 'Hollo welt name\nFrancesco',  inline: true },
               //{ name: '\u200B', value: '\u200B' },
               { name: 'Sind nicht da:', value: 'Hollo welt name\nVincent', inline: true },
               { name: 'Sind online da:', value: 'Hollo welt name\nLasse', inline: true },
           )*/

       /*.addFields(
           ,
           ,

       );
       */
       if (this.there.length > 0) {
           emb.addFields({ name: 'Sind da:', value: this.there.join("\n"),  inline: true })
       }
       if (this.notThere.length > 0) {
           emb.addFields({ name: 'Sind nicht da:', value: this.notThere.join("\n"), inline: true })
       }
       if (this.online.length > 0) {
           emb.addFields({ name: 'Sind online da:', value: this.online.join("\n"), inline: true })
       }
       return emb;
   }

    toJson() : string {
        return JSON.stringify(this);
    }

    isThere(name:string) {
        this.removeName(name)
        this.there.push(name)
    }

    isNotThere(name:string) {
        this.removeName(name)
        this.notThere.push(name)

    }

    isOnline(name:string)  {
        this.removeName(name)
        this.online.push(name)
    }

    private removeName(name:string){
        let index = this.there.indexOf(name, 0);
        if (index > -1) {
            this.there.splice(index, 1);
        }

        index = this.notThere.indexOf(name, 0);
        if (index > -1) {
            this.notThere.splice(index, 1);
        }

        index = this.online.indexOf(name, 0);
        if (index > -1) {
            this.online.splice(index, 1);
        }
    }
}

export function jsonToAppointment(json:string) : Appointment {
    let obj = JSON.parse(json)
    let a : Appointment = new Appointment(
        obj.mention,
        new Day(obj.date.day, obj.date.month, obj.date.year),
        new Time(obj.start.hour, obj.start.minute),
        obj.end != undefined ? new Time(obj.end.hour, obj.end.minute):undefined,
        obj.description,
        obj.repeat
    );
    for (let s of obj.there) {
        a.isThere(s.toString())
    }
    for (let s of obj.notThere) {
        a.isNotThere(s.toString())
    }
    for (let s of obj.online) {
        a.isOnline(s.toString())
    }
    return a;
}