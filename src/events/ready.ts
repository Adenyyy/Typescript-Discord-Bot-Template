import { Event } from "../structures/Event.js";
import { client } from "../index.js";
import chalk from "chalk";
import { sendErrorMessage, sendInfoMessage } from "../utils/logger.js";
import { ActivityType } from "discord.js";
import { clearInterval } from "timers";

export default new Event("ready", () => {
    sendInfoMessage(`Client logged in as: ${chalk.blueBright.underline(client.user.tag)}`);
    if (client.config.bot_activity.enabled === true) cycleActivities(client, 30000);
    function cycleActivities(client: any, delay: number) {
        let activityIndex = 0;

        if (client.config.bot_activity.activities.length === 0) return sendErrorMessage(`No bot activities were provided in 'settings.yml' (bot_activity.activities)`);
        let status = client.config.bot_activity.status || "online";
        let type = client.config.bot_activity.type || "playing";

        let activityType: ActivityType;
        switch (type) {
            case "watching":
                activityType = ActivityType.Watching;
                break;
            case "playing":
                activityType = ActivityType.Playing;
                break;
            case "competing":
                activityType = ActivityType.Competing;
                break;
            case "listening":
                activityType = ActivityType.Listening;
                break;
            default:
                return sendErrorMessage(`An invalid activity type was provided in 'settings.json' (bot_activity.type)`);
        }

        client.user.setPresence({ activities: [{ name: client.config.bot_activity.activities[0], type: type }], status: status });

        setInterval(() => {
            const activity = client.config.bot_activity.activities[activityIndex];

            client.user.setPresence({ activities: [{ name: activity }] });

            activityIndex = (activityIndex + 1) % client.config.bot_activity.activities.length;
        }, delay);
    }

});
