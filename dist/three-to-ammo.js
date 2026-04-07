import { Box3 as e, InterleavedBufferAttribute as t, Matrix4 as n, Mesh as r, Quaternion as i, Vector3 as a } from "three";
import * as o from "@hubs/ammo.js";
//#region index.ts
var s = await o.default.bind(window)(), c = [
	"box",
	"cylinder",
	"sphere",
	"capsule",
	"cone",
	"hull",
	"hacd",
	"vhacd",
	"mesh",
	"heightfield"
], l = /* @__PURE__ */ function(e) {
	return e[e.PHY_FLOAT = 0] = "PHY_FLOAT", e[e.PHY_DOUBLE = 1] = "PHY_DOUBLE", e[e.PHY_INTEGER = 2] = "PHY_INTEGER", e[e.PHY_SHORT = 3] = "PHY_SHORT", e[e.PHY_FIXEDPOINT88 = 4] = "PHY_FIXEDPOINT88", e[e.PHY_UCHAR = 5] = "PHY_UCHAR", e;
}(l || {});
new a(), new a(), new i();
function u({ fit: e = "all", matrixWorld: t, vertices: n = [], matrices: r = [], halfExtents: o = new a(), minHalfExtent: c = 0, maxHalfExtent: l = Infinity, offset: u = new a(), orientation: d = new i(), margin: f = .01 }) {
	e === "all" && (o = T(E(n, r), c, l));
	let p = new s.btVector3(o.x, o.y, o.z), m = new s.btBoxShape(p);
	return s.destroy(p), b({
		shape: m,
		scale: e === "all" ? C(t) : new a(1, 1, 1),
		margin: f,
		offset: u,
		orientation: d
	}), m;
}
function d({ fit: e = "all", matrixWorld: t, vertices: n = [], matrices: r = [], halfExtents: o = new a(), minHalfExtent: c = 0, maxHalfExtent: l = Infinity, offset: u = new a(), orientation: d = new i(), margin: f = .01, cylinderAxis: p = "y" }) {
	e === "all" && (o = T(E(n, r), c, l));
	let m = new s.btVector3(o.x, o.y, o.z), h = (() => {
		switch (p) {
			case "y": return new s.btCylinderShape(m);
			case "x": return new s.btCylinderShapeX(m);
			case "z": return new s.btCylinderShapeZ(m);
		}
	})();
	return s.destroy(m), b({
		shape: h,
		scale: e === "all" ? C(t) : new a(1, 1, 1),
		margin: f,
		offset: u,
		orientation: d
	}), h;
}
function f({ fit: e = "all", matrixWorld: t, vertices: n = [], matrices: r = [], halfExtents: o = new a(), minHalfExtent: c = 0, maxHalfExtent: l = Infinity, offset: u = new a(), orientation: d = new i(), margin: f = .01, cylinderAxis: p = "y" }) {
	e === "all" && (o = T(E(n, r), c, l));
	let { x: m, y: h, z: g } = o, _ = (() => {
		switch (p) {
			case "y": return new s.btCapsuleShape(Math.max(m, g), h * 2);
			case "x": return new s.btCapsuleShapeX(Math.max(h, g), m * 2);
			case "z": return new s.btCapsuleShapeZ(Math.max(m, h), g * 2);
		}
	})();
	return b({
		shape: _,
		scale: e === "all" ? C(t) : new a(1, 1, 1),
		margin: f,
		offset: u,
		orientation: d
	}), _;
}
function p({ fit: e = "all", matrixWorld: t, vertices: n = [], matrices: r = [], halfExtents: o = new a(), minHalfExtent: c = 0, maxHalfExtent: l = Infinity, offset: u = new a(), orientation: d = new i(), margin: f = .01, cylinderAxis: p = "y" }) {
	e === "all" && (o = T(E(n, r), c, l));
	let { x: m, y: h, z: g } = o, _ = (() => {
		switch (p) {
			case "y": return new s.btConeShape(Math.max(m, g), h * 2);
			case "x": return new s.btConeShapeX(Math.max(h, g), m * 2);
			case "z": return new s.btConeShapeZ(Math.max(m, h), g * 2);
		}
	})();
	return b({
		shape: _,
		scale: e === "all" ? C(t) : new a(1, 1, 1),
		margin: f,
		offset: u,
		orientation: d
	}), _;
}
function m({ fit: e = "all", matrixWorld: t, vertices: n = [], matrices: r = [], offset: o = new a(), orientation: c = new i(), margin: l = .01, sphereRadius: u = 1 }) {
	let d = e === "manual" ? u : w(n, r, E(n, r)), f = new s.btSphereShape(d);
	return b({
		shape: f,
		scale: e === "all" ? C(t) : new a(1, 1, 1),
		margin: l,
		offset: o,
		orientation: c
	}), f;
}
function h({ matrixWorld: e, vertices: t, matrices: r, halfExtents: o = new a(), minHalfExtent: c = 0, maxHalfExtent: l = Infinity, offset: u = new a(), orientation: d = new i(), margin: f = .01, maxVertices: p = 1e5, compacityWeight: m = 1e-4, volumeWeight: h = 0, nClusters: g = 1, nVerticesPerCH: _ = 100, concavity: v = 100 }) {
	let y = new a(), x = new a(), S = new n(), w = E(t, r), T = new s.btVector3(), D = new s.btConvexHullShape();
	D.setMargin(f), x.addVectors(w.max, w.min).multiplyScalar(.5);
	let O = 0;
	t.forEach((e) => {
		O += e.length / 3;
	}), O > p && console.warn(`too many vertices for hull shape; sampling ~${p} from ~${O} vertices`);
	let k = Math.min(1, p / O);
	t.forEach((e, n) => {
		for (let r = 0; r < e.length; r += 3) {
			let i = n === t.length - 1 && r === e.length - 3;
			(Math.random() <= k || i) && (y.set(e[r], e[r + 1], e[r + 2]).applyMatrix4(S).sub(x), T.setValue(y.x, y.y, y.z), D.addPoint(T, i));
		}
	});
	let A = D;
	if (D.getNumVertices() >= 100) {
		let e = new s.btShapeHull(D);
		e.buildHull(f), s.destroy(D);
		let t = s.getPointer(e.getVertexPointer()), n = Array.from(s.HEAPF64.subarray(t / 8, t / 8 + e.numVertices()));
		A = new s.btConvexHullShape(n, e.numVertices()), s.destroy(e);
	}
	return s.destroy(T), b({
		shape: A,
		scale: C(e),
		margin: f,
		offset: u,
		orientation: d
	}), A;
}
function g({ matrixWorld: e, vertices: t, matrices: r, indexes: o, halfExtents: c = new a(), minHalfExtent: l = 0, maxHalfExtent: u = Infinity, offset: d = new a(), orientation: f = new i(), margin: p = .01, compacityWeight: m = 1e-4, volumeWeight: h = 0, nVerticesPerCH: g = 100, concavity: _ = 100, nClusters: v = 1 }) {
	let y = new a(), x = new a(), S = new n(), w = E(t, r), T = C(e), D = 0, O = 0;
	x.addVectors(w.max, w.min).multiplyScalar(.5), t.forEach((e, t) => {
		D += e.length / 3, o && o[t] ? O += o[t].length / 3 : O += e.length / 9;
	});
	let k = new s.HACD();
	k.SetCompacityWeight(m), k.SetVolumeWeight(h), k.SetNClusters(v), k.SetNVerticesPerCH(g), k.SetConcavity(_);
	let A = s._malloc(D * 3 * 8), j = s._malloc(O * 3 * 4);
	k.SetPoints(s.wrapPointer(A, s.Vec3Real)), k.SetTriangles(s.wrapPointer(j, s.Vec3Long)), k.SetNPoints(D), k.SetNTriangles(O);
	let M = A / 8, N = j / 4;
	t.forEach((e, t) => {
		S.fromArray(r[t]);
		for (let t = 0; t < e.length; t += 3) y.set(e[t + 0], e[t + 1], e[t + 2]).applyMatrix4(S).sub(x), s.HEAPF64[M + 0] = y.x, s.HEAPF64[M + 1] = y.y, s.HEAPF64[M + 2] = y.z, M += 3;
		if (o[t]) o[t].forEach((e, t) => {
			s.HEAP32[N] = e, N++;
		});
		else for (let t = 0; t < e.length / 3; t++) s.HEAP32[N] = t, N++;
	}), k.Compute(), s._free(A), s._free(j), k.GetNClusters();
	let P = [];
	for (let e = 0; e < v; e++) {
		let t = new s.btConvexHullShape();
		t.setMargin(p);
		let n = k.GetNPointsCH(e), r = k.GetNTrianglesCH(e), i = s._malloc(n * 3 * 8), a = s._malloc(r * 3 * 4);
		k.GetCH(e, s.wrapPointer(i, s.Vec3Real), s.wrapPointer(a, s.Vec3Long));
		for (let e = 0; e < n; e++) {
			let r = new s.btVector3(), a = s.HEAPF64[i / 8 + e * 3 + 0], o = s.HEAPF64[i / 8 + e * 3 + 1], c = s.HEAPF64[i / 8 + e * 3 + 2];
			r.setValue(a, o, c), t.addPoint(r, e === n - 1), s.destroy(r);
		}
		b({
			shape: t,
			scale: T,
			margin: p,
			offset: d,
			orientation: f
		}), P.push(t);
	}
	return P;
}
function _({ matrixWorld: e, vertices: t, matrices: r, indexes: o, halfExtents: c = new a(), minHalfExtent: l = 0, maxHalfExtent: u = Infinity, offset: d = new a(), orientation: f = new i(), margin: p = .01, resolution: m = 1e5, depth: h = 20, concavity: g = .0025, planeDownsampling: _ = 4, convexhullDownsampling: v = 4, alpha: y = .05, beta: x = .05, gamma: S = .00125, pca: w = 0, mode: T = 0, maxNumVerticesPerCH: D = 64, minVolumePerCH: O = 1e-4, convexhullApproximation: k = 1, oclAcceleration: A = 0 }) {
	let j = new a(), M = new a(), N = new n(), P = E(t, r), F = C(e), I = 0, L = 0;
	M.addVectors(P.max, P.min).multiplyScalar(.5), t.forEach((e, t) => {
		I += e.length / 3, o && o[t] ? L += o[t].length / 3 : L += e.length / 9;
	});
	let R = new s.VHACD(), z = new s.Parameters();
	z.set_m_resolution(m), z.set_m_depth(h), z.set_m_concavity(g), z.set_m_planeDownsampling(_), z.set_m_convexhullDownsampling(v), z.set_m_alpha(y), z.set_m_beta(x), z.set_m_gamma(S), z.set_m_pca(w), z.set_m_mode(T), z.set_m_maxNumVerticesPerCH(D), z.set_m_minVolumePerCH(O), z.set_m_convexhullApproximation(k), z.set_m_oclAcceleration(A);
	let B = s._malloc(I * 3 * 8 + 3), V = s._malloc(L * 3 * 4), H = B / 8, U = V / 4;
	t.forEach((e, t) => {
		N.fromArray(r[t]);
		for (let t = 0; t < e.length; t += 3) j.set(e[t + 0], e[t + 1], e[t + 2]).applyMatrix4(N).sub(M), s.HEAPF64[H + 0] = j.x, s.HEAPF64[H + 1] = j.y, s.HEAPF64[H + 2] = j.z, H += 3;
		if (o[t]) o[t].forEach((e) => {
			s.HEAP32[U] = e, U++;
		});
		else for (let t = 0; t < e.length / 3; t++) s.HEAP32[U] = t, U++;
	});
	let W = Array.from(s.HEAPF64.subarray(B / 8, H)), G = Array.from(s.HEAPF64.subarray(V / 4, U));
	R.Compute(W, 3, I, G, 3, L, z), s._free(B), s._free(V);
	let K = R.GetNConvexHulls(), q = [], J = new s.ConvexHull();
	for (let e = 0; e < K; e++) {
		R.GetConvexHull(e, J);
		let t = J.get_m_nPoints(), n = new s.btConvexHullShape();
		n.setMargin(p);
		for (let e = 0; e < t; e++) {
			let r = new s.btVector3(), i = J.get_m_points(e * 3 + 0), a = J.get_m_points(e * 3 + 1), o = J.get_m_points(e * 3 + 2);
			r.setValue(i, a, o), n.addPoint(r, e === t - 1), s.destroy(r);
		}
		b({
			shape: n,
			scale: F,
			margin: p,
			offset: d,
			orientation: f
		}), q.push(n);
	}
	return s.destroy(J), s.destroy(R), q;
}
function v({ matrixWorld: e, vertices: t, matrices: r, indexes: o, halfExtents: c = new a(), minHalfExtent: l = 0, maxHalfExtent: u = Infinity, offset: d = new a(), orientation: f = new i(), margin: p = .01 }) {
	let m = new a(), h = new a(), g = new a(), _ = new n(), v = C(e), y = new s.btVector3(), x = new s.btVector3(), S = new s.btVector3(), w = new s.btTriangleMesh(!0, !1);
	t.forEach((e, t) => {
		let n = o[t] ? o[t] : null;
		if (_.fromArray(r[t]), n) for (let t = 0; t < n.length; t += 3) {
			let r = n[t] * 3, i = n[t + 1] * 3, a = n[t + 2] * 3;
			m.set(e[r], e[r + 1], e[r + 2]).applyMatrix4(_), h.set(e[i], e[i + 1], e[i + 2]).applyMatrix4(_), g.set(e[a], e[a + 1], e[a + 2]).applyMatrix4(_), y.setValue(m.x, m.y, m.z), x.setValue(h.x, h.y, h.z), S.setValue(g.x, g.y, g.z), w.addTriangle(y, x, S, !1);
		}
		else for (let t = 0; t < e.length; t += 9) m.set(e[t + 0], e[t + 1], e[t + 2]).applyMatrix4(_), h.set(e[t + 3], e[t + 4], e[t + 5]).applyMatrix4(_), g.set(e[t + 6], e[t + 7], e[t + 8]).applyMatrix4(_), y.setValue(m.x, m.y, m.z), x.setValue(h.x, h.y, h.z), S.setValue(g.x, g.y, g.z), w.addTriangle(y, x, S, !1);
	});
	let T = new s.btVector3(v.x, v.y, v.z);
	w.setScaling(T), s.destroy(T);
	let E = new s.btBvhTriangleMeshShape(w, !0, !0);
	return E.resources = [w], s.destroy(y), s.destroy(x), s.destroy(S), b({
		shape: E,
		margin: p,
		offset: d,
		orientation: f
	}), E;
}
function y({ halfExtents: e = new a(), minHalfExtent: t = 0, maxHalfExtent: n = Infinity, offset: r = new a(), orientation: o = new i(), margin: c = .01, heightfieldDistance: u = 1, heightfieldData: d = [], heightScale: f = 0, upAxis: p = "y", heightDataType: m = l.PHY_FLOAT, flipQuadEdges: h = !0 }) {
	let g = d.length, _ = g > 0 && d[0] ? d[0].length : 0, v = s._malloc(g * _ * 4), y = v / 4, x = Infinity, S = -Infinity, C = 0;
	for (let e = 0; e < g; e++) for (let t = 0; t < _; t++) {
		let n = d[e][t] || 0;
		s.HEAPF32[y + C] = n, C++, x = Math.min(x, n), S = Math.max(S, n);
	}
	let w = new s.btHeightfieldTerrainShape(_, g, v, f, x, S, p === "x" ? 0 : p === "y" ? 1 : 2, m, h), T = new s.btVector3(u, 1, u);
	return w.setLocalScaling(T), s.destroy(T), b({
		shape: w,
		margin: c,
		offset: r,
		orientation: o
	}), w;
}
function b({ shape: e, scale: t = new a(1, 1, 1), margin: n = .01, offset: r = new a(), orientation: o = new i() }) {
	e.setMargin(n), e.destroy = () => {
		for (let t of e.resources || []) s.destroy(t);
		e.heightfieldData && s._free(e.heightfieldData), s.destroy(e);
	};
	let c = new s.btTransform(), l = new s.btQuaternion(0, 0, 0, 0);
	c.setIdentity(), c.getOrigin().setValue(r.x, r.y, r.z), l.setValue(o.x, o.y, o.z, o.w), c.setRotation(l), s.destroy(l);
	let u = new s.btVector3(t.x, t.y, t.z);
	e.setLocalScaling(u), s.destroy(u), e.localTransform = c;
}
var x = (e, t) => e.visible ? e.parent && e.parent !== t ? x(e.parent) : !0 : !1, S = ({ root: e, includeInvisible: i = !1, cb: a }) => {
	let o = new n();
	o.copy(e.matrixWorld).invert(), e.traverse((s) => {
		if (!(s instanceof r) || s.name === "Sky" || !i && !x(s, e)) return;
		let c = s, l = new n();
		c === e ? l.identity() : (c.updateWorldMatrix(!0, !1), l.multiplyMatrices(o, c.matrixWorld));
		let u, d = c.geometry.attributes.position;
		if (d instanceof t) {
			u = [];
			for (let e = 0; e < d.count; e += 3) u.push(d.getX(e)), u.push(d.getY(e)), u.push(d.getZ(e));
		} else u = d ? Array.from(d.array) : [];
		a(u, l.elements, c.geometry.index ? Array.from(c.geometry.index.array) : []);
	});
}, C = (e) => {
	let t = new n(), r = new a(1, 1, 1);
	return t.fromArray(e), r.setFromMatrixScale(t), r;
}, w = (e, t, n) => {
	let r = new a(), i = 0, { x: o, y: s, z: c } = n.getCenter(r);
	return D(e, t, (e) => {
		let t = o - e.x, n = s - e.y, r = c - e.z;
		i = Math.max(i, t * t + n * n + r * r);
	}), Math.sqrt(i);
}, T = (e, t, n) => new a().subVectors(e.max, e.min).multiplyScalar(.5).clampScalar(t, n), E = function(t, n) {
	let r = new e(), i = Infinity, a = Infinity, o = Infinity, s = -Infinity, c = -Infinity, l = -Infinity;
	return r.min.set(0, 0, 0), r.max.set(0, 0, 0), D(t, n, (e) => {
		e.x < i && (i = e.x), e.y < a && (a = e.y), e.z < o && (o = e.z), e.x > s && (s = e.x), e.y > c && (c = e.y), e.z > l && (l = e.z);
	}), r.min.set(i, a, o), r.max.set(s, c, l), r;
}, D = (e, t, r) => {
	let i = new a(), o = new n();
	e.forEach((e, n) => {
		o.fromArray(t[n]);
		for (let t = 0; t < e.length; t += 3) i.set(e[t], e[t + 1], e[t + 2]).applyMatrix4(o), r(i);
	});
};
//#endregion
export { u as createBoxShape, f as createCapsuleShape, p as createConeShape, d as createCylinderShape, g as createHACDShapes, y as createHeightfieldTerrainShape, h as createHullShape, m as createSphereShape, v as createTriMeshShape, _ as createVHACDShapes, S as iterateGeometries, c as shapeTypes };
