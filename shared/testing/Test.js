let tests = [];

export const test = (description, action) => {
    tests.push(action);
}

export const equals = (expected, actual) => {
    if (expected === actual) {
        return true;
    }
    if (typeof expected !== typeof actual) {
        throw new Error(`Types don't match. Expected ${typeof expected}, got ${typeof actual}`);
    }
    if (typeof expected !== "object") {
        throw new Error(`${expected} =/= ${actual}`);
    }
    for (let key in expected) {
        if (expected.hasOwnProperty(key)) {
            try {
                equals(expected[key], actual[key]);
            } catch (e) {
                throw new Error(`Key [${key}] doesn't match. ${e.toString()}`);
            }
        }
    }
    return true;
}

export const run = () => {
    // run all tests
    const numberOfTests = tests.length;
    console.log(`Running ${numberOfTests} tests.`);
    for (let i=0; i<numberOfTests; i++) {
        console.log(`Test ${i+1} of ${numberOfTests}:`);
        const t = tests[i];
        try {
            t();
        } catch (e) {
            console.log(`Test failed: ${e.toString()}`);
            continue;
        }
        console.log(`Passed`);
    }
}