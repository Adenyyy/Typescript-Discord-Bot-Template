import { sendErrorMessage } from "./logger.js";

import yaml from 'js-yaml';
import fs from 'fs';

const utils = {

  async loadYaml(filePath: string) {
    try {
      const doc = await yaml.load(fs.readFileSync(filePath, 'utf8'));
      return doc;
    } catch (e) {
      sendErrorMessage(`Error while trying to load yaml file: ${filePath}`, e);
    }
  }

};

export default utils;