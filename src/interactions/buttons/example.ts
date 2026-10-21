import { MessageFlags } from "discord.js";
import { Button } from '../../structures/Button.js';
import embed from '../../utils/embed.js';

export default new Button({
    name: "example",
    run: async ({ interaction, values }) => {
        const messageUrl = interaction.message.url;
        await interaction.reply({ embeds: [embed.info(`The message url is ${messageUrl}, button values are ${values?.join(", ")}`)], flags: MessageFlags.Ephemeral });
    }
});
