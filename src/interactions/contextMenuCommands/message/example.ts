import utils from "../../../utils/utils.js";
import { MessageCommand } from "../../../structures/MessageCommand.js";
import { ApplicationCommandType } from 'discord.js';
import embed from "../../../utils/embed.js";

export default new MessageCommand({
    name: "example",
    type: ApplicationCommandType.Message,
    disabled: true,
    run: async ({ interaction, client }) => {
        const target = interaction.targetMessage;
        await interaction.reply({ embeds: [embed.info(`The message you clicked on is ${target.id}`)], flags: utils.replyFlags() });
    }
});
