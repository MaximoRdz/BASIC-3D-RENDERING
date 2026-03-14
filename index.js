const HEIGHT = 500;
const WIDTH = 500;
const BACKGROUND_COLOR = "black";
const POINT_COLOR = "green";
const LINE_COLOR = "white";
const LINE_WIDTH = 3;
const POINT_SIZE = 10;
const FPS = 60; 

const cube_vertices = [
    // front face (closest)
    { x: 0.5,  y: 0,  z: 0.5 },
    { x: 0,  y: 0.5,  z: 0.5 },
    { x: -0.5, y: 0,  z: 0.5 },
    { x: 0,  y: -0.5, z: 0.5 },
    // back face (furthest)
    { x: 0.5,  y: 0,  z: -0.5 },
    { x: 0,  y: 0.5,  z: -0.5 },
    { x: -0.5, y: 0,  z: -0.5 },
    { x: 0,  y: -0.5, z: -0.5 },
];

const cube_edges = [
    [0, 1], [1, 2], [2, 3], [3, 0], // front face
    [4, 5], [5, 6], [6, 7], [7, 4], // back face
    [0, 4], [1, 5], [2, 6], [3, 7], // inter-faces
];

const cube_faces = [
    [0, 1, 2], [0, 2, 3],  // back
    [4, 5, 6], [4, 6, 7],  // front

    [0, 1, 5], [0, 5, 4],  // top
    [2, 3, 7], [2, 7, 6],  // bottom

    [1, 2, 6], [1, 6, 5],  // right
    [0, 3, 7], [0, 7, 4]  // left
];

function clear(ctx) {
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, game.width , game.height);
}

function getProjection2d(point3d) {
    return {
        x: point3d.x/point3d.z,
        y: point3d.y/point3d.z
    };
}

function toScreenCoordinates(point2d) {
    // point2d in [-1, 1]
    return {
        x: (point2d.x + 1) / 2 * WIDTH,
        y: (1 - (point2d.y + 1) / 2) * HEIGHT,
    };
}

function drawPoint2d(ctx, point2d) {
    ctx.fillStyle = POINT_COLOR;
    ctx.fillRect(
        point2d.x - POINT_SIZE/2, point2d.y - POINT_SIZE/2, POINT_SIZE, POINT_SIZE
    );
}

function drawLine(ctx, v1, v2) {
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(v1.x, v1.y);
    ctx.lineTo(v2.x, v2.y);
    ctx.stroke();
}

function drawTriangle(ctx, v1, v2, v3, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(v1.x, v1.y);
    ctx.lineTo(v2.x, v2.y);
    ctx.lineTo(v3.x, v3.y);
    ctx.closePath();
    ctx.fill();
}

function translate_z(vertex, dz) {
    return {...vertex, z: vertex.z + dz};
}

function rotate_x({x, y, z}, dtheta) {
    return {
        x: x,
        y: Math.cos(dtheta) * y - Math.sin(dtheta) * z,
        z: Math.sin(dtheta) * y + Math.cos(dtheta) * z,
    };
}

function rotate_y({x, y, z}, dtheta) {
    return {
        x: Math.cos(dtheta) * x + Math.sin(dtheta) * z,
        y: y,
        z: -Math.sin(dtheta) * x  + Math.cos(dtheta) * z
    };
}

function rotate_z({x, y, z}, dtheta) {
    return {
        x: Math.cos(dtheta) * x - Math.sin(dtheta) * y,
        y: Math.sin(dtheta) * x + Math.cos(dtheta) * y,
        z: z,
    };
}

let dz = 1.5;
let dz_w = 2 * Math.PI / 5; // ... / period
let dz_amplitude = 0.5;
let dtheta = 0;
const dt = 1 / FPS;
let time = 0;

function frame(ctx, vertices, edges, faces) {
    time += dt;
    dz_offset = dz_amplitude * Math.cos(dz_w * time);
    // dz += dt;
    dtheta += Math.PI * dt / 3;
    clear(ctx);

    // for (let i=0; i<vertices.length; i++) {
    //     vertex_3d = vertices[i];
    //     // drawPoint2d(ctx, toScreenCoordinates(getProjection2d(translate_z(vertex_3d, dz))));
    //     // drawPoint2d(ctx, toScreenCoordinates(getProjection2d(rotate_x(vertex_3d, dtheta))));
    //     // drawPoint2d(ctx, toScreenCoordinates(getProjection2d(rotate_y(vertex_3d, dtheta))));
    //     drawPoint2d(ctx, toScreenCoordinates(getProjection2d(rotate_z(vertex_3d, dtheta))));
    //
    // }
    
    let projectedVertices = [];

    for (let i = 0; i < vertices.length; i++) {

        const v_3d = translate_z(
            rotate_z(
                rotate_y(
                    rotate_x(vertices[i], dtheta),
                    dtheta
                ),
                dtheta
            ),
            dz_offset + dz);
        const v_2d = toScreenCoordinates(getProjection2d(v_3d));

        projectedVertices.push({ v: v_2d, z: v_3d.z });
    }

    // NAIVE: Rendering
    // for (let i = 0; i < faces.length; i++) {
    //     const [a, b, c] = faces[i];
    //     const color = `hsl(${i*30}, 80%, 50%)`;
    //     drawTriangle(ctx, projectedVertices[a].v, projectedVertices[b].v, projectedVertices[c].v, color);
    // }
    // Patinter's Algorithm: fixes rendering via depth sorting (in z axis)
    const faces_sorted = faces.map(face => {
        const face_z = (
            projectedVertices[face[0]].z +
            projectedVertices[face[1]].z +
            projectedVertices[face[2]].z
        ) / 3;
        return { face, face_z };
    });

    faces_sorted.sort((a, b) => b.z - a.z);

    for (let i = 0; i < faces_sorted.length; i++) {
        const [a, b, c] = faces_sorted[i].face;
        const color = `hsl(${i*5}, 100%, 50%)`;
        drawTriangle(ctx, projectedVertices[a].v, projectedVertices[b].v, projectedVertices[c].v, color);
    }


    for (let i = 0; i < edges.length; i++) {
        const [ind1, ind2] = edges[i];
        drawLine(ctx, projectedVertices[ind1].v, projectedVertices[ind2].v);
    }

    setTimeout(frame, 1000/FPS, ctx, vertices, edges, faces);
}

function main() {
    console.log("Created canvas in HTML:", game);

    game.width = WIDTH;
    game.height = HEIGHT;

    const ctx = game.getContext("2d");

    if (!ctx) {
        alert("Browswer or machine do not support WebGL.");
        return;
    }

    clear(ctx);
    setTimeout(frame, 1000/FPS, ctx, cube_vertices, cube_edges, cube_faces);
}

main();
