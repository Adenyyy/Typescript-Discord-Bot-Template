import { AnySelectMenu } from '../../../structures/SelectMenu.js';
import embed from '../../../utils/embed.js';

export default new AnySelectMenu({
    name: "example",
    run: async ({ interaction }) => {
        await interaction.reply({ embeds: [embed.info(`You selected ${interaction.values?.join(", ")} in the select menu.`)] });
    }
});
