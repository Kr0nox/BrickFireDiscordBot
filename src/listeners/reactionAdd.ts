import {Client, MessageReaction, PartialUser, User} from "discord.js";

export default (client: Client): void => {
    client.on('messageReactionAdd', async (reaction, user) => {
        // When a reaction is received, check if the structure is partial
        /*if (reaction.partial) {
            // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Something went wrong when fetching the message:', error);
                // Return as `reaction.message.author` may be undefined/null
                return;
            }
        }*/
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