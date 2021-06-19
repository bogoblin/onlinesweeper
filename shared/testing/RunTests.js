import * as fs from "fs";
import * as path from "path";
import {spawnSync} from "child_process";

const testRegex = /.*\.test\.js$/;

const getTests = (dir) => {
    let tests = [];
    const contents = fs.readdirSync(dir);
    for (let item of contents) {
        const itemPath = path.join(dir, item);
        if (testRegex.test(item)) {
            tests.push(itemPath);
        }
        if (!itemPath.startsWith('node_modules') && fs.lstatSync(itemPath).isDirectory()) {
            tests = tests.concat(getTests(itemPath));
        }
    }
    return tests;
}

for (let test of getTests('.')) {
    console.log(`${test}`);
    spawnSync(`node ${test}`, {stdio: 'inherit', shell: true});
    console.log(``);
}