import { AnySelectMenuInteraction, CommandInteractionOptionResolver, ComponentType, RoleSelectMenuInteraction } from "discord.js";
import { client } from "../index.js";
import { Event } from "../structures/Event.js";
import { AutoCompleteExtendedInteraction, ExtendedInteraction } from "../typings/Command";
import { sendErrorMessage, sendInfoMessage } from "../utils/logger.js";
import embed from '../utils/embed.js';
import { UserExtendedInteraction } from "../typings/UserCommand";
import { MessageExtendedInteraction } from "../typings/MessageCommand";
import { ButtonExtendedInteraction } from "../typings/Button.js";
import { ModalSubmitExtendedInteraction } from "../typings/Modal.js";

export default new Event("interactionCreate", async (interaction) => {

    // Chat Input Commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return interaction.reply({ embeds: [embed.error("You have used a command that does not exist.")], ephemeral: client.config.messages.ephemeral });

        try {
            command.run({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction as ExtendedInteraction
            });
            sendInfoMessage(`( Chat Input ) - @${interaction.user.tag.split("#")[1] === "0" ? interaction.user.username : interaction.user.tag} ran the command: ${command.name}`);
        } catch (e) {
            sendErrorMessage(`Error while trying to run command: ${command.name}`, e);
        }
    }

    // User Context Menu Commands
    if (interaction.isUserContextMenuCommand()) {
        const command = client.userCommands.get(interaction.commandName);
        if (!command) return interaction.reply({ embeds: [embed.error("You have used a command that does not exist.")], ephemeral: client.config.messages.ephemeral });

        try {
            command.run({
                client,
                interaction: interaction as UserExtendedInteraction
            });
            sendInfoMessage(`( User ) - @${interaction.user.tag.split("#")[1] === "0" ? interaction.user.username : interaction.user.tag} ran the command: ${command.name}`);
        } catch (e) {
            sendErrorMessage(`Error while trying to run command: ${command.name}`, e);
        }
    }

    // User Context Menu Commands
    if (interaction.isMessageContextMenuCommand()) {
        const command = client.messageCommands.get(interaction.commandName);
        if (!command)
            return interaction.reply({ embeds: [embed.error("You have used a command that does not exist.")], ephemeral: client.config.messages.ephemeral });

        try {
            command.run({
                client,
                interaction: interaction as MessageExtendedInteraction
            });
            sendInfoMessage(`( Message ) - @${interaction.user.tag.split("#")[1] === "0" ? interaction.user.username : interaction.user.tag} ran the command: ${command.name}`);
        } catch (e) {
            sendErrorMessage(`Error while trying to run command: ${command.name}`, e);
        }
    }

    // Select Menus
    if (interaction.isAnySelectMenu()) {

        const selectMenu = client.selectMenus.get(interaction.customId);
        if (!selectMenu)
            return interaction.reply({ embeds: [embed.error("You have used a select menu that does not exist.")], ephemeral: client.config.messages.ephemeral });

        try {
            selectMenu.run({
                client,
                interaction: interaction as AnySelectMenuInteraction
            });
            sendInfoMessage(`@${interaction.user.tag.split("#")[1] === "0" ? interaction.user.username : interaction.user.tag} used the select menu: ${selectMenu.name}`);
        } catch (e) {

            sendErrorMessage(`Error while trying to run select menu: ${selectMenu.name}`, e);
        }
    }


    // Button Click
    if (interaction.isButton()) {
        const customId = interaction.customId;
        if (customId.split("/").length > 1) {
            let args = customId.split("/");
            const button = client.buttons.get(args[0]);
            const values: Array<string> = args.slice(1);
            if (!button)
                return interaction.reply({ embeds: [embed.error("You have clicked a button that does not exist.")], ephemeral: client.config.messages.ephemeral });
            try {
                button.run({
                    client,
                    interaction: interaction as ButtonExtendedInteraction,
                    values,
                });
                sendInfoMessage(`@${interaction.user.tag.split("#")[1] === "0" ? interaction.user.username : interaction.user.tag} clicked the button: ${button.name} [Values: ${values.join(", ")}]`);
            } catch (e) {
                sendErrorMessage(`Error while trying to run button: ${button.name}`, e);
            }
        } else {
            const button = client.buttons.get(interaction.customId);
            if (!button)
                return interaction.reply({ embeds: [embed.error("You have clicked a button that does not exist.")], ephemeral: client.config.messages.ephemeral });

            try {
                button.run({
                    client,
                    interaction: interaction as ButtonExtendedInteraction
                });
                sendInfoMessage(`@${interaction.user.tag.split("#")[1] === "0" ? interaction.user.username : interaction.user.tag} clicked the button: ${button.name}`);
            } catch (e) {
                sendErrorMessage(`Error while trying to run button: ${button.name}`, e);
            }
        }
    }

    // Modal Submits
    if (interaction.isModalSubmit()) {
        const modal = client.modals.get(interaction.customId);
        if (!modal)
            return interaction.reply({ embeds: [embed.error("You have used a modal that does not exist.")], ephemeral: client.config.messages.ephemeral });

        try {
            modal.run({
                client,
                interaction: interaction as ModalSubmitExtendedInteraction
            });
            sendInfoMessage(`@${interaction.user.tag.split("#")[1] === "0" ? interaction.user.username : interaction.user.tag} submitted the modal: ${modal.name}`);
        } catch (e) {

            sendErrorMessage(`Error while trying to submit the modal: ${modal.name}`, e);
        }
    }

    // Auto Completion
    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            sendErrorMessage(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.autocomplete({
                args: interaction.options as CommandInteractionOptionResolver,
                client,
                interaction: interaction as AutoCompleteExtendedInteraction
            });
        } catch (error) {
            console.error(error);
        }
    }
});
