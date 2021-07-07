class EventSource {
    constructor() {
        this.eventQueue = [];
    }

    log(event) {
        console.log(event);
    }

    queue(event) {
        this.eventQueue.push(event);
    }

    read() {
        return this.eventQueue.shift();
    }
}

export const event = new EventSource();