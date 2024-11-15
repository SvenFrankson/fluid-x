function MakeQuad(i0: number, i1: number, i2: number, i3: number, indices: number[], positions?: number[], flatShadingPositions?: number[]): void {
    if (positions && flatShadingPositions) {
        let l = flatShadingPositions.length / 3;
        let x0 = positions[3 * i0];
        let y0 = positions[3 * i0 + 1];
        let z0 = positions[3 * i0 + 2];
        let x1 = positions[3 * i1];
        let y1 = positions[3 * i1 + 1];
        let z1 = positions[3 * i1 + 2];
        let x2 = positions[3 * i2];
        let y2 = positions[3 * i2 + 1];
        let z2 = positions[3 * i2 + 2];
        let x3 = positions[3 * i3];
        let y3 = positions[3 * i3 + 1];
        let z3 = positions[3 * i3 + 2];

        flatShadingPositions.push(x0, y0, z0, x1, y1, z1, x2, y2, z2, x3, y3, z3);

        indices.push(l, l + 1, l + 2);
        indices.push(l, l + 2, l + 3);
    }
    else {
        indices.push(i0, i1, i2);
        indices.push(i0, i2, i3);
    }
}

function CreatePlaqueVertexData(w: number, h: number, m: number): BABYLON.VertexData {
    let plaqueData = new BABYLON.VertexData();
    let positions = [];
    let indices = [];
    let uvs = [];
    let xs = [0, m, w - m, w];
    let zs = [0, m, h - m, h];
    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 4; i++) {
            let l = positions.length / 3;
            let y = 0;
            if (i > 0 && i < 3 && j > 0 && j < 3) {
                y = m;
            }
            positions.push(xs[i], y, zs[j]);
            if (i < 3 && j < 3) {
                if (i === 0 && j === 2 || i === 2 && j === 0) {
                    indices.push(l, l + 1, l + 4);
                    indices.push(l + 4, l + 1, l + 1 + 4);
                }
                else {
                    indices.push(l, l + 1, l + 1 + 4);
                    indices.push(l, l + 1 + 4, l + 4);
                }
            }
            uvs.push(xs[i] / w, zs[j] / h);
        }
    }
    plaqueData.positions = positions;
    plaqueData.indices = indices;
    plaqueData.uvs = uvs;
    let normals = [];
    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    plaqueData.normals = normals;
    Mummu.TranslateVertexDataInPlace(plaqueData, new BABYLON.Vector3(- w * 0.5, 0, - h * 0.5));
    return plaqueData;
}

interface IBoxFrameVertexDataProps {
    w?: number,
    wBase?: number,
    wTop?: number,
    h?: number,
    d?: number,
    dBase?: number,
    dTop?: number,
    thickness?: number,
    innerHeight?: number,
    topCap?: boolean,
    topCapColor?: BABYLON.Color4,
    bottomCap?: boolean,
    flatShading?: boolean
}
function CreateBoxFrameVertexData(
    props: IBoxFrameVertexDataProps
) {
    if (!isFinite(props.w)) {
        props.w = 1;
    }
    if (!isFinite(props.wBase)) {
        props.wBase = props.w;
    }
    if (!isFinite(props.wTop)) {
        props.wTop = props.w;
    }
    if (!isFinite(props.h)) {
        props.h = props.w;
    }
    if (!isFinite(props.d)) {
        props.d = 1;
    }
    if (!isFinite(props.dBase)) {
        props.dBase = props.d;
    }
    if (!isFinite(props.dTop)) {
        props.dTop = props.d;
    }
    if (!isFinite(props.thickness)) {
        props.thickness = props.w * 0.1;
    }
    if (!isFinite(props.innerHeight)) {
        props.innerHeight = props.h * 0.25;
    }

    let w2 = props.w / 2;
    let wBase2 = props.wBase / 2;
    let wTop2 = props.wTop / 2;
    let d2 = props.d / 2;
    let dBase2 = props.dBase / 2;
    let dTop2 = props.dTop / 2;
    let h = props.h;
    let t = props.thickness;
    let hh = props.innerHeight;

    let positions = [
        - wBase2, 0, - dBase2,
        wBase2, 0, - dBase2,
        wBase2, 0, dBase2,
        - wBase2, 0, dBase2,
        
        - w2, h, - d2,
        w2, h, - d2,
        w2, h, d2,
        - w2, h, d2,
        
        - w2 + t, h, - d2 + t,
        w2 - t, h, - d2 + t,
        w2 - t, h, d2 - t,
        - w2 + t, h, d2 - t,
        
        - wTop2 + t, h - hh, - dTop2 + t,
        wTop2 - t, h - hh, - dTop2 + t,
        wTop2 - t, h - hh, dTop2 - t,
        - wTop2 + t, h - hh, dTop2 - t
    ];
    
    let normalVec3s: BABYLON.Vector3[] = [];
    let n0 = new BABYLON.Vector3(-1, props.bottomCap ? -1 : 0, -1);
    let n4 = new BABYLON.Vector3(-1, 1, -1);
    let n8 = new BABYLON.Vector3(1, 1, 1);
    let n12 = new BABYLON.Vector3(1, props.topCap ? 1 : 0, 1);
    
    normalVec3s.push(n0);
    normalVec3s.push(Mummu.Rotate(n0, BABYLON.Axis.Y, -Math.PI * 0.5 * 1));
    normalVec3s.push(Mummu.Rotate(n0, BABYLON.Axis.Y, -Math.PI * 0.5 * 2));
    normalVec3s.push(Mummu.Rotate(n0, BABYLON.Axis.Y, -Math.PI * 0.5 * 3));
    
    normalVec3s.push(n4);
    normalVec3s.push(Mummu.Rotate(n4, BABYLON.Axis.Y, -Math.PI * 0.5 * 1));
    normalVec3s.push(Mummu.Rotate(n4, BABYLON.Axis.Y, -Math.PI * 0.5 * 2));
    normalVec3s.push(Mummu.Rotate(n4, BABYLON.Axis.Y, -Math.PI * 0.5 * 3));
    
    normalVec3s.push(n8);
    normalVec3s.push(Mummu.Rotate(n8, BABYLON.Axis.Y, -Math.PI * 0.5 * 1));
    normalVec3s.push(Mummu.Rotate(n8, BABYLON.Axis.Y, -Math.PI * 0.5 * 2));
    normalVec3s.push(Mummu.Rotate(n8, BABYLON.Axis.Y, -Math.PI * 0.5 * 3));
    
    normalVec3s.push(n12);
    normalVec3s.push(Mummu.Rotate(n12, BABYLON.Axis.Y, -Math.PI * 0.5 * 1));
    normalVec3s.push(Mummu.Rotate(n12, BABYLON.Axis.Y, -Math.PI * 0.5 * 2));
    normalVec3s.push(Mummu.Rotate(n12, BABYLON.Axis.Y, -Math.PI * 0.5 * 3));

    let normals = [];
    for (let i = 0; i < normalVec3s.length; i++) {
        normalVec3s[i].normalize();
        normals.push(normalVec3s[i].x, normalVec3s[i].y, normalVec3s[i].z);
    }

    let basePositions: number[] = undefined;
    if (props.flatShading) {
        basePositions = [...positions];
        positions = [];
    }

    let indices = [];

    MakeQuad(0, 1, 5, 4, indices, basePositions, positions);
    MakeQuad(1, 2, 6, 5, indices, basePositions, positions);
    MakeQuad(2, 3, 7, 6, indices, basePositions, positions);
    MakeQuad(3, 0, 4, 7, indices, basePositions, positions);

    MakeQuad(4, 5, 9, 8, indices, basePositions, positions);
    MakeQuad(5, 6, 10, 9, indices, basePositions, positions);
    MakeQuad(6, 7, 11, 10, indices, basePositions, positions);
    MakeQuad(7, 4, 8, 11, indices, basePositions, positions);

    MakeQuad(8, 9, 13, 12, indices, basePositions, positions);
    MakeQuad(9, 10, 14, 13, indices, basePositions, positions);
    MakeQuad(10, 11, 15, 14, indices, basePositions, positions);
    MakeQuad(11, 8, 12, 15, indices, basePositions, positions);

    if (props.bottomCap) {
        MakeQuad(0, 3, 2, 1, indices, basePositions, positions);
    }
    if (props.topCap) {
        MakeQuad(12, 13, 14, 15, indices, basePositions, positions);
    }

    if (props.flatShading) {
        normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    }

    let colors: number[] = [];
    for (let i = 0; i < positions.length / 3; i++) {
        let y = positions[3 * i + 1];
        if (props.topCapColor && y === props.h - props.innerHeight) {
            colors.push(...props.topCapColor.asArray());
        }
        else {
            colors.push(1, 1, 1, 1);
        }
    }

    let vertexData = new BABYLON.VertexData();
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.colors = colors;

    return vertexData;
}

interface ITrailProps {
    path: BABYLON.Vector3[],
    up?: BABYLON.Vector3,
    color?: BABYLON.Color4,
    colors?: BABYLON.Color4[],
    radius?: number,
    radiusFunc?: (f: number) => number
}

function CreateTrailVertexData(props: ITrailProps): BABYLON.VertexData {
    let data = new BABYLON.VertexData();
    let positions: number[] = [];
    let normals = [];
    let indices: number[] = [];
    let uvs: number[] = [];
    let colors = [];

    let path = [...props.path];
    let up: BABYLON.Vector3 = BABYLON.Vector3.Up();
    if (props.up) {
        up.copyFrom(props.up);
    }
    let n = path.length;
    let directions = [];

    let prev = path[0];
    let next = path[1];
    directions[0] = next.subtract(prev).normalize();

    for (let i = 1; i < n - 1; i++) {
        let prev = path[i - 1];
        let next = path[i + 1];
        directions[i] = next.subtract(prev).normalize();
    }
    
    prev = path[n - 2];
    next = path[n - 1];
    directions[n - 1] = next.subtract(prev).normalize();

    let cumulLength = 0;
    for (let i = 0; i < n; i++) {
        let p = path[i];
        if (i > 0) {
            cumulLength += BABYLON.Vector3.Distance(p, path[i - 1]);
        }
        let dir = directions[i];
        let xDir = BABYLON.Vector3.Cross(up, dir).normalize();
        let normal = BABYLON.Vector3.Cross(dir, xDir).normalize();
        let r = props.radius;
        if (props.radiusFunc) {
            r = props.radiusFunc(i / (n - 1));
        }
        
        let l = positions.length / 3;
        positions.push(
            p.x + xDir.x * r,
            p.y + xDir.y * r,
            p.z + xDir.z * r
        );
        positions.push(
            p.x - xDir.x * r,
            p.y - xDir.y * r,
            p.z - xDir.z * r
        );

        if (props.colors) {
            let col = props.colors[i];
            colors.push(col.r, col.g, col.b, col.a);
            colors.push(col.r, col.g, col.b, col.a);
        }
        else if (props.color) {
            let col = props.color;
            colors.push(col.r, col.g, col.b, col.a);
            colors.push(col.r, col.g, col.b, col.a);
        }
        else {
            colors.push(1, 1, 1, 1);
        }

        if (i < n - 1) {
            indices.push(l, l + 2, l + 1);
            indices.push(l + 1, l + 2, l + 3);
        }

        normals.push(normal.x, normal.y, normal.z);
        normals.push(normal.x, normal.y, normal.z);

        uvs.push(1, i / (n - 1));
        uvs.push(0, i / (n - 1));
    }

    data.positions = positions;
    data.colors = colors;
    data.indices = indices;
    data.normals = normals;
    data.uvs = uvs;

    return data;
}

interface IBiDiscProps {
    color?: BABYLON.Color4,
    r1: number,
    r2: number,
    p1: BABYLON.Vector3,
    p2: BABYLON.Vector3,
}

function CreateBiDiscVertexData(props: IBiDiscProps): BABYLON.VertexData {
    let data = new BABYLON.VertexData();
    let positions: number[] = [];
    let normals = [];
    let indices: number[] = [];
    let uvs: number[] = [];

    let r1 = props.r1;
    let r2 = props.r2;
    let d = BABYLON.Vector3.Distance(props.p1, props.p2);
    
    let alpha = 0;
    if (d + r2 > r1) {
        alpha = Math.acos((r1 - r2) / d);
    }
    

    positions.push(0, 0, 0);
    let count1 = Math.round((2 * Math.PI - 2 * alpha) / (Math.PI / 32));
    let dA1 = (2 * Math.PI - 2 * alpha) / count1;
    for (let n = 0; n <= count1; n++) {
        let l = positions.length / 3;

        let a = Math.PI - alpha - n * dA1;
        let x = Math.cos(a) * r1;
        let z = Math.sin(a) * r1;

        positions.push(x, 0, z);
        if (n < count1) {
            indices.push(0, l + 1, l);
        }
    }

    if (alpha > 0) {
        let indexC2: number = positions.length / 3;
        
        indices.push(indexC2, 0, 1);
        indices.push(indexC2, indexC2 - 1, 0);
        indices.push(indexC2, indexC2 + 1, indexC2 - 1);
    
        positions.push(- d, 0, 0);
        let count2 = Math.round((2 * alpha) / (Math.PI / 32));
        let dA2 = (2 * alpha) / count2;
        for (let n = 0; n <= count2; n++) {
            let l = positions.length / 3;
    
            let a = Math.PI + alpha - n * dA2;
            let x = - d + Math.cos(a) * r2;
            let z = Math.sin(a) * r2;
    
            positions.push(x, 0, z);
            if (n < count2) {
                indices.push(indexC2, l + 1, l);
            }
        }
    
        indices.push(positions.length / 3 - 1, indexC2, 1);
    }

    data.positions = positions;
    data.indices = indices;
    
    for (let i = 0; i < positions.length / 3; i++) {
        normals.push(0, 1, 0);
    }
    data.normals = normals;
    
    data.uvs = uvs;
    if (props.color) {
        let colors = [];
        let colArray = props.color.asArray();
        for (let i = 0; i < positions.length / 3; i++) {
            colors.push(...colArray)
        }
        data.colors = colors;
    }

    if (d + r2 > r1) {
        let rot = Mummu.AngleFromToAround(new BABYLON.Vector3(-1, 0, 0), props.p2.subtract(props.p1), BABYLON.Axis.Y);
        Mummu.RotateAngleAxisVertexDataInPlace(data, rot, BABYLON.Axis.Y);
    }
    Mummu.TranslateVertexDataInPlace(data, props.p1);

    return data;
}