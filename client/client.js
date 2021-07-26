import {MineSocket} from './MineSocket.js';
import {App} from "./components/MineApp.js";
import * as React from "react";
import ReactDOM from "react-dom";
import './style.css';

const root = document.createElement('div');

const socketUrl = location.href.replace('http', 'ws');
const mineSocket = new MineSocket(socketUrl);

document.body.append(root);
ReactDOM.render(<App mineSocket={mineSocket}/>, root);