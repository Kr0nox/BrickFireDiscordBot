import {Day} from "./Day";
import {Time} from "./Time"
import {Embed, EmbedBuilder, Snowflake, TextBasedChannel} from "discord.js";

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
    channel : string;

    constructor(mention:string, date:Day, start: Time, end? : Time,
                description? : string, repeat? : boolean, channel?:string) {
        this.mention = mention
        this.date = date;
        this.start = start;
        this.end = end;
        this.description = description == undefined ? "":description;
        this.repeat = repeat != undefined ? repeat:false;
        this.there = [];
        this.notThere = []
        this.online = []
        this.channel = channel != undefined? channel:"";
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

    addThere(name:string) {
        this.removeName(name)
        this.there.push(name)
    }

    addNotThere(name:string) {
        this.removeName(name)
        this.notThere.push(name)

    }

    addOnline(name:string)  {
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
        obj.repeat,
        obj.channel
    );
    for (let s of obj.there) {
        a.addThere(s.toString())
    }
    for (let s of obj.notThere) {
        a.addNotThere(s.toString())
    }
    for (let s of obj.online) {
        a.addOnline(s.toString())
    }
    return a;
}