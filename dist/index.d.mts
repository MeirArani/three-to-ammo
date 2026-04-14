import { Object3D, Quaternion, Vector3 } from "three";

//#region index.d.ts
declare const shapeTypes: readonly ["box", "cylinder", "sphere", "capsule", "cone", "hull", "hacd", "vhacd", "mesh", "heightfield"];
type ShapeType = (typeof shapeTypes)[number];
type AmmoShapeType = Ammo.btBoxShape | Ammo.btCylinderShape | Ammo.btCapsuleShape | Ammo.btConeShape | Ammo.btSphereShape | Ammo.btConvexHullShape | Ammo.btConvexHullShape[] | Ammo.btTriangleMeshShape | Ammo.btHeightfieldTerrainShape;
declare enum PHY_ScalarType {
  PHY_FLOAT = 0,
  PHY_DOUBLE = 1,
  PHY_INTEGER = 2,
  PHY_SHORT = 3,
  PHY_FIXEDPOINT88 = 4,
  PHY_UCHAR = 5
}
interface GeneralShapeOptions {
  halfExtents: Vector3;
  minHalfExtent: number;
  maxHalfExtent: number;
  offset: Vector3;
  orientation: Quaternion;
  margin: number;
}
interface ShapeOptionsGeneral {
  offset?: Vector3;
  margin?: number;
  orientation?: Quaternion;
}
interface ShapeOptionsAll extends ShapeOptionsGeneral {
  fit: "all";
  vertices: number[][];
  matrices: number[][];
  matrixWorld: number[];
  minHalfExtent?: number;
  maxHalfExtent?: number;
}
interface ShapeOptionsManual extends ShapeOptionsGeneral {
  fit: "manual";
  halfExtents: Vector3;
}
type BoxOptions = (ShapeOptionsAll | ShapeOptionsManual) & {
  type: "box";
};
type CircularOptions = (ShapeOptionsAll | ShapeOptionsManual) & {
  cylinderAxis?: "x" | "y" | "z";
};
type CylinderOptions = CircularOptions & {
  type: "cylinder";
};
type CapsuleOptions = CircularOptions & {
  type: "capsule";
};
type ConeOptions = CircularOptions & {
  type: "cone";
};
type SphereOptions = {
  type: "sphere";
  cylinderAxis?: "x" | "y" | "z";
} & ((ShapeOptionsManual & {
  sphereRadius: number;
}) | ShapeOptionsAll);
interface ShapeOptionsIndexed extends ShapeOptionsGeneral {
  matrixWorld: number[];
  vertices: number[][];
  matrices: number[][];
  indexes: number[][];
}
interface HullOptions extends Omit<ShapeOptionsIndexed, "indexes"> {
  type: "hull";
  maxVertices: number;
}
interface HACDOptions extends ShapeOptionsIndexed {
  type: "hacd";
  compacityWeight?: number;
  volumeWeight?: number;
  nVerticesPerCH?: number;
  concavity?: number;
  nClusters?: number;
}
interface VHACDOptions extends ShapeOptionsIndexed {
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
interface TriMeshOptions extends ShapeOptionsIndexed {
  type: "mesh";
}
interface HeightfieldOptions extends ShapeOptionsGeneral {
  type: "heightfield";
  heightfieldDistance?: number;
  heightfieldData: number[][];
  heightScale?: number;
  upAxis?: "x" | "y" | "z";
  heightDataType?: PHY_ScalarType.PHY_FLOAT | PHY_ScalarType.PHY_SHORT | PHY_ScalarType.PHY_UCHAR;
  flipQuadEdges?: boolean;
}
type ShapeOptions = BoxOptions | CylinderOptions | CapsuleOptions | ConeOptions | SphereOptions | HullOptions | HACDOptions | VHACDOptions | TriMeshOptions | HeightfieldOptions;
declare function createCollisionShapes(options: ShapeOptions): Ammo.btCollisionShape[];
declare function createBoxShape(options: BoxOptions): any;
declare function createCylinderShape(options: CylinderOptions): any;
declare function createCapsuleShape(options: CapsuleOptions): any;
declare function createConeShape(options: ConeOptions): any;
declare function createSphereShape(options: SphereOptions): any;
declare function createHullShape({
  vertices,
  matrices,
  maxVertices,
  matrixWorld,
  margin,
  orientation,
  offset
}: HullOptions): any;
declare function createHACDShapes({
  matrixWorld,
  vertices,
  matrices,
  indexes,
  offset,
  orientation,
  margin,
  compacityWeight,
  volumeWeight,
  nVerticesPerCH,
  concavity,
  nClusters
}: HACDOptions): Ammo.btConvexHullShape[];
declare function createVHACDShapes({
  matrixWorld,
  vertices,
  matrices,
  indexes,
  offset,
  orientation,
  margin,
  resolution,
  depth,
  concavity,
  planeDownsampling,
  convexhullDownsampling,
  alpha,
  beta,
  gamma,
  pca,
  mode,
  maxNumVerticesPerCH,
  minVolumePerCH,
  convexhullApproximation,
  oclAcceleration
}: VHACDOptions): any[];
declare function createTriMeshShape({
  matrixWorld,
  vertices,
  matrices,
  indexes,
  offset,
  orientation,
  margin
}: TriMeshOptions): any;
declare function createHeightfieldTerrainShape({
  offset,
  orientation,
  margin,
  heightfieldDistance,
  heightfieldData,
  heightScale,
  upAxis,
  // x = 0; y = 1; z = 2
  heightDataType,
  flipQuadEdges
}: HeightfieldOptions): any;
declare const iterateGeometries: ({
  root,
  includeInvisible,
  cb
}: {
  root: Object3D;
  includeInvisible?: boolean;
  cb: (vertexArray: number[], matrixArray: number[], indexArray: number[] | []) => void;
}) => void;
//#endregion
export { AmmoShapeType, BoxOptions, CapsuleOptions, CircularOptions, ConeOptions, CylinderOptions, GeneralShapeOptions, HACDOptions, HeightfieldOptions, HullOptions, ShapeOptions, ShapeOptionsAll, ShapeOptionsGeneral, ShapeOptionsManual, ShapeType, SphereOptions, TriMeshOptions, VHACDOptions, createBoxShape, createCapsuleShape, createCollisionShapes, createConeShape, createCylinderShape, createHACDShapes, createHeightfieldTerrainShape, createHullShape, createSphereShape, createTriMeshShape, createVHACDShapes, iterateGeometries, shapeTypes };
//# sourceMappingURL=index.d.mts.map