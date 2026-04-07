import {
  iterateGeometries,
  createBoxShape,
  createCylinderShape,
  createCapsuleShape,
  createConeShape,
  createSphereShape,
  createHullShape,
  createTriMeshShape,
  createHeightfieldTerrainShape,
  createHACDShapes
} from "../index";
import { describe, it, suite, test, assert, beforeAll } from "vitest";
import { BoxGeometry, Matrix4, Mesh, Vector3 } from "three";

suite("Shape Tests", () => {
  describe("with fit === 'manual'", () => {
    const matrixWorld = new Matrix4();
    it("should createBoxShape()", () => {
      const shape = createBoxShape({
        fit: "manual",
        matrixWorld: matrixWorld.elements,
        halfExtents: new Vector3(1, 1, 1)
      });
      assert.notEqual(shape, null);
      shape.destroy();
    });
    it("should createCylinderShape()", () => {
      const shape = createCylinderShape({
        fit: "manual",
        matrixWorld: matrixWorld.elements,
        halfExtents: new Vector3(1, 1, 1)
      });
      assert.notEqual(shape, null);
      shape.destroy();
    });
    it("should createCapsuleShape()", () => {
      const shape = createCapsuleShape({
        fit: "manual",
        matrixWorld: matrixWorld.elements,
        halfExtents: new Vector3(1, 1, 1)
      });
      assert.notEqual(shape, null);
      shape.destroy();
    });
    it("should createConeShape()", () => {
      const shape = createConeShape({
        fit: "manual",
        matrixWorld: matrixWorld.elements,
        halfExtents: new Vector3(1, 1, 1)
      });
      assert.notEqual(shape, null);
      shape.destroy();
    });
    it("should createSphereShape()", () => {
      const shape = createSphereShape({
        fit: "manual",
        matrixWorld: matrixWorld.elements
      });
      assert.notEqual(shape, null);
      shape.destroy();
    });
  });
  describe("with fit === 'all'", () => {
    const matrixWorld = new Matrix4();
    const vertices: number[][] = [];
    const matrices: number[][] = [];
    const indexes: number[][] = [];
    beforeAll(() => {
      const boxGeometry = new BoxGeometry(1, 1, 1, 1, 1, 1);
      const boxMesh = new Mesh(boxGeometry);
      iterateGeometries({
        root: boxMesh,
        cb: (vertexArray, matrixArray, indexArray) => {
          vertices.push(vertexArray);
          matrices.push(matrixArray);
          indexes.push(indexArray);
        }
      });
    });
    it("should createBoxShape()", () => {
      const shape = createBoxShape({
        fit: "all",
        vertices: vertices,
        matrices: matrices,
        matrixWorld: matrixWorld.elements
      });
      assert.notEqual(shape, null);
      shape.destroy();
    });
    it("should createCylinderShape()", () => {
      const shape = createCylinderShape({
        fit: "all",
        vertices: vertices,
        matrices: matrices,
        matrixWorld: matrixWorld.elements
      });
      assert.notEqual(shape, null);
      shape.destroy();
    });
    it("should createCapsuleShape()", () => {
      const shape = createCapsuleShape({
        fit: "all",
        vertices: vertices,
        matrices: matrices,
        matrixWorld: matrixWorld.elements
      });
      assert.notEqual(shape, null);
      shape.destroy();
    });
    it("should createConeShape()", () => {
      const shape = createConeShape({
        fit: "all",
        vertices: vertices,
        matrices: matrices,
        matrixWorld: matrixWorld.elements
      });
      assert.notEqual(shape, null);
      shape.destroy();
    });
    it("should createSphereShape()", () => {
      const shape = createSphereShape({
        fit: "all",
        vertices: vertices,
        matrices: matrices,
        matrixWorld: matrixWorld.elements
      });
      assert.notEqual(shape, null);
      shape.destroy();
    });
    it("should createHullShape()", () => {
      const shape = createHullShape({
        vertices: vertices,
        matrices: matrices,
        matrixWorld: matrixWorld.elements
      });
      assert.notEqual(shape, null);
      shape.destroy();
    });
    it("should createHACDShapes()", () => {
      const shapes = createHACDShapes({
        vertices: vertices,
        matrices: matrices,
        indexes: indexes,
        matrixWorld: matrixWorld.elements
      });
      assert.notEqual(shapes.length, 0);
      shapes.forEach(shape => {
        shape.destroy();
      });
    });
    it("should createVHACDShapes()", () => {
      const shapes = createHACDShapes({
        vertices: vertices,
        matrices: matrices,
        indexes: indexes,
        matrixWorld: matrixWorld.elements
      });
      assert.notEqual(shapes.length, 0);
      shapes.forEach(shape => {
        shape.destroy();
      });
    });
    it("should createTriMeshShape()", () => {
      const shape = createTriMeshShape({
        vertices: vertices,
        matrices: matrices,
        indexes: indexes,
        matrixWorld: matrixWorld.elements
      });
      assert.notEqual(shape, null);
      shape.destroy();
    });
    it("should createHeightfieldTerrainShape()", () => {
      const shape = createHeightfieldTerrainShape({
        heightfieldData: [
          [0, 0, 0, 0],
          [0, 1, 1, 0],
          [0, 1, 1, 0],
          [0, 0, 0, 0]
        ]
      });
      assert.notEqual(shape, null);
      shape.destroy();
    });
  });
});
