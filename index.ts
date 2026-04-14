import {
  Box3,
  BufferGeometry,
  InterleavedBufferAttribute,
  Material,
  Matrix4,
  Mesh,
  Object3D,
  Quaternion,
  Vector3,
} from "three";

import AmmoInit from "@hubs/ammo.js";
await AmmoInit();

export const shapeTypes = [
  "box",
  "cylinder",
  "sphere",
  "capsule",
  "cone",
  "hull",
  "hacd",
  "vhacd",
  "mesh",
  "heightfield",
] as const;
export type ShapeType = (typeof shapeTypes)[number];

export type AmmoShapeType =
  | Ammo.btBoxShape
  | Ammo.btCylinderShape
  | Ammo.btCapsuleShape
  | Ammo.btConeShape
  | Ammo.btSphereShape
  | Ammo.btConvexHullShape
  | Ammo.btConvexHullShape[]
  | Ammo.btTriangleMeshShape
  | Ammo.btHeightfieldTerrainShape;

enum PHY_ScalarType {
  PHY_FLOAT = 0,
  PHY_DOUBLE = 1,
  PHY_INTEGER = 2,
  PHY_SHORT = 3,
  PHY_FIXEDPOINT88 = 4,
  PHY_UCHAR = 5,
}

// all : A single shape is automatically sized to bound all meshes within the entity.
// manual: A single shape is sized manually. Requires halfExtents or sphereRadius.
export interface GeneralShapeOptions {
  halfExtents: Vector3;
  minHalfExtent: number;
  maxHalfExtent: number;
  offset: Vector3;
  orientation: Quaternion;
  margin: number;
}

const defaultOptions: GeneralShapeOptions = {
  halfExtents: new Vector3(),
  minHalfExtent: 0,
  maxHalfExtent: Number.POSITIVE_INFINITY,
  offset: new Vector3(),
  orientation: new Quaternion(),
  margin: 0.01,
};

// BOX SHAPE
//TODO: support gimpact (dynamic trimesh) and heightmap

export interface ShapeOptionsGeneral {
  offset?: Vector3;
  margin?: number;
  orientation?: Quaternion;
}

export interface ShapeOptionsAll extends ShapeOptionsGeneral {
  fit: "all";
  vertices: number[][];
  matrices: number[][];
  matrixWorld: number[];
  minHalfExtent?: number;
  maxHalfExtent?: number;
}
export interface ShapeOptionsManual extends ShapeOptionsGeneral {
  fit?: "manual";
  halfExtents?: Vector3;
}

export type BoxOptions = (ShapeOptionsAll | ShapeOptionsManual) & { type: "box" };

export type CircularOptions = (ShapeOptionsAll | ShapeOptionsManual) & { cylinderAxis?: "x" | "y" | "z" };

export type CylinderOptions = CircularOptions & { type: "cylinder" };
export type CapsuleOptions = CircularOptions & { type: "capsule" };
export type ConeOptions = CircularOptions & { type: "cone" };

export type SphereOptions = { type: "sphere"; cylinderAxis?: "x" | "y" | "z" } & (
  | (ShapeOptionsManual & { sphereRadius: number })
  | ShapeOptionsAll
);

interface ShapeOptionsIndexed extends ShapeOptionsGeneral {
  matrixWorld: number[];
  vertices: number[][];
  matrices: number[][];
  indexes: number[][];
}

export interface HullOptions extends Omit<ShapeOptionsIndexed, "indexes"> {
  type: "hull";
  maxVertices: number;
}

export interface HACDOptions extends ShapeOptionsIndexed {
  type: "hacd";
  compacityWeight?: number;
  volumeWeight?: number;
  nVerticesPerCH?: number;
  concavity?: number;
  nClusters?: number;
}

export interface VHACDOptions extends ShapeOptionsIndexed {
  type: "vhacd";
  resolution?: number;
  depth?: number;
  concavity?: number;
  planeDownsampling?: number;
  convexhullDownsampling?: number;
  alpha?: number;
  beta?: number;
  gamma?: number;
  pca?: 0 | 1;
  mode?: 0 | 1;
  maxNumVerticesPerCH?: number;
  minVolumePerCH?: number;
  convexhullApproximation?: 0 | 1;
  oclAcceleration?: 0 | 1;
}

export interface TriMeshOptions extends ShapeOptionsIndexed {
  type: "mesh";
}

export interface HeightfieldOptions extends ShapeOptionsGeneral {
  type: "heightfield";
  heightfieldDistance?: number;
  heightfieldData: number[][];
  heightScale?: number;
  upAxis?: "x" | "y" | "z"; // x = 0; y = 1; z = 2
  heightDataType?: PHY_ScalarType.PHY_FLOAT | PHY_ScalarType.PHY_SHORT | PHY_ScalarType.PHY_UCHAR;
  flipQuadEdges?: boolean;
}

export type ShapeOptions =
  | BoxOptions
  | CylinderOptions
  | CapsuleOptions
  | ConeOptions
  | SphereOptions
  | HullOptions
  | HACDOptions
  | VHACDOptions
  | TriMeshOptions
  | HeightfieldOptions;

export function createCollisionShapes(options: ShapeOptions): Ammo.btCollisionShape[] {
  switch (options.type) {
    case "box":
      return [createBoxShape(options)];
    case "cylinder":
      return [createCylinderShape(options)];
    case "capsule":
      return [createCapsuleShape(options)];
    case "cone":
      return [createConeShape(options)];
    case "sphere":
      return [createSphereShape(options)];
    case "hull":
      return [createHullShape(options)];
    case "hacd":
      return createHACDShapes(options);
    case "vhacd":
      return createVHACDShapes(options);
    case "mesh":
      return [createTriMeshShape(options)];
    case "heightfield":
      return [createHeightfieldTerrainShape(options)];
  }
}

// all: requires vertices & matrices
// manual: doesn't require vertices & matrices
export function createBoxShape(options: BoxOptions) {
  const halfExtents =
    options.fit === "all"
      ? _computeHalfExtents(
          _computeBounds(options.vertices, options.matrices),
          options.minHalfExtent || 0,
          options.maxHalfExtent || Number.POSITIVE_INFINITY,
        )
      : options.halfExtents;

  const { x, y, z } = halfExtents || { x: 1, y: 1, z: 1 };
  const btHalfExtents = new Ammo.btVector3(x, y, z);
  const collisionShape = new Ammo.btBoxShape(btHalfExtents);
  Ammo.destroy(btHalfExtents);

  _finishCollisionShape({
    shape: collisionShape,
    type: "box",
    scale: options.fit === "all" ? _computeScale(options.matrixWorld) : new Vector3(1, 1, 1),
    margin: options.margin,
    offset: options.offset,
    orientation: options.orientation,
  });
  return collisionShape;
}

// CYLINDER SHAPE

export function createCylinderShape(options: CylinderOptions) {
  const halfExtents =
    options.fit === "all"
      ? _computeHalfExtents(
          _computeBounds(options.vertices, options.matrices),
          options.minHalfExtent || 0,
          options.maxHalfExtent || Number.POSITIVE_INFINITY,
        )
      : options.halfExtents;

  const { x, y, z } = halfExtents || { x: 1, y: 1, z: 1 };
  const btHalfExtents = new Ammo.btVector3(x, y, z);
  const collisionShape = (() => {
    switch (options.cylinderAxis) {
      case "x":
        return new Ammo.btCylinderShapeX(btHalfExtents);
      case "z":
        return new Ammo.btCylinderShapeZ(btHalfExtents);
      default:
        return new Ammo.btCylinderShape(btHalfExtents);
    }
  })();
  Ammo.destroy(btHalfExtents);

  _finishCollisionShape({
    shape: collisionShape,
    type: "cylinder",
    scale: options.fit === "all" ? _computeScale(options.matrixWorld) : new Vector3(1, 1, 1),
    margin: options.margin,
    offset: options.offset,
    orientation: options.orientation,
  });
  return collisionShape;
}

export function createCapsuleShape(options: CapsuleOptions) {
  const halfExtents =
    options.fit === "all"
      ? _computeHalfExtents(
          _computeBounds(options.vertices, options.matrices),
          options.minHalfExtent || 0,
          options.maxHalfExtent || Number.POSITIVE_INFINITY,
        )
      : options.halfExtents;

  const { x, y, z } = halfExtents || { x: 1, y: 1, z: 1 };
  const collisionShape = (() => {
    switch (options.cylinderAxis) {
      case "x":
        return new Ammo.btCapsuleShapeX(Math.max(y, z), x * 2);
      case "z":
        return new Ammo.btCapsuleShapeZ(Math.max(x, y), z * 2);
      default:
        return new Ammo.btCapsuleShape(Math.max(x, z), y * 2);
    }
  })();

  _finishCollisionShape({
    shape: collisionShape,
    type: "capsule",
    scale: options.fit === "all" ? _computeScale(options.matrixWorld) : new Vector3(1, 1, 1),
    margin: options.margin,
    offset: options.offset,
    orientation: options.orientation,
  });
  return collisionShape;
}

// CONE SHAPE

export function createConeShape(options: ConeOptions) {
  const halfExtents =
    options.fit === "all"
      ? _computeHalfExtents(
          _computeBounds(options.vertices, options.matrices),
          options.minHalfExtent || 0,
          options.maxHalfExtent || Number.POSITIVE_INFINITY,
        )
      : options.halfExtents;

  const { x, y, z } = halfExtents || { x: 1, y: 1, z: 1 };
  const collisionShape = (() => {
    switch (options.cylinderAxis) {
      case "x":
        return new Ammo.btConeShapeX(Math.max(y, z), x * 2);
      case "z":
        return new Ammo.btConeShapeZ(Math.max(x, y), z * 2);
      default:
        return new Ammo.btConeShape(Math.max(x, z), y * 2);
    }
  })();

  _finishCollisionShape({
    shape: collisionShape,
    type: "cone",
    scale: options.fit === "all" ? _computeScale(options.matrixWorld) : new Vector3(1, 1, 1),
    margin: options.margin,
    offset: options.offset,
    orientation: options.orientation,
  });
  return collisionShape;
}

// SPHERE SHAPE

export function createSphereShape(options: SphereOptions) {
  const radius =
    options.fit === "all"
      ? _computeRadius(options.vertices, options.matrices, _computeBounds(options.vertices, options.matrices))
      : options.sphereRadius;

  const collisionShape = new Ammo.btSphereShape(radius);
  _finishCollisionShape({
    shape: collisionShape,
    type: "sphere",
    scale: options.fit === "all" ? _computeScale(options.matrixWorld) : new Vector3(1, 1, 1),
    margin: options.margin,
    offset: options.offset,
    orientation: options.orientation,
  });

  return collisionShape;
}

// HULL SHAPE

export function createHullShape({
  vertices,
  matrices,
  maxVertices,
  matrixWorld,
  margin = 0.01,
  orientation = new Quaternion(),
  offset = new Vector3(),
}: HullOptions) {
  const vertex = new Vector3();
  const center = new Vector3();
  const matrix = new Matrix4();

  const bounds = _computeBounds(vertices, matrices);

  const btVertex = new Ammo.btVector3();
  const originalHull = new Ammo.btConvexHullShape();
  originalHull.setMargin(margin);
  center.addVectors(bounds.max, bounds.min).multiplyScalar(0.5);

  let vertexCount = 0;
  vertices.forEach((vertList) => {
    vertexCount += vertList.length / 3;
  });
  // todo: might want to implement this in a deterministic way that doesn't do O(verts) calls to Math.random
  if (vertexCount > maxVertices) {
    console.warn(`too many vertices for hull shape; sampling ~${maxVertices} from ~${vertexCount} vertices`);
  }
  const p = Math.min(1, maxVertices / vertexCount);

  vertices.forEach((vertList, i) => {
    for (let j = 0; j < vertList.length; j += 3) {
      const isLastVertex = i === vertices.length - 1 && j === vertList.length - 3;
      if (Math.random() <= p || isLastVertex) {
        // always include the last vertex
        vertex
          .set(vertList[j]!, vertList[j + 1]!, vertList[j + 2]!)
          .applyMatrix4(matrix)
          .sub(center);
        btVertex.setValue(vertex.x, vertex.y, vertex.z);
        originalHull.addPoint(btVertex, isLastVertex); // recalc AABB only on last geometry
      }
    }
  });

  let collisionShape = originalHull;
  if (originalHull.getNumVertices() >= 100) {
    //Bullet documentation says don't use convexHulls with 100 verts or more
    const shapeHull = new Ammo.btShapeHull(originalHull);
    shapeHull.buildHull(margin);
    Ammo.destroy(originalHull);

    // Need to get a raw pointer style array (number[] in js)
    // First get the vertex pointer from shapeHull, then get the actual pointer address offset value
    // Then grab the section of the heap that spans from pointer start (vertexPointer) to pointer end (vertexPointer + number of verticies)
    // Don't forget to divide each offset by 8! (convert bits to bytes).
    const vertexPointer = Ammo.getPointer(shapeHull.getVertexPointer());
    const vertexArray = Array.from(
      Ammo.HEAPF64.subarray(vertexPointer / 8, vertexPointer / 8 + shapeHull.numVertices()),
    );

    collisionShape = new Ammo.btConvexHullShape(
      vertexArray, // TODO: INVESTIGATE
      shapeHull.numVertices(),
    );
    Ammo.destroy(shapeHull); // btConvexHullShape makes a copy
  }

  Ammo.destroy(btVertex);

  _finishCollisionShape({
    shape: collisionShape,
    type: "hull",
    scale: _computeScale(matrixWorld),
    margin: margin,
    offset: offset,
    orientation: orientation,
  });
  return collisionShape;
}

// HACD SHAPE

export function createHACDShapes({
  matrixWorld,
  vertices,
  matrices,
  indexes,
  offset = new Vector3(),
  orientation = new Quaternion(),
  margin = 0.01,
  compacityWeight = 0.0001,
  volumeWeight = 0,
  nVerticesPerCH = 100,
  concavity = 100,
  nClusters = 1,
}: HACDOptions) {
  const vector = new Vector3();
  const center = new Vector3();
  const matrix = new Matrix4();

  const bounds = _computeBounds(vertices, matrices);
  const scale = _computeScale(matrixWorld);

  let vertexCount = 0;
  let triCount = 0;
  center.addVectors(bounds.max, bounds.min).multiplyScalar(0.5);

  vertices.forEach((vertList, i) => {
    vertexCount += vertList.length / 3;
    if (indexes && indexes[i]) {
      triCount += indexes[i].length / 3;
    } else {
      triCount += vertList.length / 9;
    }
  });

  const hacd = new Ammo.HACD();
  hacd.SetCompacityWeight(compacityWeight);
  hacd.SetVolumeWeight(volumeWeight);
  hacd.SetNClusters(nClusters);
  hacd.SetNVerticesPerCH(nVerticesPerCH);
  hacd.SetConcavity(concavity);

  const vertexPointer = Ammo._malloc(vertexCount * 3 * 8);
  const trianglePointer = Ammo._malloc(triCount * 3 * 4);
  hacd.SetPoints(Ammo.wrapPointer(vertexPointer, Ammo.Vec3Real));
  hacd.SetTriangles(Ammo.wrapPointer(trianglePointer, Ammo.Vec3Long));
  hacd.SetNPoints(vertexCount);
  hacd.SetNTriangles(triCount);

  let vptr = vertexPointer / 8;
  let tptr = trianglePointer / 4;
  vertices.forEach((components, i) => {
    matrix.fromArray(matrices[i]!); // HACK
    for (let j = 0; j < components.length; j += 3) {
      vector
        .set(components[j + 0]!, components[j + 1]!, components[j + 2]!) // HACK!
        .applyMatrix4(matrix)
        .sub(center);
      Ammo.HEAPF64[vptr + 0] = vector.x;
      Ammo.HEAPF64[vptr + 1] = vector.y;
      Ammo.HEAPF64[vptr + 2] = vector.z;
      vptr += 3;
    }
    if (indexes[i]) {
      indexes[i].forEach((index, j) => {
        Ammo.HEAP32[tptr] = index;
        tptr++;
      });
    } else {
      for (let j = 0; j < components.length / 3; j++) {
        Ammo.HEAP32[tptr] = j;
        tptr++;
      }
    }
  });

  hacd.Compute();
  Ammo._free(vertexPointer);
  Ammo._free(trianglePointer);
  const currentNClusters = hacd.GetNClusters();

  const shapes: Ammo.btConvexHullShape[] = [];
  for (let i = 0; i < nClusters; i++) {
    const hull = new Ammo.btConvexHullShape();
    hull.setMargin(margin);
    const nPoints = hacd.GetNPointsCH(i);
    const nTriangles = hacd.GetNTrianglesCH(i);
    const hullPointsPointer = Ammo._malloc(nPoints * 3 * 8);
    const hullTrianglesPointer = Ammo._malloc(nTriangles * 3 * 4);
    hacd.GetCH(
      i,
      Ammo.wrapPointer(hullPointsPointer, Ammo.Vec3Real),
      Ammo.wrapPointer(hullTrianglesPointer, Ammo.Vec3Long),
    );

    for (let pi = 0; pi < nPoints; pi++) {
      const btVertex = new Ammo.btVector3();
      const px = Ammo.HEAPF64[hullPointsPointer / 8 + pi * 3 + 0]!; // HACK!
      const py = Ammo.HEAPF64[hullPointsPointer / 8 + pi * 3 + 1]!;
      const pz = Ammo.HEAPF64[hullPointsPointer / 8 + pi * 3 + 2]!;
      btVertex.setValue(px, py, pz);
      hull.addPoint(btVertex, pi === nPoints - 1);
      Ammo.destroy(btVertex);
    }

    // TODO: Free Pointers?
    _finishCollisionShape({
      shape: hull,
      type: "hacd",
      scale: scale,
      margin: margin,
      offset: offset,
      orientation: orientation,
    });
    shapes.push(hull);
  }

  return shapes;
}

// VHACD SHAPE

//https://kmamou.blogspot.com/2014/12/v-hacd-20-parameters-description.html

export function createVHACDShapes({
  matrixWorld,
  vertices,
  matrices,
  indexes,
  offset = new Vector3(),
  orientation = new Quaternion(),
  margin = 0.01,
  resolution = 100000,
  depth = 20,
  concavity = 0.0025,
  planeDownsampling = 4,
  convexhullDownsampling = 4,
  alpha = 0.05,
  beta = 0.05,
  gamma = 0.00125,
  pca = 0,
  mode = 0,
  maxNumVerticesPerCH = 64,
  minVolumePerCH = 0.0001,
  convexhullApproximation = 1,
  oclAcceleration = 0,
}: VHACDOptions) {
  const vector = new Vector3();
  const center = new Vector3();
  const matrix = new Matrix4();

  const bounds = _computeBounds(vertices, matrices);
  const scale = _computeScale(matrixWorld);

  let vertexCount = 0;
  let triCount = 0;
  center.addVectors(bounds.max, bounds.min).multiplyScalar(0.5);

  vertices.forEach((vertList, i) => {
    vertexCount += vertList.length / 3;
    if (indexes && indexes[i]) {
      triCount += indexes[i].length / 3;
    } else {
      triCount += vertList.length / 9;
    }
  });

  const vhacd = new Ammo.VHACD();
  const params = new Ammo.Parameters();
  //https://kmamou.blogspot.com/2014/12/v-hacd-20-parameters-description.html
  params.set_m_resolution(resolution);
  params.set_m_depth(depth);
  params.set_m_concavity(concavity);
  params.set_m_planeDownsampling(planeDownsampling);
  params.set_m_convexhullDownsampling(convexhullDownsampling);
  params.set_m_alpha(alpha);
  params.set_m_beta(beta);
  params.set_m_gamma(gamma);
  params.set_m_pca(pca);
  params.set_m_mode(mode);
  params.set_m_maxNumVerticesPerCH(maxNumVerticesPerCH);
  params.set_m_minVolumePerCH(minVolumePerCH);
  params.set_m_convexhullApproximation(convexhullApproximation);
  params.set_m_oclAcceleration(oclAcceleration);

  const vertsPointer = Ammo._malloc(vertexCount * 3 * 8 + 3);
  const trisPointer = Ammo._malloc(triCount * 3 * 4);

  let pptr = vertsPointer / 8;
  let tptr = trisPointer / 4;

  vertices.forEach((components, i) => {
    matrix.fromArray(matrices[i]!); // HACK
    for (let j = 0; j < components.length; j += 3) {
      vector
        .set(components[j + 0]!, components[j + 1]!, components[j + 2]!) // HACK
        .applyMatrix4(matrix)
        .sub(center);
      Ammo.HEAPF64[pptr + 0] = vector.x;
      Ammo.HEAPF64[pptr + 1] = vector.y;
      Ammo.HEAPF64[pptr + 2] = vector.z;
      pptr += 3;
    }
    if (indexes[i]) {
      indexes[i].forEach((index) => {
        Ammo.HEAP32[tptr] = index;
        tptr++;
      });
    } else {
      for (let j = 0; j < components.length / 3; j++) {
        Ammo.HEAP32[tptr] = j;
        tptr++;
      }
    }
  });

  // The code is expecting a raw pointer for the verts/tris, which translates to a number[] in JS land
  // Emscripten doesn't play well with raw pointers, so we have to handle the translation manually
  // The gist is to set the memory manually with malloc and HEAP manipulation (as done above)
  // The memory is set, but we still need to pass a proper number[] in Typescript land to the method below
  // We know where the array starts (vertsPointer, divided by 8 to translate from bits to bytes)
  // And we know where the array ends (pptr, which we used to set the array above)
  // So we can just subset the Heap array from the starting point to the ending point!
  // See more:
  // https://stackoverflow.com/questions/17883799/how-to-handle-passing-returning-array-pointers-to-emscripten-compiled-code
  const vertsArray = Array.from(Ammo.HEAPF64.subarray(vertsPointer / 8, pptr));
  const trisArray = Array.from(Ammo.HEAPF64.subarray(trisPointer / 4, tptr));
  vhacd.Compute(vertsArray, 3, vertexCount, trisArray, 3, triCount, params);
  Ammo._free(vertsPointer);
  Ammo._free(trisPointer);
  const nHulls = vhacd.GetNConvexHulls();

  const shapes = [];
  const ch = new Ammo.ConvexHull();
  for (let i = 0; i < nHulls; i++) {
    vhacd.GetConvexHull(i, ch);
    const nPoints = ch.get_m_nPoints();

    const hull = new Ammo.btConvexHullShape();
    hull.setMargin(margin);

    for (let pi = 0; pi < nPoints; pi++) {
      const btVertex = new Ammo.btVector3();
      const px = ch.get_m_points(pi * 3 + 0);
      const py = ch.get_m_points(pi * 3 + 1);
      const pz = ch.get_m_points(pi * 3 + 2);
      btVertex.setValue(px, py, pz);
      hull.addPoint(btVertex, pi === nPoints - 1);
      Ammo.destroy(btVertex);
    }

    _finishCollisionShape({
      shape: hull,
      type: "vhacd",
      scale: scale,
      margin: margin,
      offset: offset,
      orientation: orientation,
    });
    shapes.push(hull);
  }
  Ammo.destroy(ch);
  Ammo.destroy(vhacd);

  return shapes;
}

// TRIMESH SHAPE

export function createTriMeshShape({
  matrixWorld,
  vertices,
  matrices,
  indexes,
  offset = new Vector3(),
  orientation = new Quaternion(),
  margin = 0.01,
}: TriMeshOptions) {
  const va = new Vector3();
  const vb = new Vector3();
  const vc = new Vector3();
  const matrix = new Matrix4();

  const scale = _computeScale(matrixWorld);

  const bta = new Ammo.btVector3();
  const btb = new Ammo.btVector3();
  const btc = new Ammo.btVector3();
  const triMesh = new Ammo.btTriangleMesh(true, false);

  vertices.forEach((components, i) => {
    const index = indexes[i] ? indexes[i] : null;
    matrix.fromArray(matrices[i]!); // HACK
    if (index) {
      for (let j = 0; j < index.length; j += 3) {
        // HACK city
        const ai = index[j]! * 3;
        const bi = index[j + 1]! * 3;
        const ci = index[j + 2]! * 3;
        va.set(components[ai]!, components[ai + 1]!, components[ai + 2]!).applyMatrix4(matrix);
        vb.set(components[bi]!, components[bi + 1]!, components[bi + 2]!).applyMatrix4(matrix);
        vc.set(components[ci]!, components[ci + 1]!, components[ci + 2]!).applyMatrix4(matrix);
        bta.setValue(va.x, va.y, va.z);
        btb.setValue(vb.x, vb.y, vb.z);
        btc.setValue(vc.x, vc.y, vc.z);
        triMesh.addTriangle(bta, btb, btc, false);
      }
    } else {
      for (let j = 0; j < components.length; j += 9) {
        va.set(components[j + 0]!, components[j + 1]!, components[j + 2]!).applyMatrix4(matrix);
        vb.set(components[j + 3]!, components[j + 4]!, components[j + 5]!).applyMatrix4(matrix);
        vc.set(components[j + 6]!, components[j + 7]!, components[j + 8]!).applyMatrix4(matrix);
        bta.setValue(va.x, va.y, va.z);
        btb.setValue(vb.x, vb.y, vb.z);
        btc.setValue(vc.x, vc.y, vc.z);
        triMesh.addTriangle(bta, btb, btc, false);
      }
    }
  });

  const localScale = new Ammo.btVector3(scale.x, scale.y, scale.z);
  triMesh.setScaling(localScale);
  Ammo.destroy(localScale);

  const collisionShape = new Ammo.btBvhTriangleMeshShape(triMesh, true, true);
  collisionShape.resources = [triMesh];

  Ammo.destroy(bta);
  Ammo.destroy(btb);
  Ammo.destroy(btc);

  _finishCollisionShape({
    shape: collisionShape,
    type: "mesh",
    margin: margin,
    offset: offset,
    orientation: orientation,
  });
  return collisionShape;
}

// HEIGHTFIELD SHAPE

export function createHeightfieldTerrainShape({
  offset = new Vector3(),
  orientation = new Quaternion(),
  margin = 0.01,
  heightfieldDistance = 1,
  heightfieldData = [],
  heightScale = 0,
  upAxis = "y", // x = 0; y = 1; z = 2
  heightDataType = PHY_ScalarType.PHY_FLOAT,
  flipQuadEdges = true,
}: HeightfieldOptions) {
  const heightStickLength = heightfieldData.length;
  const heightStickWidth = heightStickLength > 0 && heightfieldData[0] ? heightfieldData[0].length : 0;

  const data = Ammo._malloc(heightStickLength * heightStickWidth * 4);
  const ptr = data / 4;

  let minHeight = Number.POSITIVE_INFINITY;
  let maxHeight = Number.NEGATIVE_INFINITY;
  let index = 0;
  for (let l = 0; l < heightStickLength; l++) {
    for (let w = 0; w < heightStickWidth; w++) {
      const height = heightfieldData[l]![w] || 0; // HACK!
      Ammo.HEAPF32[ptr + index] = height;
      index++;
      minHeight = Math.min(minHeight, height);
      maxHeight = Math.max(maxHeight, height);
    }
  }

  const collisionShape = new Ammo.btHeightfieldTerrainShape(
    heightStickWidth,
    heightStickLength,
    data,
    heightScale,
    minHeight,
    maxHeight,
    upAxis === "x" ? 0 : upAxis === "y" ? 1 : 2, // x = 0; y = 1; z = 2
    heightDataType,
    flipQuadEdges,
  );

  const scale = new Ammo.btVector3(heightfieldDistance, 1, heightfieldDistance);
  collisionShape.setLocalScaling(scale);
  Ammo.destroy(scale);

  // TODO: INVESTIGATE
  // collisionShape.heightfieldData = data;

  _finishCollisionShape({
    shape: collisionShape,
    type: "heightfield",
    margin: margin,
    offset: offset,
    orientation: orientation,
  });
  return collisionShape;
}

function _finishCollisionShape({
  shape,
  type,
  scale = new Vector3(1, 1, 1),
  margin = 0.01,
  offset = new Vector3(),
  orientation = new Quaternion(),
}: {
  shape: Ammo.btCollisionShape;
  type: ShapeType;
  scale?: Vector3;
  margin?: number;
  offset?: Vector3;
  orientation?: Quaternion;
}) {
  shape.type = type;
  // TODO: INVESTIGATE
  shape.setMargin(margin);
  shape.destroy = () => {
    for (let res of shape.resources || []) {
      Ammo.destroy(res);
    }
    if (shape.heightfieldData) {
      Ammo._free(shape.heightfieldData);
    }
    Ammo.destroy(shape);
  };

  const localTransform = new Ammo.btTransform();
  const rotation = new Ammo.btQuaternion(0, 0, 0, 0);
  localTransform.setIdentity();

  localTransform.getOrigin().setValue(offset.x, offset.y, offset.z);
  rotation.setValue(orientation.x, orientation.y, orientation.z, orientation.w);

  localTransform.setRotation(rotation);
  Ammo.destroy(rotation);

  const localScale = new Ammo.btVector3(scale.x, scale.y, scale.z);
  shape.setLocalScaling(localScale);
  Ammo.destroy(localScale);

  shape.localTransform = localTransform;
}

const isObjectVisibleUpToRoot = (object: Object3D, root?: Object3D) => {
  if (!object.visible) return false;

  if (object.parent && object.parent !== root) {
    return isObjectVisibleUpToRoot(object.parent);
  }

  return true;
};
export const iterateGeometries = ({
  root,
  includeInvisible = false,
  cb,
}: {
  root: Object3D;
  includeInvisible?: boolean;
  cb: (vertexArray: number[], matrixArray: number[], indexArray: number[] | []) => void;
}) => {
  const inverse = new Matrix4();
  inverse.copy(root.matrixWorld).invert();
  root.traverse((mesh) => {
    if (!(mesh instanceof Mesh) || mesh.name === "Sky" || (!includeInvisible && !isObjectVisibleUpToRoot(mesh, root)))
      return;
    const narrowMesh = mesh as Mesh<BufferGeometry, Material>; // HACK
    const transform = new Matrix4();
    if (narrowMesh === root) {
      transform.identity();
    } else {
      narrowMesh.updateWorldMatrix(true, false);
      transform.multiplyMatrices(inverse, narrowMesh.matrixWorld);
    }
    // todo: might want to return null xform if this is the root so that callers can avoid multiplying
    // things by the identity matrix

    let vertices: number[];
    const verticesAttribute = narrowMesh.geometry.attributes.position;
    if (verticesAttribute instanceof InterleavedBufferAttribute) {
      //
      // An interleaved buffer attribute shares the underlying
      // array with other attributes. We translate it to a
      // regular array here to not carry this logic around in
      // the shape api.
      //
      vertices = [];
      for (let i = 0; i < verticesAttribute.count; i += 3) {
        vertices.push(verticesAttribute.getX(i));
        vertices.push(verticesAttribute.getY(i));
        vertices.push(verticesAttribute.getZ(i));
      }
    } else {
      vertices = verticesAttribute ? Array.from(verticesAttribute.array) : [];
    }

    cb(vertices, transform.elements, narrowMesh.geometry.index ? Array.from(narrowMesh.geometry.index.array) : []);
  });
};

const _computeScale = (matrixWorld: number[]) => {
  const matrix = new Matrix4();
  const scale = new Vector3(1, 1, 1);
  matrix.fromArray(matrixWorld);
  scale.setFromMatrixScale(matrix);
  return scale;
};

const _computeRadius = (vertices: number[][], matrices: number[][], bounds: Box3) => {
  const center = new Vector3();
  let maxRadiusSq = 0;
  let { x: cx, y: cy, z: cz } = bounds.getCenter(center);

  _iterateVertices(vertices, matrices, (v) => {
    const dx = cx - v.x;
    const dy = cy - v.y;
    const dz = cz - v.z;
    maxRadiusSq = Math.max(maxRadiusSq, dx * dx + dy * dy + dz * dz);
  });
  return Math.sqrt(maxRadiusSq);
};

const _computeHalfExtents = (bounds: Box3, minHalfExtent: number, maxHalfExtent: number) => {
  const halfExtents = new Vector3();
  return halfExtents.subVectors(bounds.max, bounds.min).multiplyScalar(0.5).clampScalar(minHalfExtent, maxHalfExtent);
};

// returns the bounding box for the geometries underneath `root`.
const _computeBounds = function (vertices: number[][], matrices: number[][]) {
  const bounds = new Box3();
  let minX = +Infinity;
  let minY = +Infinity;
  let minZ = +Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  bounds.min.set(0, 0, 0);
  bounds.max.set(0, 0, 0);

  _iterateVertices(vertices, matrices, (v) => {
    if (v.x < minX) minX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.z < minZ) minZ = v.z;
    if (v.x > maxX) maxX = v.x;
    if (v.y > maxY) maxY = v.y;
    if (v.z > maxZ) maxZ = v.z;
  });

  bounds.min.set(minX, minY, minZ);
  bounds.max.set(maxX, maxY, maxZ);
  return bounds;
};

const _iterateVertices = (vertices: number[][], matrices: number[][], cb: (v: Vector3) => void) => {
  const vertex = new Vector3();
  const matrix = new Matrix4();

  vertices.forEach((vertList, i) => {
    matrix.fromArray(matrices[i]!); // HACK
    for (let j = 0; j < vertList.length; j += 3) {
      vertex.set(vertList[j]!, vertList[j + 1]!, vertList[j + 2]!).applyMatrix4(matrix); // HACK!
      cb(vertex);
    }
  });
};
