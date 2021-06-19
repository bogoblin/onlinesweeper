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
            console.log('found test '+itemPath)
            tests.push(itemPath);
        }
        if (!itemPath.startsWith('node_modules') && fs.lstatSync(itemPath).isDirectory()) {
            // console.log('found dir')
            const testsInDir = getTests(itemPath);
            tests = tests.concat(getTests(itemPath));
        }
    }
    return tests;
}

for (let test of getTests('.')) {
    spawnSync(`node ${test}`, {stdio: 'inherit', shell: true});
}