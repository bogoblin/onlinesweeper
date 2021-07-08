import * as fs from 'fs';
import {EOL} from 'os';

class EventSource {
    constructor() {
        this.eventQueue = [];
        this.writer = new EventWriter('./log');
    }

    log(event) {
        console.log(event);
        this.writer.write(event);
    }

    queue(event) {
        this.eventQueue.push(event);
    }

    read() {
        return this.eventQueue.shift();
    }
}

class EventWriter {
    constructor(fileName) {
        this.fileName = fileName;
        fs.writeFileSync(this.fileName, ''); // Clears the log file

        this.writeQueue = [];
        this.appending = false;
    }

    write(event) {
        this.writeQueue.push(event);
        this.flush();
    }

    flush() {
        if (this.writeQueue.length === 0 || this.appending) {
            return;
        }

        this.appending = true;
        // Write all events in the queue, separated by end of line.
        // EOL at the end because array.join doesn't add that.
        const toWrite = this.writeQueue.map(e => JSON.stringify(e)).join(EOL)+EOL;
        // Clear the log queue so that events don't get written twice.
        this.writeQueue = [];
        fs.appendFile(this.fileName, toWrite, err => {
            if (err) {
                throw "Can't append events to file";
            }
            // Allow more logs to be written
            this.appending = false;

            this.flush(); // Flush again, in case there are any events left in the queue
        });
    }
}

export const event = new EventSource();