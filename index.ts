import { Box3, BufferGeometry, InterleavedBufferAttribute, Material, Matrix4, Mesh, Object3D, Quaternion, Vector3, type Object3DEventMap } from "three";
import * as AmmoLib  from "@hubs/ammo.js";
const ammo = await AmmoLib.default.bind(window)() as typeof AmmoLib;


export const shapeTypes = ["box", "cylinder", "sphere", "capsule", "cone", "hull", "hacd", "vhacd", "mesh", "heightfield"] as const;
export type ShapeType = typeof shapeTypes[number];

enum PHY_ScalarType {
  PHY_FLOAT = 0,
  PHY_DOUBLE = 1,
  PHY_INTEGER = 2,
  PHY_SHORT = 3 ,
  PHY_FIXEDPOINT88 = 4,
  PHY_UCHAR = 5
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
}


// BOX SHAPE
//TODO: support gimpact (dynamic trimesh) and heightmap

// all: requires vertices & matrices
// manual: doesn't require vertices & matrices
export function createBoxShape(
  {
    fit = "all", 
    matrixWorld,
    vertices = [], 
    matrices = [], 
    halfExtents = new Vector3(),
    minHalfExtent = 0,
    maxHalfExtent = Number.POSITIVE_INFINITY,
    offset = new Vector3(),
    orientation = new Quaternion(),
    margin = 0.01,
  }: 
  {
    fit: "all" | "manual",
    matrixWorld: number[]
    vertices?: number[][],
    matrices?: number[][];
    halfExtents?: Vector3;
    minHalfExtent?: number;
    maxHalfExtent?: number;
    offset?: Vector3;
    orientation?: Quaternion;
    margin?: number;
  }){
  if (fit === "all") {
    halfExtents = _computeHalfExtents(
      _computeBounds(vertices, matrices),
      minHalfExtent, 
      maxHalfExtent
    );
  }

  const btHalfExtents = new ammo.btVector3(halfExtents.x, halfExtents.y, halfExtents.z);
  const collisionShape = new ammo.btBoxShape(btHalfExtents);
  ammo.destroy(btHalfExtents);

  _finishCollisionShape({
    shape: collisionShape, 
    scale: fit === "all" ? _computeScale(matrixWorld) : new Vector3(1,1,1),
    margin: margin,
    offset: offset,
    orientation: orientation
  });
  return collisionShape;
};

// CYLINDER SHAPE

export function createCylinderShape(
  {
    fit = "all", 
    matrixWorld,
    vertices = [], 
    matrices = [], 
    halfExtents = new Vector3(),
    minHalfExtent = 0,
    maxHalfExtent = Number.POSITIVE_INFINITY,
    offset = new Vector3(),
    orientation = new Quaternion(),
    margin = 0.01,
    cylinderAxis = "y"
  }: 
  {
    fit: "all" | "manual",
    matrixWorld: number[]
    vertices?: number[][],
    matrices?: number[][];
    halfExtents?: Vector3;
    minHalfExtent?: number;
    maxHalfExtent?: number;
    offset?: Vector3;
    orientation?: Quaternion;
    margin?: number;
    cylinderAxis?: "x" | "y" | "z"
  }){

  if (fit === "all") {
    halfExtents = _computeHalfExtents(
      _computeBounds(vertices, matrices),
      minHalfExtent,
      maxHalfExtent
    );
  }

  const btHalfExtents = new ammo.btVector3(halfExtents.x, halfExtents.y, halfExtents.z);
  const collisionShape = (() => {
    switch (cylinderAxis) {
      case "y":
        return new ammo.btCylinderShape(btHalfExtents);
      case "x":
        return new ammo.btCylinderShapeX(btHalfExtents);
      case "z":
        return new ammo.btCylinderShapeZ(btHalfExtents);
    }
  })();
  ammo.destroy(btHalfExtents);

  _finishCollisionShape({
    shape: collisionShape, 
    scale: fit === "all" ? _computeScale(matrixWorld) : new Vector3(1,1,1),
    margin: margin,
    offset: offset,
    orientation: orientation
  });
  return collisionShape;
};

export function createCapsuleShape(
  {
    fit = "all", 
    matrixWorld,
    vertices = [], 
    matrices = [], 
    halfExtents = new Vector3(),
    minHalfExtent = 0,
    maxHalfExtent = Number.POSITIVE_INFINITY,
    offset = new Vector3(),
    orientation = new Quaternion(),
    margin = 0.01,
    cylinderAxis = "y"
  }: 
  {
    fit: "all" | "manual",
    matrixWorld: number[]
    vertices?: number[][],
    matrices?: number[][];
    halfExtents?: Vector3;
    minHalfExtent?: number;
    maxHalfExtent?: number;
    offset?: Vector3;
    orientation?: Quaternion;
    margin?: number;
    cylinderAxis?: "x" | "y" | "z"
  }){

  if (fit === "all") {
    halfExtents = _computeHalfExtents(
      _computeBounds(vertices, matrices),
      minHalfExtent,
      maxHalfExtent
    );
  }

  const { x, y, z } = halfExtents;
  const collisionShape = (() => {
    switch (cylinderAxis) {
      case "y":
        return new ammo.btCapsuleShape(Math.max(x, z), y * 2);
      case "x":
        return new ammo.btCapsuleShapeX(Math.max(y, z), x * 2);
      case "z":
        return new ammo.btCapsuleShapeZ(Math.max(x, y), z * 2);
    }
  })();

   _finishCollisionShape({
    shape: collisionShape, 
    scale: fit === "all" ? _computeScale(matrixWorld) : new Vector3(1,1,1),
    margin: margin,
    offset: offset,
    orientation: orientation
  });
  return collisionShape;
};

// CONE SHAPE

export function createConeShape(
{
    fit = "all", 
    matrixWorld,
    vertices = [], 
    matrices = [], 
    halfExtents = new Vector3(),
    minHalfExtent = 0,
    maxHalfExtent = Number.POSITIVE_INFINITY,
    offset = new Vector3(),
    orientation = new Quaternion(),
    margin = 0.01,
    cylinderAxis = "y"
  }: 
  {
    fit: "all" | "manual",
    matrixWorld: number[]
    vertices?: number[][],
    matrices?: number[][];
    halfExtents?: Vector3;
    minHalfExtent?: number;
    maxHalfExtent?: number;
    offset?: Vector3;
    orientation?: Quaternion;
    margin?: number;
    cylinderAxis?: "x" | "y" | "z"
  }){

  if (fit === "all") {
    halfExtents = _computeHalfExtents(
      _computeBounds(vertices, matrices),
      minHalfExtent,
      maxHalfExtent
    );
  }

  const { x, y, z } = halfExtents;
  const collisionShape = (() => {
    switch (cylinderAxis) {
      case "y":
        return new ammo.btConeShape(Math.max(x, z), y * 2);
      case "x":
        return new ammo.btConeShapeX(Math.max(y, z), x * 2);
      case "z":
        return new ammo.btConeShapeZ(Math.max(x, y), z * 2);
    }
  })();

  _finishCollisionShape({
    shape: collisionShape, 
    scale: fit === "all" ? _computeScale(matrixWorld) : new Vector3(1,1,1),
    margin: margin,
    offset: offset,
    orientation: orientation
  });
  return collisionShape;
};

// SPHERE SHAPE

export function createSphereShape(
    {
    fit = "all", 
    matrixWorld,
    vertices = [], 
    matrices = [], 
    offset = new Vector3(),
    orientation = new Quaternion(),
    margin = 0.01,
    sphereRadius = 1
  }: 
  {
    fit: "all" | "manual",
    matrixWorld: number[]
    vertices?: number[][],
    matrices?: number[][];
    offset?: Vector3;
    orientation?: Quaternion;
    margin?: number;
    sphereRadius?: number;
  }){

  const radius = 
  fit === "manual" 
    ? sphereRadius 
    : _computeRadius(vertices, matrices, _computeBounds(vertices, matrices));

  const collisionShape = new ammo.btSphereShape(radius);
  _finishCollisionShape({
    shape: collisionShape, 
    scale: fit === "all" ? _computeScale(matrixWorld) : new Vector3(1,1,1),
    margin: margin,
    offset: offset,
    orientation: orientation
  });

  return collisionShape;
};


// HULL SHAPE

export function createHullShape(
  {
    matrixWorld,
    vertices, 
    matrices, 
    halfExtents = new Vector3(),
    minHalfExtent = 0,
    maxHalfExtent = Number.POSITIVE_INFINITY,
    offset = new Vector3(),
    orientation = new Quaternion(),
    margin = 0.01,
    maxVertices = 100000,
    compacityWeight = 0.0001,
    volumeWeight = 0,
    nClusters = 1,
    nVerticesPerCH = 100,
    concavity = 100
  
  }: 
  {
    matrixWorld: number[]
    vertices: number[][],
    matrices: number[][];
    halfExtents?: Vector3;
    minHalfExtent?: number;
    maxHalfExtent?: number;
    offset?: Vector3;
    orientation?: Quaternion;
    margin?: number;
    maxVertices?: number;
    compacityWeight?: number;
    volumeWeight?: number;
    nClusters?: number;
    nVerticesPerCH?: number;
    concavity?: number;
  }){

  const vertex = new Vector3();
  const center = new Vector3();
  const matrix = new Matrix4();

  const bounds = _computeBounds(vertices, matrices);

  const btVertex = new ammo.btVector3();
  const originalHull = new ammo.btConvexHullShape();
  originalHull.setMargin(margin);
  center.addVectors(bounds.max, bounds.min).multiplyScalar(0.5);

  let vertexCount = 0;
  vertices.forEach(vertList => {
    vertexCount += vertList.length / 3;
  })
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
    })

    let collisionShape = originalHull;
    if (originalHull.getNumVertices() >= 100) {
      //Bullet documentation says don't use convexHulls with 100 verts or more
      const shapeHull = new ammo.btShapeHull(originalHull);
      shapeHull.buildHull(margin);
      ammo.destroy(originalHull);

      // Need to get a raw pointer style array (number[] in js)
      // First get the vertex pointer from shapeHull, then get the actual pointer address offset value 
      // Then grab the section of the heap that spans from pointer start (vertexPointer) to pointer end (vertexPointer + number of verticies)
      // Don't forget to divide each offset by 8! (convert bits to bytes).
      const vertexPointer = ammo.getPointer(shapeHull.getVertexPointer());
      const vertexArray = Array.from(
        ammo.HEAPF64.subarray(vertexPointer/8, vertexPointer/8 + shapeHull.numVertices()));

      collisionShape = new ammo.btConvexHullShape(
      vertexArray, // TODO: INVESTIGATE
        shapeHull.numVertices()
      );
      ammo.destroy(shapeHull); // btConvexHullShape makes a copy
    }

    ammo.destroy(btVertex);

    _finishCollisionShape({
      shape: collisionShape, 
      scale: _computeScale(matrixWorld),
      margin: margin,
      offset: offset,
      orientation: orientation
    });
    return collisionShape;
  }



// HACD SHAPE

export interface HACDOptions {
  compacityWeight: number;
  volumeWeight: number;
  nVerticesPerCH: number;
  concavity: number;
  nClusters: number;
}
export function createHACDShapes(
  {
    matrixWorld,
    vertices, 
    matrices, 
    indexes,
    halfExtents = new Vector3(),
    minHalfExtent = 0,
    maxHalfExtent = Number.POSITIVE_INFINITY,
    offset = new Vector3(),
    orientation = new Quaternion(),
    margin = 0.01,
    compacityWeight = 0.0001,
    volumeWeight = 0,
    nVerticesPerCH = 100,
    concavity = 100,
    nClusters = 1
  }: 
  {
    matrixWorld: number[]
    vertices: number[][],
    matrices: number[][];
    indexes: number[][];
    halfExtents?: Vector3;
    minHalfExtent?: number;
    maxHalfExtent?: number;
    offset?: Vector3;
    orientation?: Quaternion;
    margin?: number;
    compacityWeight?: number;
    volumeWeight?: number;
    nVerticesPerCH?: number;
    concavity?: number;
    nClusters?: number;
  }){
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

    const hacd = new ammo.HACD();
    hacd.SetCompacityWeight(compacityWeight);
    hacd.SetVolumeWeight(volumeWeight);
    hacd.SetNClusters(nClusters);
    hacd.SetNVerticesPerCH(nVerticesPerCH);
    hacd.SetConcavity(concavity);

    const vertexPointer = ammo._malloc(vertexCount * 3 * 8);
    const trianglePointer = ammo._malloc(triCount * 3 * 4);
    hacd.SetPoints(ammo.wrapPointer(vertexPointer, ammo.Vec3Real));
    hacd.SetTriangles(ammo.wrapPointer(trianglePointer, ammo.Vec3Long));
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
        ammo.HEAPF64[vptr + 0 ] = vector.x;
        ammo.HEAPF64[vptr + 1] = vector.y;
        ammo.HEAPF64[vptr + 2] = vector.z;
        vptr += 3;
      }
      if (indexes[i]) {
        indexes[i].forEach((index, j) => {
          ammo.HEAP32[tptr] =  index;
          tptr++;
        })
      } else {
        for (let j = 0; j < components.length / 3; j++) {
          ammo.HEAP32[tptr] = j;
          tptr++;
        }
      }
    })

    hacd.Compute();
    ammo._free(vertexPointer);
    ammo._free(trianglePointer);
    const currentNClusters = hacd.GetNClusters();

    const shapes: AmmoLib.btConvexHullShape[] = [];
    for (let i = 0; i < nClusters; i++) {
      const hull = new ammo.btConvexHullShape();
      hull.setMargin(margin);
      const nPoints = hacd.GetNPointsCH(i);
      const nTriangles = hacd.GetNTrianglesCH(i);
      const hullPointsPointer = ammo._malloc(nPoints * 3 * 8);
      const hullTrianglesPointer = ammo._malloc(nTriangles * 3 * 4);
      hacd.GetCH(i, ammo.wrapPointer(hullPointsPointer, ammo.Vec3Real), ammo.wrapPointer(hullTrianglesPointer, ammo.Vec3Long));

      for (let pi = 0; pi < nPoints; pi++) {
        const btVertex = new ammo.btVector3();
        const px = ammo.HEAPF64[hullPointsPointer/8 + pi * 3 + 0]!; // HACK!
        const py = ammo.HEAPF64[hullPointsPointer/8 + pi * 3 + 1]!;
        const pz = ammo.HEAPF64[hullPointsPointer/8 + pi * 3 + 2]!;
        btVertex.setValue(px, py, pz);
        hull.addPoint(btVertex, pi === nPoints - 1);
        ammo.destroy(btVertex);
      }

      // TODO: Free Pointers?
      _finishCollisionShape({
        shape: hull, 
        scale: scale,
        margin: margin,
        offset: offset,
        orientation: orientation
      });
      shapes.push(hull);
    }

    return shapes;
  }

// VHACD SHAPE

//https://kmamou.blogspot.com/2014/12/v-hacd-20-parameters-description.html
export interface VHACDOptions {
  resolution: number;
  depth: number;
  concavity: number;
  planeDownsampling: number;
  convexhullDownsampling: number;
  alpha: number;
  beta: number;
  gamma: number;
  pca: 0 | 1;
  mode: 0 | 1;
  maxNumVerticesPerCH: number;
  minVolumePerCH: number;
  convexhullApproximation: 0 | 1;
  oclAcceleration: 0 | 1;
}

export function createVHACDShapes(
  {
    matrixWorld,
    vertices, 
    matrices, 
    indexes,
    halfExtents = new Vector3(),
    minHalfExtent = 0,
    maxHalfExtent = Number.POSITIVE_INFINITY,
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
    oclAcceleration = 0
  }: 
  {
    matrixWorld: number[]
    vertices: number[][],
    matrices: number[][];
    indexes: number[][];
    halfExtents: Vector3;
    minHalfExtent: number;
    maxHalfExtent: number;
    offset: Vector3;
    orientation: Quaternion;
    margin: number;
    resolution: number;
    depth: number;
    concavity: number;
    planeDownsampling: number;
    convexhullDownsampling: number;
    alpha: number;
    beta: number;
    gamma: number;
    pca: 0 | 1;
    mode: 0 | 1;
    maxNumVerticesPerCH: number;
    minVolumePerCH: number;
    convexhullApproximation: 0 | 1;
    oclAcceleration: 0 | 1;
  }){
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
    })

    const vhacd = new ammo.VHACD();
    const params = new ammo.Parameters();
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

    const vertsPointer = ammo._malloc(vertexCount * 3 * 8 + 3);
    const trisPointer = ammo._malloc(triCount * 3 * 4);

    
    let pptr = vertsPointer / 8;
    let tptr = trisPointer / 4;

    vertices.forEach((components, i) => {
      matrix.fromArray(matrices[i]!); // HACK
      for (let j = 0; j < components.length; j += 3) {
        vector
          .set(components[j + 0]!, components[j + 1]!, components[j + 2]!) // HACK
          .applyMatrix4(matrix)
          .sub(center);
        ammo.HEAPF64[pptr + 0] = vector.x;
        ammo.HEAPF64[pptr + 1] = vector.y;
        ammo.HEAPF64[pptr + 2] = vector.z;
        pptr += 3;
      }
      if (indexes[i]) {
        indexes[i].forEach(index => {
          ammo.HEAP32[tptr] = index;
          tptr++;
        })
      } else {
        for (let j = 0; j < components.length / 3; j++) {
          ammo.HEAP32[tptr] = j;
          tptr++;
        }
      }
    })

    // The code is expecting a raw pointer for the verts/tris, which translates to a number[] in JS land
    // Emscripten doesn't play well with raw pointers, so we have to handle the translation manually
    // The gist is to set the memory manually with malloc and HEAP manipulation (as done above)
    // The memory is set, but we still need to pass a proper number[] in Typescript land to the method below
    // We know where the array starts (vertsPointer, divided by 8 to translate from bits to bytes)
    // And we know where the array ends (pptr, which we used to set the array above)
    // So we can just subset the Heap array from the starting point to the ending point!
    // See more:
    // https://stackoverflow.com/questions/17883799/how-to-handle-passing-returning-array-pointers-to-emscripten-compiled-code
    const vertsArray = Array.from(ammo.HEAPF64.subarray(vertsPointer/8, pptr));
    const trisArray = Array.from(ammo.HEAPF64.subarray(trisPointer / 4, tptr));
    vhacd.Compute(vertsArray, 3, vertexCount, trisArray, 3, triCount, params);
    ammo._free(vertsPointer);
    ammo._free(trisPointer);
    const nHulls = vhacd.GetNConvexHulls();

    const shapes = [];
    const ch = new ammo.ConvexHull();
    for (let i = 0; i < nHulls; i++) {
      vhacd.GetConvexHull(i, ch);
      const nPoints = ch.get_m_nPoints();

      const hull = new ammo.btConvexHullShape();
      hull.setMargin(margin);

      for (let pi = 0; pi < nPoints; pi++) {
        const btVertex = new ammo.btVector3();
        const px = ch.get_m_points(pi * 3 + 0);
        const py = ch.get_m_points(pi * 3 + 1);
        const pz = ch.get_m_points(pi * 3 + 2);
        btVertex.setValue(px, py, pz);
        hull.addPoint(btVertex, pi === nPoints - 1);
        ammo.destroy(btVertex);
      }

      _finishCollisionShape({
        shape: hull, 
        scale: scale,
        margin: margin,
        offset: offset,
        orientation: orientation
      });
      shapes.push(hull);
    }
    ammo.destroy(ch);
    ammo.destroy(vhacd);

    return shapes;
  }


  // TRIMESH SHAPE

export function createTriMeshShape(
{
    matrixWorld,
    vertices, 
    matrices, 
    indexes,
    halfExtents = new Vector3(),
    minHalfExtent = 0,
    maxHalfExtent = Number.POSITIVE_INFINITY,
    offset = new Vector3(),
    orientation = new Quaternion(),
    margin = 0.01,
  }: 
  {
    matrixWorld: number[]
    vertices: number[][],
    matrices: number[][];
    indexes: number[][];
    halfExtents?: Vector3;
    minHalfExtent?: number;
    maxHalfExtent?: number;
    offset?: Vector3;
    orientation?: Quaternion;
    margin?: number;
  }){
  const va = new Vector3();
  const vb = new Vector3();
  const vc = new Vector3();
  const matrix = new Matrix4();


    const scale = _computeScale(matrixWorld);

    const bta = new ammo.btVector3();
    const btb = new ammo.btVector3();
    const btc = new ammo.btVector3();
    const triMesh = new ammo.btTriangleMesh(true, false);

    vertices.forEach((components, i) => {
      const index = indexes[i] ? indexes[i] : null;
      matrix.fromArray(matrices[i]!); // HACK
      if (index) {
        for (let j = 0; j < index.length; j += 3) { // HACK city
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
    })
    
    const localScale = new ammo.btVector3(scale.x, scale.y, scale.z);
    triMesh.setScaling(localScale);
    ammo.destroy(localScale);

    const collisionShape = new ammo.btBvhTriangleMeshShape(triMesh, true, true);
    collisionShape.resources = [triMesh];

    ammo.destroy(bta);
    ammo.destroy(btb);
    ammo.destroy(btc);

    _finishCollisionShape({
    shape: collisionShape, 
    margin: margin,
    offset: offset,
    orientation: orientation
  });
    return collisionShape;
}

// HEIGHTFIELD SHAPE

export interface HeightfieldOptions {
  heightfieldDistance: number;
  heightfieldData: number[][];
  heightScale: number;
  upAxis: "x" | "y" | "z"; // x = 0; y = 1; z = 2
  heightDataType: PHY_ScalarType.PHY_FLOAT | PHY_ScalarType.PHY_SHORT | PHY_ScalarType.PHY_UCHAR;
  flipQuadEdges: boolean;
}

export function createHeightfieldTerrainShape(
  {
    halfExtents = new Vector3(),
    minHalfExtent = 0,
    maxHalfExtent = Number.POSITIVE_INFINITY,
    offset = new Vector3(),
    orientation = new Quaternion(),
    margin = 0.01,
    heightfieldDistance = 1,
    heightfieldData = [],
    heightScale = 0,
    upAxis = "y", // x = 0; y = 1; z = 2
    heightDataType = PHY_ScalarType.PHY_FLOAT,
    flipQuadEdges = true,
  }: 
  {
    halfExtents?: Vector3;
    minHalfExtent?: number;
    maxHalfExtent?: number;
    offset?: Vector3;
    orientation?: Quaternion;
    margin?: number;
    heightfieldDistance?: number;
    heightfieldData: number[][];
    heightScale?: number;
    upAxis?: "x" | "y" | "z"; // x = 0; y = 1; z = 2
    heightDataType?: PHY_ScalarType.PHY_FLOAT | PHY_ScalarType.PHY_SHORT | PHY_ScalarType.PHY_UCHAR;
    flipQuadEdges?: boolean;
  }) {
  const heightStickLength = heightfieldData.length;
  const heightStickWidth = heightStickLength > 0 && heightfieldData[0] ? heightfieldData[0].length : 0;

  const data = ammo._malloc(heightStickLength * heightStickWidth * 4);
  const ptr = data / 4;

  let minHeight = Number.POSITIVE_INFINITY;
  let maxHeight = Number.NEGATIVE_INFINITY;
  let index = 0;
  for (let l = 0; l < heightStickLength; l++) {
    for (let w = 0; w < heightStickWidth; w++) {
      const height =  heightfieldData[l]![w] || 0; // HACK!
      ammo.HEAPF32[ptr + index] = height;
      index++;
      minHeight = Math.min(minHeight, height);
      maxHeight = Math.max(maxHeight, height);
    }
  }

  const collisionShape = new ammo.btHeightfieldTerrainShape(
    heightStickWidth,
    heightStickLength,
    data,
    heightScale,
    minHeight,
    maxHeight,
    upAxis === "x" ? 0 : upAxis === "y" ? 1 : 2, // x = 0; y = 1; z = 2
    heightDataType,
    flipQuadEdges
  );

  const scale = new ammo.btVector3(heightfieldDistance, 1, heightfieldDistance);
  collisionShape.setLocalScaling(scale);
  ammo.destroy(scale);

  // TODO: INVESTIGATE
  // collisionShape.heightfieldData = data;

    _finishCollisionShape({
    shape: collisionShape, 
    margin: margin,
    offset: offset,
    orientation: orientation
  });
  return collisionShape;
};


function _finishCollisionShape(
  {
    shape, 
    scale = new Vector3(1,1,1), 
    margin = 0.01, 
    offset = new Vector3(), 
    orientation = new Quaternion()}: 
  {
    shape: AmmoLib.btCollisionShape; 
    scale?: Vector3;
    margin?: number;
    offset?: Vector3;
    orientation?: Quaternion;
  }
  ){
  // TODO: INVESTIGATE
  //collisionShape.type = options.type;
  shape.setMargin(margin);
  shape.destroy = () => {
    for (let res of shape.resources || []) {
      ammo.destroy(res);
    }
    if (shape.heightfieldData) {
      ammo._free(shape.heightfieldData);
    }
    ammo.destroy(shape);
  };

  const localTransform = new ammo.btTransform();
  const rotation = new ammo.btQuaternion(0,0,0,0);
  localTransform.setIdentity();

  localTransform.getOrigin().setValue(offset.x, offset.y, offset.z);
  rotation.setValue(orientation.x, orientation.y, orientation.z, orientation.w);

  localTransform.setRotation(rotation);
  ammo.destroy(rotation);

  const localScale = new ammo.btVector3(scale.x, scale.y, scale.z);
  shape.setLocalScaling(localScale);
  ammo.destroy(localScale);

  shape.localTransform = localTransform;
};

const isObjectVisibleUpToRoot = (object: Object3D, root?: Object3D) => {
  if (!object.visible) return false;

  if (object.parent && object.parent !== root) {
    return isObjectVisibleUpToRoot(object.parent);
  }

  return true;
};
export const iterateGeometries = (
  { 
    root, 
    includeInvisible = false, 
    cb} : 
  {
    root: Object3D;
    includeInvisible?: boolean, 
    cb: (vertexArray: number[], matrixArray: number[], indexArray: number[] | [] ) => void
  }) => {
  const inverse = new Matrix4();
    inverse.copy(root.matrixWorld).invert();
    root.traverse(mesh => {
      if(
        !(mesh instanceof Mesh) 
        || mesh.name === "Sky" 
        || !includeInvisible && !isObjectVisibleUpToRoot(mesh, root)
      ) return;
      const narrowMesh = mesh as Mesh<BufferGeometry, Material, Object3DEventMap> // HACK
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
  }

const _computeScale = (matrixWorld: number[]) => {
  const matrix = new Matrix4();
    const scale = new Vector3(1, 1, 1);
    matrix.fromArray(matrixWorld);
    scale.setFromMatrixScale(matrix);
    return scale;
  }

const _computeRadius = (vertices: number[][], matrices: number[][], bounds: Box3) => {
  const center = new Vector3();
  let maxRadiusSq = 0;
  let { x: cx, y: cy, z: cz } = bounds.getCenter(center);

  _iterateVertices(vertices, matrices, v => {
    const dx = cx - v.x;
    const dy = cy - v.y;
    const dz = cz - v.z;
    maxRadiusSq = Math.max(maxRadiusSq, dx * dx + dy * dy + dz * dz);
  });
  return Math.sqrt(maxRadiusSq);
}

const _computeHalfExtents = (bounds: Box3, minHalfExtent: number, maxHalfExtent: number) => {
  const halfExtents = new Vector3();
  return halfExtents
    .subVectors(bounds.max, bounds.min)
    .multiplyScalar(0.5)
    .clampScalar(minHalfExtent, maxHalfExtent);
};

// returns the bounding box for the geometries underneath `root`.
const _computeBounds = function(vertices: number[][], matrices: number[][]) {
  const bounds = new Box3();
  let minX = +Infinity;
  let minY = +Infinity;
  let minZ = +Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  bounds.min.set(0, 0, 0);
  bounds.max.set(0, 0, 0);

  _iterateVertices(vertices, matrices, v => {
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
    
}