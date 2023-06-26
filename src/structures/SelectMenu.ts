import { AnySelectMenuType } from "../typings/SelectMenu";

export class AnySelectMenu {
    constructor(commandOptions: AnySelectMenuType) {
        Object.assign(this, commandOptions);
    }
}