import { MessageCommandType } from "../typings/MessageCommand";

export class MessageCommand {
    constructor(commandOptions: MessageCommandType) {
        Object.assign(this, commandOptions);
    }
}
