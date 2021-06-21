export class Player {
    username;
    socket;
    hashedPassword;
    position;

    constructor(username, hashedPassword) {
        this.username = username;
        this.hashedPassword = hashedPassword;
        this.position = [0,0];
    }

    connect(socket) {
        this.socket = socket;
        socket.player = this;
    }

    move(newPosition) {
        this.position = newPosition;
    }

    send(serializable) {
        this.socket.send(serializable.publicSerialize());
    }
}