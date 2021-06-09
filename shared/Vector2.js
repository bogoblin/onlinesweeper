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
