import * as fs from 'fs';
import {EOL} from 'os';
import dateformat from 'dateformat';
import ReadLines from 'n-readlines';

const logDir = './logs';

class EventSource {
    constructor() {
        const logFiles = fs.readdirSync(logDir).sort((a, b) => b.localeCompare(a));
        if (logFiles.length > 0) {
            const latestLogFile = logDir + '/' + logFiles[0];
            this.reader = new EventReader(latestLogFile);
        }

        this.writer = new EventWriter(`${logDir}/log_${dateformat(new Date(), "yyyymmdd-HHMMss")}`);
    }

    log(event) {
        console.log(event);
        this.writer.write(event);
    }

    read() {
        if (!this.reader) {
            return null;
        }
        return this.reader.read();
    }

    next() {
        if (!this.reader) {
            return null;
        }
        return this.reader.next();
    }
}

class EventReader {
    constructor(fileName) {
        this.nextEvent = null;
        this.reader = new ReadLines(fileName);
        console.log(`EventReader: loaded ${fileName}`);
    }

    read() {
        if (this.nextEvent) {
            const toReturn = this.nextEvent;
            this.nextEvent = null;
            return toReturn;
        }
        if (!this.reader) {
            return null;
        }
        const newEvent = this.reader.next();
        if (!newEvent) {
            return null;
        }
        try {
            return JSON.parse(newEvent);
        } catch (e) {
            this.reader.close();
            // todo: throw an exception or something
        }
    }

    next() {
        if (!this.nextEvent) {
            this.nextEvent = this.read();
        }
        return this.nextEvent;
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