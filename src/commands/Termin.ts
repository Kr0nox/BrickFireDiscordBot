import {
    Client,
    CommandInteraction,
    ApplicationCommandOptionType,
    CommandInteractionOptionResolver,
    ButtonStyle,
} from "discord.js";
import {Command} from "../Command";
import {Appointment} from "../appointments/Appointment";
import {Day, stringToDay} from "../appointments/Day";
import {stringToTime} from "../appointments/Time";
import {addAppointment, deleteAppointment, editAppointment} from "../appointments/appointmentManager";
import printToConsole, {DEFAULT_SETTINGS} from "../Bot";


export const Termin: Command =
    {
    name: "termin",
    description: "Erstellt einen Termin",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "create",
            description: "Erstelle einen Termin",
            options: [
                {
                    type: ApplicationCommandOptionType.String,
                    name: "date",
                    description: "Datum des Termins",
                    required: true
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "start",
                    description: "Start Zeit des Termins",
                    required: true
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "end",
                    description: "End Zeit des Termins",
                    required: false
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "description",
                    description: "Zusätzlich Infos",
                    required: false
                },
                {
                    type: ApplicationCommandOptionType.Boolean,
                    name: "repeat",
                    description: "Wiederholt den Termin jede Woche",
                    required: false
                },
                {
                    type: ApplicationCommandOptionType.Role,
                    name: "mention",
                    description: "Wird gepingt (überschreibt default mention)",
                    required: false
                },
                {
                    type: ApplicationCommandOptionType.Boolean,
                    name: "privat_erinnern",
                    description: "@mention wird vor dem Termin nochmal privat gepingt, wenn sie nicht, reagiert haben",
                    required: false
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "configure",
            description: "Default Einstellungen",
            options:[
                {
                    type: ApplicationCommandOptionType.Role,
                    name: "mention",
                    description: "Default ping",
                    required: false
                },
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: "private_mention_time",
                    description: "Zeit in Stunden die eine private Nachricht vor einem Termin verschickt wird",
                    required: false
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "delete",
            description: "Lösche einen Termin",
            options:[
                {
                    type: ApplicationCommandOptionType.String,
                    name: "date",
                    description: "Datum des Termins der gelöscht werden soll",
                    required: true
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "start",
                    description: "Optionale Start Zeit des zu löschenden Termins, falls es an dem Tag mehrere gibt",
                    required: false
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "edit",
            description: "Bearbeite einen Termin",
            options:[
                {
                    type: ApplicationCommandOptionType.String,
                    name: "date",
                    description: "Datum des Termins der bearbeitet werden soll",
                    required: true
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "old_start",
                    description: "Alte Start Zeit des Termins. Nutzen falls es mehrere Termine an dem Tag gibt",
                    required: false
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "new_start",
                    description: "Neue Start Zeit des Termins",
                    required: false
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "new_end",
                    description: "Neue End Zeit des Termins",
                    required: false
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "new_description",
                    description: "Neue Zusätzlich Infos",
                    required: false
                },
                {
                    type: ApplicationCommandOptionType.Boolean,
                    name: "new_repeat",
                    description: "Wiederholt den Termin jede Woche",
                    required: false
                },
                {
                    type: ApplicationCommandOptionType.Boolean,
                    name: "remove_reactions",
                    description: "Entfernt zu und absagen",
                    required: false
                }
            ]
        }
    ],

    run: async (client: Client, interaction: CommandInteraction) => {
        if (!interaction.isChatInputCommand()) {
            return;
        }
        let keepMessage : boolean = false;
        let options = interaction.options as CommandInteractionOptionResolver;

        if (options.getSubcommand() === "create") {
            let date = options.getString("date");
            let start = options.getString("start");
            let end = options.getString("end");
            let mention = options.getRole("mention");
            let description = options.getString("description");
            let repeat = options.getBoolean("repeat");
            let mentionPrivately = options.getBoolean("privat_erinnern")
            if (date != null && start != null) {
                try {
                    if (interaction.channel != null) {
                        let a: Appointment = new Appointment(
                            mention != null ? mention.toString() : DEFAULT_SETTINGS.defaultMeetMention,
                            stringToDay(date),
                            stringToTime(start),
                            end != null ? stringToTime(end) : undefined,
                            description != null ? description : undefined,
                            repeat != null ? repeat : undefined,
                            interaction.channel.id,
                            mentionPrivately != null ? !mentionPrivately:undefined
                        );

                        await addAppointment(a, interaction.channel);
                    }
                } catch (e) {
                    printToConsole(e)
                }

            }
        }


        else if (options.getSubcommand() === "delete") {
            let date = options.getString("date")
            let start = options.getString("start")
            if (interaction.channel != null) {
                try {
                    let day = date != null ? stringToDay(date) : new Day(-1, -1, -1);
                    let s = start != null ? stringToTime(start) : undefined;
                    await deleteAppointment(interaction.channel, day, s);
                } catch (e) {
                    printToConsole(e)
                }
            }
        }


        else if (options.getSubcommand() == "edit") {
            let date = options.getString("date")
            let oldStart = options.getString("old_start");
            let newStart = options.getString("new_start")
            let newEnd = options.getString("new_end")
            let newDescription = options.getString("new_description")
            let newRepeat = options.getBoolean("new:repeat")
            let removeReactions = options.getBoolean("remove_reactions")
            if (interaction.channel != null) {
                try {
                    await editAppointment(interaction.channel,
                        date != null ? stringToDay(date) : new Day(-1, -1, -1),
                        removeReactions != null ? removeReactions : false,
                        oldStart != null ? stringToTime(oldStart) : undefined,
                        newStart != null ? stringToTime(newStart) : undefined,
                        newEnd != null ? stringToTime(newEnd): undefined,
                        newDescription != null ? newDescription:undefined,
                        newRepeat != null ? newRepeat:undefined);
                } catch (e) {
                    printToConsole(e)
                }
            }
        }


        else if (options.getSubcommand() === "configure") {
            let mention = options.getRole("mention");
            let time = options.getInteger("private_mention_time")
            DEFAULT_SETTINGS.defaultMeetMention = mention != null ? mention.toString():DEFAULT_SETTINGS.defaultMeetMention;
            DEFAULT_SETTINGS.privateMentionTime = time != null ? time:DEFAULT_SETTINGS.privateMentionTime
            DEFAULT_SETTINGS.save();
        }


        if (!keepMessage) {
            await interaction.deleteReply();
        }
    }
};


