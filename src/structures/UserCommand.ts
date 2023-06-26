import { UserCommandType } from "../typings/UserCommand";

export class UserCommand {
    constructor(commandOptions: UserCommandType) {
        Object.assign(this, commandOptions);
    }
}
