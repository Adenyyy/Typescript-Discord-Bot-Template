import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection } from "discord.js";
import { CommandType } from "../typings/Command";
import { glob } from "glob";
import { RegisterCommandsOptions } from "../typings/client";
import { Event } from "./Event";
import { getBorderCharacters, table } from 'table';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { sendErrorMessage, sendHandlerMessage, sendSuccessMessage, sendWarningMessage } from "../utils/logger.js";
import { UserCommandType } from "../typings/UserCommand";
import { MessageCommandType } from "../typings/MessageCommand";
import { ButtonType } from "../typings/Button";
import errorHandler from "../utils/errorHandler.js";
import { AnySelectMenuType } from "../typings/SelectMenu";
import { ModalSubmitType } from "../typings/Modal";
import utils from "../utils/utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let config: any = await utils.loadYaml(path.join(__dirname, "..", "config", "settings.yml"));

export class ExtendedClient extends Client {
    public commands: Collection<string, CommandType> = new Collection();
    public userCommands: Collection<string, UserCommandType> = new Collection();
    public messageCommands: Collection<string, MessageCommandType> = new Collection();
    public selectMenus: Collection<string, AnySelectMenuType> = new Collection();
    public buttons: Collection<string, ButtonType> = new Collection();
    public modals: Collection<string, ModalSubmitType> = new Collection();
    public events: Collection<string, any> = new Collection();
    public config: typeof config = config;

    constructor() {
        super({ intents: 32767 });
    }

    start() {
        this.registerModules().then(() => {
            sendHandlerMessage(`Loaded ${chalk.magentaBright.underline(this.commands.size)} commands`);
            sendHandlerMessage(`Loaded ${chalk.magentaBright.underline(this.userCommands.size)} user context menu commands`);
            sendHandlerMessage(`Loaded ${chalk.magentaBright.underline(this.messageCommands.size)} message context menu commands`);
            sendHandlerMessage(`Loaded ${chalk.magentaBright.underline(this.selectMenus.size)} select menus`);
            sendHandlerMessage(`Loaded ${chalk.magentaBright.underline(this.buttons.size)} buttons`);
            sendHandlerMessage(`Loaded ${chalk.magentaBright.underline(this.modals.size)} modals`);
            sendHandlerMessage(`Loaded ${chalk.magentaBright.underline(this.events.size)} events`);
        });
        errorHandler();
        this.login(config.bot_settings.token).catch(async () => {
            return sendErrorMessage(`An invalid bot token was provided in 'settings.json' (bot.token)`);
        });
    }
    async importFile(filePath: string) {
        const file: any = await import(pathToFileURL(filePath).toString());
        return file?.default;
    }

    async registerCommands({ commands, guildId, guildName }: RegisterCommandsOptions) {
        if (!this.config.bot_settings.register_commands) return sendWarningMessage("Registering commands is disabled in 'settings.json'");
        if (guildId) {
            try {
                await this.guilds.cache.get(guildId)?.commands.set(commands);
            } catch {
                sendErrorMessage(`Could not register commands to guild: ${chalk.whiteBright.underline(guildName)}`);
            } finally {
                sendSuccessMessage(`Successfully registered ${chalk.greenBright.underline(commands.length)} commands to guild: ${chalk.greenBright.underline(guildName)}`);
            }
        } else {
            try {
                await this.application.commands.set(commands);
            } catch {
                sendErrorMessage(`Could not register commands globally`);
            } finally {
                sendSuccessMessage(`Registered commands globally`);
            }
        }
    }

    async registerModules() {
        const commandTableConfig: any = {
            border: getBorderCharacters("honeywell"),
            columnDefault: {
                width: 16
            },
            columns: [
                { alignment: 'center' },
                { alignment: 'center' },
                { alignment: 'center' },
                { alignment: 'center' },
            ],
            header: {
                alignment: 'center',
                content: chalk.blueBright.bold('Loading Commands'),
            },
        };

        // Load Commands
        let commandTableData: any[] = [[chalk.blueBright("Guild"), chalk.blueBright("Type"), chalk.blueBright("Command"), chalk.blueBright("Status")]];
        let guilds: any[] = [];
        // let globalCommands: ApplicationCommandDataResolvable[] = [];
        const commandFiles = await glob(`./interactions/commands/**/**/*.{ts,js}`, { ignore: ['node_modules/**', '**/node_modules/**'], cwd: path.join(__dirname, "../"), absolute: true, nodir: true }) as string[];
        const userCommandFiles = await glob(`./interactions/contextMenuCommands/user/**/*.{ts,js}`, { ignore: ['node_modules/**', '**/node_modules/**'], cwd: path.join(__dirname, "../"), absolute: true, nodir: true }) as string[];
        const messageCommandFiles = await glob(`./interactions/contextMenuCommands/message/**/*.{ts,js}`, { ignore: ['node_modules/**', '**/node_modules/**'], cwd: path.join(__dirname, "../"), absolute: true, nodir: true }) as string[];
        if (this.config.bot_settings.guilds.length !== 0) {
            for (const guild of this.config.bot_settings.guilds) {
                let commands: ApplicationCommandDataResolvable[] = [];
                for (const filePath of commandFiles) {
                    const command: CommandType = await this.importFile(filePath);
                    if (!command.name) continue;
                    if (command.disabled) { commandTableData.push([chalk.whiteBright(guild.name), chalk.whiteBright("Chat Input"), chalk.whiteBright(command.name), chalk.whiteBright.bgRedBright("disabled")]); continue; }
                    if (command.guilds?.includes(guild.name) || !command.guilds || command.guilds?.length === 0) {
                        try {
                            commandTableData.push([chalk.whiteBright(guild.name), chalk.whiteBright("Chat Input"), chalk.whiteBright(command.name), chalk.whiteBright.bgGreenBright("enabled")]);
                            this.commands.set(command.name, command);
                            commands.push(command);
                        } catch {
                            commandTableData.push([chalk.whiteBright(guild.name), chalk.whiteBright("Chat Input"), chalk.whiteBright(command.name), chalk.whiteBright.bgYellowBright("error")]);
                        }
                    }
                }
                // User Context Menu Commands
                for (const filePath of userCommandFiles) {
                    const userCommand: UserCommandType = await this.importFile(filePath);
                    if (!userCommand.name) continue;
                    if (userCommand.disabled) { commandTableData.push([chalk.whiteBright("User"), chalk.whiteBright(guild.name), chalk.whiteBright(userCommand.name), chalk.whiteBright.bgRedBright("disabled")]); continue; }
                    if (userCommand.guilds?.includes(guild.name) || !userCommand.guilds || userCommand.guilds?.length === 0) {
                        try {
                            commandTableData.push([chalk.whiteBright(guild.name), chalk.whiteBright("User"), chalk.whiteBright(userCommand.name), chalk.whiteBright.bgGreenBright("enabled")]);
                            this.userCommands.set(userCommand.name, userCommand);
                            commands.push(userCommand);
                        } catch {
                            commandTableData.push([chalk.whiteBright(guild.name), chalk.whiteBright("User"), chalk.whiteBright(userCommand.name), chalk.whiteBright.bgYellowBright("error")]);
                        }
                    }
                }

                // User Context Menu Commands
                for (const filePath of messageCommandFiles) {
                    const messageCommand: MessageCommandType = await this.importFile(filePath);
                    if (!messageCommand.name) continue;
                    if (messageCommand.disabled) { commandTableData.push([chalk.whiteBright("Message"), chalk.whiteBright(guild.name), chalk.whiteBright(messageCommand.name), chalk.whiteBright.bgRedBright("disabled")]); continue; }
                    if (messageCommand.guilds?.includes(guild.name) || !messageCommand.guilds || messageCommand.guilds?.length === 0) {
                        try {
                            commandTableData.push([chalk.whiteBright(guild.name), chalk.whiteBright("Message"), chalk.whiteBright(messageCommand.name), chalk.whiteBright.bgGreenBright("enabled")]);
                            this.messageCommands.set(messageCommand.name, messageCommand);
                            commands.push(messageCommand);
                        } catch {
                            commandTableData.push([chalk.whiteBright(guild.name), chalk.whiteBright("Message"), chalk.whiteBright(messageCommand.name), chalk.whiteBright.bgYellowBright("error")]);
                        }
                    }
                }
                guilds.push({ name: guild.name, id: guild.id, commands: commands });
            }
            if (this.config.debug) console.log(table(commandTableData, commandTableConfig));
        } else {
            sendErrorMessage("No guilds were found in 'settings.json' (bot_settings.guilds)");
        }


        this.on("ready", () => {
            for (const guild of guilds) {
                this.registerCommands({
                    guildName: guild.name,
                    guildId: guild.id,
                    commands: guild.commands
                }).catch(e => console.log(e));
            }
        });


        // Load Select Menus
        const selectMenusTableConfig: any = {
            border: getBorderCharacters("honeywell"),
            columnDefault: {
                width: 20
            },
            columns: [
                { alignment: 'center' },
                { alignment: 'center' },
            ],
            header: {
                alignment: 'center',
                content: chalk.blueBright.bold('Loading Select Menus'),
            },
        };

        let selectMenusTableData: any[] = [[chalk.blueBright("Select Menu"), chalk.blueBright("Status")]];
        const selectMenuFiles = await glob(`../interactions/selectMenus/**/*.{ts,js}`, { ignore: ['node_modules/**', '**/node_modules/**'], cwd: __dirname, absolute: true, nodir: true }) as string[];
        for (const filePath of selectMenuFiles) {
            const selectMenu: any = await this.importFile(
                filePath
            );
            try {
                if (selectMenu.disabled) { selectMenusTableData.push([chalk.whiteBright(selectMenu.name), chalk.whiteBright.bgRedBright("disabled")]); continue; }
                selectMenusTableData.push([chalk.whiteBright(selectMenu.name), chalk.whiteBright.bgGreenBright("enabled")]);
                this.selectMenus.set(selectMenu.name, selectMenu);
            } catch {
                selectMenusTableData.push([chalk.whiteBright(selectMenu.name), chalk.whiteBright.bgYellowBright("error")]);
            }
        }
        if (this.config.debug) console.log(table(selectMenusTableData, selectMenusTableConfig));


        // Load Buttons
        const buttonTableConfig: any = {
            border: getBorderCharacters("honeywell"),
            columnDefault: {
                width: 20
            },
            columns: [
                { alignment: 'center' },
                { alignment: 'center' },
            ],
            header: {
                alignment: 'center',
                content: chalk.blueBright.bold('Loading Buttons'),
            },
        };

        let buttonTableData: any[] = [[chalk.blueBright("Button"), chalk.blueBright("Status")]];
        const buttonFiles = await glob(`../interactions/buttons/**/*.{ts,js}`, { ignore: ['node_modules/**', '**/node_modules/**'], cwd: __dirname, absolute: true, nodir: true }) as string[];
        for (const filePath of buttonFiles) {
            const button: ButtonType = await this.importFile(
                filePath
            );
            try {
                if (button.disabled) { buttonTableData.push([chalk.whiteBright(button.name), chalk.whiteBright.bgRedBright("disabled")]); continue; }
                buttonTableData.push([chalk.whiteBright(button.name), chalk.whiteBright.bgGreenBright("enabled")]);
                this.buttons.set(button.name, button);
            } catch {
                buttonTableData.push([chalk.whiteBright(button.name), chalk.whiteBright.bgYellowBright("error")]);
            }
        }
        if (this.config.debug) console.log(table(buttonTableData, buttonTableConfig));

        // Load Modals
        const modalTableConfig: any = {
            border: getBorderCharacters("honeywell"),
            columnDefault: {
                width: 20
            },
            columns: [
                { alignment: 'center' },
                { alignment: 'center' },
            ],
            header: {
                alignment: 'center',
                content: chalk.blueBright.bold('Loading Modals'),
            },
        };

        let modalTableData: any[] = [[chalk.blueBright("Modal"), chalk.blueBright("Status")]];
        const modalFiles = await glob(`../interactions/modals/**/*.{ts,js}`, { ignore: ['node_modules/**', '**/node_modules/**'], cwd: __dirname, absolute: true, nodir: true }) as string[];
        for (const filePath of modalFiles) {
            const modalSubmit: ModalSubmitType = await this.importFile(
                filePath
            );
            try {
                if (modalSubmit.disabled) { modalTableData.push([chalk.whiteBright(modalSubmit.name), chalk.whiteBright.bgRedBright("disabled")]); continue; }
                modalTableData.push([chalk.whiteBright(modalSubmit.name), chalk.whiteBright.bgGreenBright("enabled")]);
                this.modals.set(modalSubmit.name, modalSubmit);
            } catch {
                modalTableData.push([chalk.whiteBright(modalSubmit.name), chalk.whiteBright.bgYellowBright("error")]);
            }
        }
        if (this.config.debug) console.log(table(modalTableData, modalTableConfig));

        // Load Events
        const eventTableConfig: any = {
            border: getBorderCharacters("honeywell"),
            columnDefault: {
                width: 20
            },
            columns: [
                { alignment: 'center' },
                { alignment: 'center' },
            ],
            header: {
                alignment: 'center',
                content: chalk.blueBright.bold('Loading Events'),
            },
        };

        let eventTableData: any[] = [[chalk.blueBright("Event"), chalk.blueBright("Status")]];

        const eventFiles = await glob(`../events/**/*.{ts,js}`, { ignore: ['node_modules/**', '**/node_modules/**'], cwd: __dirname, absolute: true, nodir: true }) as string[];
        for (const filePath of eventFiles) {
            const event: Event<keyof ClientEvents> = await this.importFile(
                filePath
            );
            try {
                eventTableData.push([chalk.whiteBright(event.event), chalk.whiteBright.bgGreenBright("enabled")]);
                this.events.set(event.event, event);
                this.on(event.event, event.run);
            } catch {
                eventTableData.push([chalk.whiteBright(event.event), chalk.whiteBright.bgYellowBright("error")]);
            }

        }
        if (this.config.debug) console.log(table(eventTableData, eventTableConfig));

    }
}