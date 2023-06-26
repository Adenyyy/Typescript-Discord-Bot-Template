import { ModalSubmitType } from "../typings/Modal";

export class ModalSubmit {
    constructor(commandOptions: ModalSubmitType) {
        Object.assign(this, commandOptions);
    }
}
