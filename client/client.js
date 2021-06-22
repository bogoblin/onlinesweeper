import {MineSocket} from './MineSocket.js';
import {App} from "./components/MineApp.js";
import * as React from "react";
import ReactDOM from "react-dom";

const mineSocket = new MineSocket("ws://localhost:8081");
// .connect()
//     .then((minesocket) => {
//         minesocket.sendloginmessage('bobby', '1234');
//         // document.body.append(minesocket.tileview.canvas);
//     })
//     .catch((err) => {
//         console.log(err);
//     });

const root = document.createElement('div');
document.body.append(root);
ReactDOM.render(<App mineSocket={mineSocket}/>, root);