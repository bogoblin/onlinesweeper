import {MineSocket} from './MineSocket.js';
import {App} from "./components/MineApp.js";
import * as React from "react";
import ReactDOM from "react-dom";
import './style.css';

const root = document.createElement('div');

const mineSocket = new MineSocket(`ws://${location.hostname}:8081`);

document.body.append(root);
ReactDOM.render(<App mineSocket={mineSocket}/>, root);