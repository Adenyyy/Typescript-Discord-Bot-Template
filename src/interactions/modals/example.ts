import { ModalSubmit } from "../../structures/Modal.js";
import embed from "../../utils/embed.js";

export default new ModalSubmit({
    name: "example",
    run: async ({ interaction }) => {
        await interaction.reply({ embeds: [embed.info(`Modals work!`)] });
    }
});
