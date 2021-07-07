import * as fs from 'fs';
import {EOL} from 'os';

const LogFile = './log';

class EventSource {
    constructor() {
        this.eventQueue = [];
        this.logQueue = [];

        this.appendingLogs = false;

        fs.writeFileSync(LogFile, ''); // Clears the log file
    }

    log(event) {
        console.log(event);

        this.logQueue.push(event);
        if (!this.appendingLogs) {
            this.appendingLogs = true;
            // Write all events in the log queue, separated by end of line.
            // EOL at the end because array.join doesn't add that.
            const toWrite = this.logQueue.map(e => JSON.stringify(e)).join(EOL)+EOL;
            // Clear the log queue so that events don't get written twice
            this.logQueue = [];
            fs.appendFile(LogFile, toWrite, err => {
                if (err) {
                    throw "Can't append events to file";
                }
                // Allow more logs to be written
                this.appendingLogs = false;
            })
        }
    }

    queue(event) {
        this.eventQueue.push(event);
    }

    read() {
        return this.eventQueue.shift();
    }
}

export const event = new EventSource();