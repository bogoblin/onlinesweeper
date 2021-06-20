export const vectorSub = (v1, v2) => {
    let v = [];
    for (let i=0; i<v1.length; i++) {
        v[i] = v1[i] - v2[i];
    }
    return v;
}

export const vectorAdd = (v1, v2) => {
    let v = [];
    for (let i=0; i<v1.length; i++) {
        v[i] = v1[i] + v2[i];
    }
    return v;
}

export const vectorTimesScalar = (v1, s) => {
    let v = [];
    for (let i=0; i<v1.length; i++)
    {
        v[i] = v1[i] * s;
    }
    return v;
}

export const vectorMagnitudeSquared = (v1) => {
    let result = 0;
    for (let i=0; i<v1.length; i++)
    {
        result += v1[i]*v1[i];
    }
    return result;
}

export const forEachInRect = ([topLeft, bottomRight], action, step=1) => {
    for (let x = topLeft[0]; x < bottomRight[0]; x+=step) {
        for (let y = topLeft[1]; y < bottomRight[1]; y+=step) {
            action([x, y]);
        }
    }
}

export const forEachNeighbour = (v, action, step=1) => {
    // because forEachInRect is exclusive for the bottom and right coords, we have to add 1
    forEachInRect([vectorAdd(v, [-step,-step]), vectorAdd(v, [step+1,step+1])], action);
}