import { Command } from "../../structures/Command.js";

export default new Command({
    name: "example",
    description: "This is an example command.",
    category: "misc",
    disabled: true,
    run: async ({ interaction, client }) => {
        await interaction.reply({ content: "This is an example command.", ephemeral: true });
    }
});
