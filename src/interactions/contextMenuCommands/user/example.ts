import utils from "../../../utils/utils.js";
import { UserCommand } from "../../../structures/UserCommand.js";
import { ApplicationCommandType } from 'discord.js';
import embed from "../../../utils/embed.js";

export default new UserCommand({
    name: "example",
    type: ApplicationCommandType.User,
    disabled: true,
    run: async ({ interaction, client }) => {
        const target = interaction.targetMember;
        await interaction.reply({ embeds: [embed.info(`The user you clicked on is ${target.user.username}`)], flags: utils.replyFlags() });
    }
});
