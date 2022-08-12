import {Client, CommandInteraction, Interaction} from "discord.js";
import {Commands} from "../CommandCollection";
import {buttonClick} from "../appointments/appointmentManager";

export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isCommand() /*|| interaction.isContextMenu()*/) {
            await handleSlashCommand(client, interaction);
        } else if (interaction.isButton()) {
            await buttonClick(interaction)
        }
    });
};

const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
    const slashCommand = Commands.find(c => c.name === interaction.commandName);
    if (!slashCommand) {
        await interaction.followUp({ content: "An error has occurred" });
        return;
    }

    await interaction.deferReply();

    slashCommand.run(client, interaction);
};