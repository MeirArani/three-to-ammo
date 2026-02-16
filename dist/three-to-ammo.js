import * as w from "three";
const V = {
  BOX: "box",
  CYLINDER: "cylinder",
  SPHERE: "sphere",
  CAPSULE: "capsule",
  CONE: "cone",
  HULL: "hull",
  HACD: "hacd",
  //Hierarchical Approximate Convex Decomposition
  VHACD: "vhacd",
  //Volumetric Hierarchical Approximate Convex Decomposition
  MESH: "mesh",
  HEIGHTFIELD: "heightfield"
}, _ = {
  ALL: "all",
  //A single shape is automatically sized to bound all meshes within the entity.
  MANUAL: "manual"
  //A single shape is sized manually. Requires halfExtents or sphereRadius.
}, J = {
  short: "short",
  float: "float"
}, K = function(t, a, l, e, r = {}) {
  switch (r.type) {
    case V.BOX:
      return [j(t, a, e, r)];
    case V.CYLINDER:
      return [G(t, a, e, r)];
    case V.CAPSULE:
      return [v(t, a, e, r)];
    case V.CONE:
      return [B(t, a, e, r)];
    case V.SPHERE:
      return [X(t, a, e, r)];
    case V.HULL:
      return [Z(t, a, e, r)];
    case V.HACD:
      return Q(t, a, l, e, r);
    case V.VHACD:
      return k(t, a, l, e, r);
    case V.MESH:
      return [q(t, a, l, e, r)];
    case V.HEIGHTFIELD:
      return [W(r)];
    default:
      return console.warn(r.type + " is not currently supported"), [];
  }
}, j = function(t, a, l, e = {}) {
  e.type = V.BOX, p(e), e.fit === _.ALL && (e.halfExtents = T(
    I(t, a),
    e.minHalfExtent,
    e.maxHalfExtent
  ));
  const r = new Ammo.btVector3(e.halfExtents.x, e.halfExtents.y, e.halfExtents.z), m = new Ammo.btBoxShape(r);
  return Ammo.destroy(r), M(m, e, L(l, e)), m;
}, G = function(t, a, l, e = {}) {
  e.type = V.CYLINDER, p(e), e.fit === _.ALL && (e.halfExtents = T(
    I(t, a),
    e.minHalfExtent,
    e.maxHalfExtent
  ));
  const r = new Ammo.btVector3(e.halfExtents.x, e.halfExtents.y, e.halfExtents.z), m = (() => {
    switch (e.cylinderAxis) {
      case "y":
        return new Ammo.btCylinderShape(r);
      case "x":
        return new Ammo.btCylinderShapeX(r);
      case "z":
        return new Ammo.btCylinderShapeZ(r);
    }
    return null;
  })();
  return Ammo.destroy(r), M(m, e, L(l, e)), m;
}, v = function(t, a, l, e = {}) {
  e.type = V.CAPSULE, p(e), e.fit === _.ALL && (e.halfExtents = T(
    I(t, a),
    e.minHalfExtent,
    e.maxHalfExtent
  ));
  const { x: r, y: m, z: c } = e.halfExtents, n = (() => {
    switch (e.cylinderAxis) {
      case "y":
        return new Ammo.btCapsuleShape(Math.max(r, c), m * 2);
      case "x":
        return new Ammo.btCapsuleShapeX(Math.max(m, c), r * 2);
      case "z":
        return new Ammo.btCapsuleShapeZ(Math.max(r, m), c * 2);
    }
    return null;
  })();
  return M(n, e, L(l, e)), n;
}, B = function(t, a, l, e = {}) {
  e.type = V.CONE, p(e), e.fit === _.ALL && (e.halfExtents = T(
    I(t, a),
    e.minHalfExtent,
    e.maxHalfExtent
  ));
  const { x: r, y: m, z: c } = e.halfExtents, n = (() => {
    switch (e.cylinderAxis) {
      case "y":
        return new Ammo.btConeShape(Math.max(r, c), m * 2);
      case "x":
        return new Ammo.btConeShapeX(Math.max(m, c), r * 2);
      case "z":
        return new Ammo.btConeShapeZ(Math.max(r, m), c * 2);
    }
    return null;
  })();
  return M(n, e, L(l, e)), n;
}, X = function(t, a, l, e = {}) {
  e.type = V.SPHERE, p(e);
  let r;
  e.fit === _.MANUAL && !isNaN(e.sphereRadius) ? r = e.sphereRadius : r = $(t, a, I(t, a));
  const m = new Ammo.btSphereShape(r);
  return M(m, e, L(l, e)), m;
}, Z = (function() {
  const t = new w.Vector3(), a = new w.Vector3(), l = new w.Matrix4();
  return function(e, r, m, c = {}) {
    if (c.type = V.HULL, p(c), c.fit === _.MANUAL)
      return console.warn("cannot use fit: manual with type: hull"), null;
    const n = I(e, r), i = new Ammo.btVector3(), u = new Ammo.btConvexHullShape();
    u.setMargin(c.margin), a.addVectors(n.max, n.min).multiplyScalar(0.5);
    let d = 0;
    for (let y = 0; y < e.length; y++)
      d += e[y].length / 3;
    const g = c.hullMaxVertices || 1e5;
    d > g && console.warn(`too many vertices for hull shape; sampling ~${g} from ~${d} vertices`);
    const A = Math.min(1, g / d);
    for (let y = 0; y < e.length; y++) {
      const E = e[y];
      l.fromArray(r[y]);
      for (let x = 0; x < E.length; x += 3) {
        const f = y === e.length - 1 && x === E.length - 3;
        (Math.random() <= A || f) && (t.set(E[x], E[x + 1], E[x + 2]).applyMatrix4(l).sub(a), i.setValue(t.x, t.y, t.z), u.addPoint(i, f));
      }
    }
    let h = u;
    if (u.getNumVertices() >= 100) {
      const y = new Ammo.btShapeHull(u);
      y.buildHull(c.margin), Ammo.destroy(u), h = new Ammo.btConvexHullShape(
        Ammo.getPointer(y.getVertexPointer()),
        y.numVertices()
      ), Ammo.destroy(y);
    }
    return Ammo.destroy(i), M(h, c, L(m, c)), h;
  };
})(), Q = (function() {
  const t = new w.Vector3(), a = new w.Vector3(), l = new w.Matrix4();
  return function(e, r, m, c, n = {}) {
    if (n.type = V.HACD, p(n), n.fit === _.MANUAL)
      return console.warn("cannot use fit: manual with type: hacd"), [];
    if (!Ammo.hasOwnProperty("HACD"))
      return console.warn(
        "HACD unavailable in included build of Ammo.js. Visit https://github.com/mozillareality/ammo.js for the latest version."
      ), [];
    const i = I(e, r), u = L(c, n);
    let d = 0, g = 0;
    a.addVectors(i.max, i.min).multiplyScalar(0.5);
    for (let s = 0; s < e.length; s++)
      d += e[s].length / 3, m && m[s] ? g += m[s].length / 3 : g += e[s].length / 9;
    const A = new Ammo.HACD();
    n.hasOwnProperty("compacityWeight") && A.SetCompacityWeight(n.compacityWeight), n.hasOwnProperty("volumeWeight") && A.SetVolumeWeight(n.volumeWeight), n.hasOwnProperty("nClusters") && A.SetNClusters(n.nClusters), n.hasOwnProperty("nVerticesPerCH") && A.SetNVerticesPerCH(n.nVerticesPerCH), n.hasOwnProperty("concavity") && A.SetConcavity(n.concavity);
    const h = Ammo._malloc(d * 3 * 8), y = Ammo._malloc(g * 3 * 4);
    A.SetPoints(h), A.SetTriangles(y), A.SetNPoints(d), A.SetNTriangles(g);
    let E = h / 8, x = y / 4;
    for (let s = 0; s < e.length; s++) {
      const H = e[s];
      l.fromArray(r[s]);
      for (let o = 0; o < H.length; o += 3)
        t.set(H[o + 0], H[o + 1], H[o + 2]).applyMatrix4(l).sub(a), Ammo.HEAPF64[E + 0] = t.x, Ammo.HEAPF64[E + 1] = t.y, Ammo.HEAPF64[E + 2] = t.z, E += 3;
      if (m[s]) {
        const o = m[s];
        for (let b = 0; b < o.length; b++)
          Ammo.HEAP32[x] = o[b], x++;
      } else
        for (let o = 0; o < H.length / 3; o++)
          Ammo.HEAP32[x] = o, x++;
    }
    A.Compute(), Ammo._free(h), Ammo._free(y);
    const f = A.GetNClusters(), C = [];
    for (let s = 0; s < f; s++) {
      const H = new Ammo.btConvexHullShape();
      H.setMargin(n.margin);
      const o = A.GetNPointsCH(s), b = A.GetNTrianglesCH(s), P = Ammo._malloc(o * 3 * 8), S = Ammo._malloc(b * 3 * 4);
      A.GetCH(s, P, S);
      const N = P / 8;
      for (let O = 0; O < o; O++) {
        const D = new Ammo.btVector3(), z = Ammo.HEAPF64[N + O * 3 + 0], U = Ammo.HEAPF64[N + O * 3 + 1], Y = Ammo.HEAPF64[N + O * 3 + 2];
        D.setValue(z, U, Y), H.addPoint(D, O === o - 1), Ammo.destroy(D);
      }
      M(H, n, u), C.push(H);
    }
    return C;
  };
})(), k = (function() {
  const t = new w.Vector3(), a = new w.Vector3(), l = new w.Matrix4();
  return function(e, r, m, c, n = {}) {
    if (n.type = V.VHACD, p(n), n.fit === _.MANUAL)
      return console.warn("cannot use fit: manual with type: vhacd"), [];
    if (!Ammo.hasOwnProperty("VHACD"))
      return console.warn(
        "VHACD unavailable in included build of Ammo.js. Visit https://github.com/mozillareality/ammo.js for the latest version."
      ), [];
    const i = I(e, r), u = L(c, n);
    let d = 0, g = 0;
    a.addVectors(i.max, i.min).multiplyScalar(0.5);
    for (let o = 0; o < e.length; o++)
      d += e[o].length / 3, m && m[o] ? g += m[o].length / 3 : g += e[o].length / 9;
    const A = new Ammo.VHACD(), h = new Ammo.Parameters();
    n.hasOwnProperty("resolution") && h.set_m_resolution(n.resolution), n.hasOwnProperty("depth") && h.set_m_depth(n.depth), n.hasOwnProperty("concavity") && h.set_m_concavity(n.concavity), n.hasOwnProperty("planeDownsampling") && h.set_m_planeDownsampling(n.planeDownsampling), n.hasOwnProperty("convexhullDownsampling") && h.set_m_convexhullDownsampling(n.convexhullDownsampling), n.hasOwnProperty("alpha") && h.set_m_alpha(n.alpha), n.hasOwnProperty("beta") && h.set_m_beta(n.beta), n.hasOwnProperty("gamma") && h.set_m_gamma(n.gamma), n.hasOwnProperty("pca") && h.set_m_pca(n.pca), n.hasOwnProperty("mode") && h.set_m_mode(n.mode), n.hasOwnProperty("maxNumVerticesPerCH") && h.set_m_maxNumVerticesPerCH(n.maxNumVerticesPerCH), n.hasOwnProperty("minVolumePerCH") && h.set_m_minVolumePerCH(n.minVolumePerCH), n.hasOwnProperty("convexhullApproximation") && h.set_m_convexhullApproximation(n.convexhullApproximation), n.hasOwnProperty("oclAcceleration") && h.set_m_oclAcceleration(n.oclAcceleration);
    const y = Ammo._malloc(d * 3 * 8 + 3), E = Ammo._malloc(g * 3 * 4);
    let x = y / 8, f = E / 4;
    for (let o = 0; o < e.length; o++) {
      const b = e[o];
      l.fromArray(r[o]);
      for (let P = 0; P < b.length; P += 3)
        t.set(b[P + 0], b[P + 1], b[P + 2]).applyMatrix4(l).sub(a), Ammo.HEAPF64[x + 0] = t.x, Ammo.HEAPF64[x + 1] = t.y, Ammo.HEAPF64[x + 2] = t.z, x += 3;
      if (m[o]) {
        const P = m[o];
        for (let S = 0; S < P.length; S++)
          Ammo.HEAP32[f] = P[S], f++;
      } else
        for (let P = 0; P < b.length / 3; P++)
          Ammo.HEAP32[f] = P, f++;
    }
    A.Compute(y, 3, d, E, 3, g, h), Ammo._free(y), Ammo._free(E);
    const C = A.GetNConvexHulls(), s = [], H = new Ammo.ConvexHull();
    for (let o = 0; o < C; o++) {
      A.GetConvexHull(o, H);
      const b = H.get_m_nPoints();
      H.get_m_points();
      const P = new Ammo.btConvexHullShape();
      P.setMargin(n.margin);
      for (let S = 0; S < b; S++) {
        const N = new Ammo.btVector3(), O = H.get_m_points(S * 3 + 0), D = H.get_m_points(S * 3 + 1), z = H.get_m_points(S * 3 + 2);
        N.setValue(O, D, z), P.addPoint(N, S === b - 1), Ammo.destroy(N);
      }
      M(P, n, u), s.push(P);
    }
    return Ammo.destroy(H), Ammo.destroy(A), s;
  };
})(), q = (function() {
  const t = new w.Vector3(), a = new w.Vector3(), l = new w.Vector3(), e = new w.Matrix4();
  return function(r, m, c, n, i = {}) {
    if (i.type = V.MESH, p(i), i.fit === _.MANUAL)
      return console.warn("cannot use fit: manual with type: mesh"), null;
    const u = L(n, i), d = new Ammo.btVector3(), g = new Ammo.btVector3(), A = new Ammo.btVector3(), h = new Ammo.btTriangleMesh(!0, !1);
    for (let x = 0; x < r.length; x++) {
      const f = r[x], C = c[x] ? c[x] : null;
      if (e.fromArray(m[x]), C)
        for (let s = 0; s < C.length; s += 3) {
          const H = C[s] * 3, o = C[s + 1] * 3, b = C[s + 2] * 3;
          t.set(f[H], f[H + 1], f[H + 2]).applyMatrix4(e), a.set(f[o], f[o + 1], f[o + 2]).applyMatrix4(e), l.set(f[b], f[b + 1], f[b + 2]).applyMatrix4(e), d.setValue(t.x, t.y, t.z), g.setValue(a.x, a.y, a.z), A.setValue(l.x, l.y, l.z), h.addTriangle(d, g, A, !1);
        }
      else
        for (let s = 0; s < f.length; s += 9)
          t.set(f[s + 0], f[s + 1], f[s + 2]).applyMatrix4(e), a.set(f[s + 3], f[s + 4], f[s + 5]).applyMatrix4(e), l.set(f[s + 6], f[s + 7], f[s + 8]).applyMatrix4(e), d.setValue(t.x, t.y, t.z), g.setValue(a.x, a.y, a.z), A.setValue(l.x, l.y, l.z), h.addTriangle(d, g, A, !1);
    }
    const y = new Ammo.btVector3(u.x, u.y, u.z);
    h.setScaling(y), Ammo.destroy(y);
    const E = new Ammo.btBvhTriangleMeshShape(h, !0, !0);
    return E.resources = [h], Ammo.destroy(d), Ammo.destroy(g), Ammo.destroy(A), M(E, i), E;
  };
})(), W = function(t = {}) {
  if (p(t), t.fit === _.ALL)
    return console.warn("cannot use fit: all with type: heightfield"), null;
  const a = t.heightfieldDistance || 1, l = t.heightfieldData || [], e = t.heightScale || 0, r = t.hasOwnProperty("upAxis") ? t.upAxis : 1, m = (() => {
    switch (t.heightDataType) {
      case "short":
        return Ammo.PHY_SHORT;
      case "float":
        return Ammo.PHY_FLOAT;
      default:
        return Ammo.PHY_FLOAT;
    }
  })(), c = t.hasOwnProperty("flipQuadEdges") ? t.flipQuadEdges : !0, n = l.length, i = n > 0 ? l[0].length : 0, u = Ammo._malloc(n * i * 4), d = u / 4;
  let g = Number.POSITIVE_INFINITY, A = Number.NEGATIVE_INFINITY, h = 0;
  for (let x = 0; x < n; x++)
    for (let f = 0; f < i; f++) {
      const C = l[x][f];
      Ammo.HEAPF32[d + h] = C, h++, g = Math.min(g, C), A = Math.max(A, C);
    }
  const y = new Ammo.btHeightfieldTerrainShape(
    i,
    n,
    u,
    e,
    g,
    A,
    r,
    m,
    c
  ), E = new Ammo.btVector3(a, 1, a);
  return y.setLocalScaling(E), Ammo.destroy(E), y.heightfieldData = u, M(y, t), y;
};
function p(t) {
  t.fit = t.hasOwnProperty("fit") ? t.fit : _.ALL, t.type = t.type || V.HULL, t.minHalfExtent = t.hasOwnProperty("minHalfExtent") ? t.minHalfExtent : 0, t.maxHalfExtent = t.hasOwnProperty("maxHalfExtent") ? t.maxHalfExtent : Number.POSITIVE_INFINITY, t.cylinderAxis = t.cylinderAxis || "y", t.margin = t.hasOwnProperty("margin") ? t.margin : 0.01, t.includeInvisible = t.hasOwnProperty("includeInvisible") ? t.includeInvisible : !1, t.offset || (t.offset = new w.Vector3()), t.orientation || (t.orientation = new w.Quaternion());
}
const M = function(t, a, l) {
  t.type = a.type, t.setMargin(a.margin), t.destroy = () => {
    for (let m of t.resources || [])
      Ammo.destroy(m);
    t.heightfieldData && Ammo._free(t.heightfieldData), Ammo.destroy(t);
  };
  const e = new Ammo.btTransform(), r = new Ammo.btQuaternion();
  if (e.setIdentity(), e.getOrigin().setValue(a.offset.x, a.offset.y, a.offset.z), r.setValue(a.orientation.x, a.orientation.y, a.orientation.z, a.orientation.w), e.setRotation(r), Ammo.destroy(r), l) {
    const m = new Ammo.btVector3(l.x, l.y, l.z);
    t.setLocalScaling(m), Ammo.destroy(m);
  }
  t.localTransform = e;
}, F = (t, a) => t.visible ? t.parent && t.parent !== a ? F(t.parent) : !0 : !1, ee = (function() {
  const t = new w.Matrix4();
  return function(a, l, e) {
    t.copy(a.matrixWorld).invert(), a.traverse((r) => {
      const m = new w.Matrix4();
      if (r.isMesh && r.name !== "Sky" && (l.includeInvisible || F(r, a))) {
        r === a ? m.identity() : (r.updateWorldMatrix(!0), m.multiplyMatrices(t, r.matrixWorld));
        let c;
        if (r.geometry.isBufferGeometry) {
          const n = r.geometry.attributes.position;
          if (n.isInterleavedBufferAttribute) {
            c = [];
            for (let i = 0; i < n.count; i += 3)
              c.push(n.getX(i)), c.push(n.getY(i)), c.push(n.getZ(i));
          } else
            c = n.array;
        } else
          c = r.geometry.vertices;
        e(
          c,
          m.elements,
          r.geometry.index ? r.geometry.index.array : null
        );
      }
    });
  };
})(), L = (function() {
  const t = new w.Matrix4();
  return function(a, l = {}) {
    const e = new w.Vector3(1, 1, 1);
    return l.fit === _.ALL && (t.fromArray(a), e.setFromMatrixScale(t)), e;
  };
})(), $ = (function() {
  const t = new w.Vector3();
  return function(a, l, e) {
    let r = 0, { x: m, y: c, z: n } = e.getCenter(t);
    return R(a, l, (i) => {
      const u = m - i.x, d = c - i.y, g = n - i.z;
      r = Math.max(r, u * u + d * d + g * g);
    }), Math.sqrt(r);
  };
})(), T = function(t, a, l) {
  return new w.Vector3().subVectors(t.max, t.min).multiplyScalar(0.5).clampScalar(a, l);
}, I = function(t, a) {
  const l = new w.Box3();
  let e = 1 / 0, r = 1 / 0, m = 1 / 0, c = -1 / 0, n = -1 / 0, i = -1 / 0;
  return l.min.set(0, 0, 0), l.max.set(0, 0, 0), R(t, a, (u) => {
    u.x < e && (e = u.x), u.y < r && (r = u.y), u.z < m && (m = u.z), u.x > c && (c = u.x), u.y > n && (n = u.y), u.z > i && (i = u.z);
  }), l.min.set(e, r, m), l.max.set(c, n, i), l;
}, R = (function() {
  const t = new w.Vector3(), a = new w.Matrix4();
  return function(l, e, r) {
    for (let m = 0; m < l.length; m++) {
      a.fromArray(e[m]);
      for (let c = 0; c < l[m].length; c += 3)
        t.set(l[m][c], l[m][c + 1], l[m][c + 2]).applyMatrix4(a), r(t);
    }
  };
})();
export {
  _ as FIT,
  J as HEIGHTFIELD_DATA_TYPE,
  V as TYPE,
  j as createBoxShape,
  v as createCapsuleShape,
  K as createCollisionShapes,
  B as createConeShape,
  G as createCylinderShape,
  Q as createHACDShapes,
  W as createHeightfieldTerrainShape,
  Z as createHullShape,
  X as createSphereShape,
  q as createTriMeshShape,
  k as createVHACDShapes,
  ee as iterateGeometries
};
