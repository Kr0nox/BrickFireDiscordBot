import {Client, MessageReaction, PartialUser, User} from "discord.js";

export default (client: Client): void => {
    client.on('messageReactionAdd', async (reaction, user) => {
        if (reaction.partial) {
            await reaction.fetch().then(fullMessage => registerReaction(fullMessage, user, client));
        } else {
            await registerReaction(reaction, user, client);
        }
    });
};

async function registerReaction(reaction : MessageReaction, user : User | PartialUser, client : Client) {
    if (user === client.user) {
        return;
    }

    let message = reaction.message;
    if (message.author != null && message.author !== client.user) {
        return;
    }

    await reaction.users.remove(user.id)
}