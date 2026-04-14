import { BoxGeometry, Mesh } from "three";
import { describe, test, assert } from "vitest";
import { iterateGeometries } from "../index";

describe("Helper Methods", () => {
  test("iterateGeometries()", () => {
    const boxGeometry = new BoxGeometry(1, 1, 1, 1, 1, 1);
    const boxMesh = new Mesh(boxGeometry);
    const vertices: number[][] = [];
    const matrices: number[][] = [];
    const indexes: number[][] = [];
    iterateGeometries({
      root: boxMesh,
      cb: (vertexArray, matrixArray, indexArray) => {
        vertices.push(vertexArray);
        matrices.push(matrixArray);
        if (indexArray) indexes.push(indexArray);
      },
    });
    assert.equal(vertices.length, 1);
    assert.equal(matrices.length, 1);
    assert.equal(indexes.length, 1);
    assert.equal(vertices[0]?.length, 72);
    assert.equal(matrices[0]?.length, 16);
    assert.equal(indexes[0]?.length, 36);
  });
});
