
# Simple 3D Renderer in JavaScript

This project is a small software renderer written in JavaScript using the HTML canvas.  
It implements a minimal 3D pipeline without relying on WebGL or external libraries.

The goal is to understand the basic ideas behind 3D graphics: coordinate systems, projection,
transformations, and mesh rendering.

[Try it live](https://yourusername.github.io/your-repo/your-file.html)

## Perspective Projection

A 3D point `(x, y, z)` is projected into 2D space using a very simple perspective projection:

x' = x / z  
y' = y / z  

This assumes the camera is placed at `z = 0` and looks toward positive `z`.

Points at `z = 1` appear on the screen with their original `(x, y)` coordinates.  
Points further away (`z > 1`) appear closer to the center because they are divided by a larger value.

Points with `z <= 0` would be behind the camera and cannot be projected.

## Coordinate Systems

The canvas coordinate system is not convenient for doing math:

- `(0, 0)` is the **top-left corner**
- `x` increases to the **right**
- `y` increases **downwards**

For the renderer it is easier to work with a more conventional coordinate system:

- `(0, 0)` is the **center of the screen**
- `x` increases to the **right**
- `y` increases **upwards**
- visible space is mapped to the range `[-1, 1]`

A conversion step maps these coordinates to canvas pixel coordinates.

## Transformations

The renderer supports basic 3D transformations applied to vertices.

### Translation

Objects can be moved in space by adding offsets to their coordinates.

### Rotation

Rotation is implemented using standard 3D rotation matrices:

- rotation around the **x axis**
- rotation around the **y axis**
- rotation around the **z axis**

Reference:  
https://en.wikipedia.org/wiki/Rotation_matrix#In_three_dimensions

Each vertex of the mesh is transformed every frame before being projected.

## Rendering

The rendering loop performs the following steps:

1. Clear the canvas
2. Transform each vertex (rotation or translation)
3. Project the 3D vertex to 2D
4. Convert to screen coordinates
5. Draw the result on the canvas

The animation runs at a fixed frame rate.

## Mesh Support

Meshes are loaded from simple `.obj` files.  
The loader extracts:

- vertices (`v`)
- faces (`f`)

Edges can be computed from faces if a wireframe view is needed.

Each face is rendered as a triangle on the canvas.

## Purpose

This code is meant as a learning exercise.  
It intentionally avoids GPU APIs and complex libraries in order to make the core ideas behind
3D rendering easier to understand.
