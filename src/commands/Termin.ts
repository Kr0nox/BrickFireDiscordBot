import {
    Client,
    CommandInteraction,
    Message,
    Role,
    TextBasedChannel,
    ApplicationCommandOptionType,
    CommandInteractionOptionResolver,
    ActionRow,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    AnyComponentBuilder,
    MessageActionRowComponent, TextChannel,
} from "discord.js";
import {Command} from "../Command";
import {Appointment} from "../appointments/Appointment";
import {Day, stringToDay} from "../appointments/Day";
import {stringToTime} from "../appointments/Time";
import {addAppointment, deleteAppointment, editAppointment} from "../appointments/appointmentManager";
import {DayNumbers} from "luxon";
import {readFileSync} from "fs";
import print, {DEFAULT_SETTINGS} from "../Bot";


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
                    required: true
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
                    name: "start",
                    description: "Neue Start Zeit des Termins",
                    required: false
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "end",
                    description: "Neue End Zeit des Termins",
                    required: false
                },
                {
                    type: ApplicationCommandOptionType.String,
                    name: "description",
                    description: "Neue Zusätzlich Infos",
                    required: false
                },
                {
                    type: ApplicationCommandOptionType.Boolean,
                    name: "repeat",
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
                            interaction.channel.id
                        );

                        await addAppointment(a, interaction.channel);
                    }
                } catch (e) {
                    print(e)
                }

            }
        } else if (options.getSubcommand() === "delete") {
            let date = options.getString("date")
            if (interaction.channel != null) {
                let day = date != null ? stringToDay(date) : new Day(-1, -1, -1);
                await deleteAppointment(day, interaction.channel);
            }
        } else if (options.getSubcommand() == "edit") {
            let date = options.getString("date")
            let newStart = options.getString("start")
            let newEnd = options.getString("end")
            let newdesc = options.getString("description")
            let newdRepeat = options.getBoolean("repeat")
            if (interaction.channel != null) {
                try {
                    await editAppointment(interaction.channel,
                        date != null ? stringToDay(date) : new Day(-1, -1, -1),
                        false,
                        newStart != null ? stringToTime(newStart) : undefined,
                        newEnd != null ? stringToTime(newEnd): undefined,
                        newdesc != null ? newdesc:undefined,
                        newdRepeat != null ? newdRepeat:undefined);
                } catch (e) {
                    print(e)
                }
            }
        } else if (options.getSubcommand() === "configure") {
            let mention = options.getRole("mention");
            DEFAULT_SETTINGS.defaultMeetMention = mention != undefined ? mention.toString():DEFAULT_SETTINGS.defaultMeetMention;
            DEFAULT_SETTINGS.save();
        }
        if (!keepMessage) {
            await interaction.deleteReply();
        }
    }
};


