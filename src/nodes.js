import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export class Index {
  value;
  compute() {
    return this.value;
  }
}

export const index = () => new Index();

export let _index = index();

// Inputs
export class Value {
  constructor(value) {
    this.value = value;
  }
  compute() {
    return this.value;
  }
}

export const value = (v) => new Value(v);

export class BooleanValue {
  constructor(value) {
    this.value = value;
  }
  compute() {
    return this.value;
  }
}

export const boolean = (v) => new BooleanValue(v);

export class InputVector {
  constructor([x, y, z]) {
    this.x = new Value(x);
    this.y = new Value(y);
    this.z = new Value(z);
  }
  compute() {
    return new THREE.Vector3(
      this.x.compute(),
      this.y.compute(),
      this.z.compute()
    );
  }
}

export const inputVector = (v) => new InputVector(v);

// Math

function createMathOperation(compute) {
  return (sidx, inputs) => ({
    compute: () => compute(...inputs.map((inp) => inp.compute())),
  });
}

export const power = createMathOperation((base, exponent) =>
  Math.pow(base, exponent)
);

export const subtract = createMathOperation((a, b) => a - b);
export const add = createMathOperation((a, b) => a + b);
export const cos = createMathOperation((a) => Math.cos(a));
export const abs = createMathOperation((a) => Math.abs(a));
export const exp = createMathOperation((a) => Math.exp(a));
export const min = createMathOperation((a, b) => Math.min(a, b));
export const max = createMathOperation((a, b) => Math.max(a, b));
export const sqrt = createMathOperation((a) => Math.sqrt(a));
export const inverseSqrt = createMathOperation((a) => 1 / Math.sqrt(a));
export const toRad = createMathOperation((a) => a * DEG2RAD);
export const modulo = createMathOperation((a, b) => a % b);
export const floor = createMathOperation((a) => Math.floor(a));
export const divide = createMathOperation((a, b) => a / b);
export const multiplyAdd = createMathOperation((a, b, c) => a * b + c);
export const multiply = createMathOperation((a, b) => a * b);
export const logarithm = createMathOperation(
  (v, base) => Math.log(v) / Math.log(base)
);

export const vecAdd = createMathOperation((a, b) => a.add(b));
export const vecSubtract = createMathOperation((a, b) => a.sub(b));
export const vecDivide = createMathOperation((a, b) => a.divide(b));

// Utilities
export class MapRange {
  constructor(sidx, [fmin, fmax, tmin, tmax, value]) {
    Object.assign(this, { sidx, fmin, fmax, tmin, tmax, value });
  }
  compute() {
    const factor =
      (this.value.compute() - this.fmin.compute()) /
      (this.fmax.compute() - this.fmin.compute());
    return (
      this.tmin.compute() + factor * (this.tmax.compute() - this.tmin.compute())
    );
  }
}

export const mapRange = (...args) => new MapRange(...args);

// Vector
export class CombineXYZ {
  constructor(sidx, [x, y, z]) {
    Object.assign(this, { sidx, x, y, z });
  }
  compute() {
    return new THREE.Vector3(
      this.x.compute(),
      this.y.compute(),
      this.z.compute()
    );
  }
}

export const combineXYZ = (...args) => new CombineXYZ(...args);

export class SeparateXYZ {
  constructor(sidx, [vector]) {
    Object.assign(this, { sidx, vector });
  }
  compute() {
    const vec = this.vector.compute().toArray();
    return vec[this.sidx];
  }
}

export const separateXYZ = (...args) => new SeparateXYZ(...args);

// Input

export class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  compute() {
    return new THREE.Vector3(
      this.x.compute(),
      this.y.compute(),
      this.z.compute()
    );
  }
}

export const vector = (x, y, z) => new Vector(x, y, z);

// Curve Primitives

export class CurveCircle {
  constructor(sidx, [resolution, radius]) {
    Object.assign(this, { sidx, resolution, radius });
  }
  asCurve() {
    const curve = new THREE.EllipseCurve(
      0,
      0,
      this.radius.compute(),
      this.radius.compute(),
      0,
      2 * Math.PI,
      false,
      0
    );
    const getPoint = curve.getPoint.bind(curve);
    curve.getPoint = (t, target = new THREE.Vector2()) =>
      getPoint(t, new THREE.Vector3(target.x, target.y, 0));
    return curve;
  }
  compute() {
    const points = this.asCurve()
      .getPoints(this.resolution.compute())
      .flatMap((a) => a.toArray());
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(points);
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    return geometry;
  }
}

export const curveCirlce = (...args) => new CurveCircle(...args);

class CurvePrimitiveQuadrilaterl {
  constructor(sidx, [width, height]) {
    Object.assign(this, { sidx, width, height });
  }
  compute() {
    const geometry = new THREE.BufferGeometry();
    const w = this.width.compute();
    const h = this.height.compute();
    const vertices = new Float32Array([
      w / 2,
      0,
      h / 2,
      -w / 2,
      0,
      h / 2,
      -w / 2,
      0,
      -h / 2,
      w / 2,
      0,
      -h / 2,
    ]);
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(
      new THREE.BufferAttribute(new Uint16Array([0, 1, 2, 3, 0]), 1)
    );
    geometry.__type = "curve";
    return geometry;
  }
}

export const curvePrimitiveQuadrilaterl = (...args) =>
  new CurvePrimitiveQuadrilaterl(...args);

export class BoundingBox {
  constructor(sidx, [geometry]) {
    Object.assign(this, { sidx, geometry });
  }
  compute() {
    const geometry = this.geometry.compute();
    if (!geometry) {
      return;
    }
    geometry.computeBoundingBox();
    const { max, min } = geometry.boundingBox;

    const x = max.x - min.x;
    const y = max.y - min.y;
    const z = max.z - min.z;
    const bbox = new THREE.BoxGeometry(x, y, z, 1, 1, 1);
    bbox.translate(min.x + x / 2, min.y + y / 2, min.z + z / 2);
    return [bbox, min, max][this.sidx];
  }
}

export const boundingBox = (...args) => new BoundingBox(...args);

// Mesh primitives
export class MeshPrimitiveCube {
  constructor(sidx, [size, vx, vy, vz]) {
    Object.assign(this, { sidx, size, vx, vy, vz });
  }
  compute() {
    const [sx, sy, sz] = this.size.compute();
    return new THREE.BoxGeometry(
      sx,
      sy,
      sz,
      this.vx.compute() - 1,
      this.vy.compute() - 1,
      this.vz.compute() - 1
    );
  }
}

export const meshPrimitiveCube = (...args) => new MeshPrimitiveCube(...args);

class MeshPrimitiveCylinder {
  constructor(sidx, [vertices, sideSegments, fillSegments, radius, depth]) {
    Object.assign(this, {
      sidx,
      vertices,
      sideSegments,
      // TODO: threejs cylinder is diff here
      fillSegments,
      radius,
      depth,
    });
    // TODO: threejs cylinder is diff here
  }
  compute() {
    return new THREE.CylinderGeometry(
      this.radius.compute(),
      this.radius.compute(),
      this.depth.compute(),
      this.vertices.compute(),
      this.sideSegments.compute()
    );
  }
}

export const meshPrimitiveCylinder = (...args) =>
  new MeshPrimitiveCylinder(...args);

export class MeshPrimitiveUVSphere {
  constructor(sidx, [segments, rings, radius]) {
    Object.assign(this, { sidx, segments, rings, radius });
  }
  compute() {
    return new THREE.SphereGeometry(
      this.radius.compute(),
      this.segments.compute(),
      this.rings.compute()
    );
  }
}

export const meshPrimitiveUVSphere = (...args) =>
  new MeshPrimitiveUVSphere(...args);

export class MeshPrimitiveGrid {
  constructor(sidx, [sx, sy, vx, vy]) {
    Object.assign(this, { sidx, sx, sy, vx, vy });
  }
  compute() {
    return new THREE.PlaneGeometry(
      this.sx.compute(),
      this.sy.compute(),
      this.vx.compute(),
      this.vy.compute()
    );
  }
}

export const meshPrimitiveGrid = (...args) => new MeshPrimitiveGrid(...args);

// Geometry operations

export class JoinGeometry {
  constructor(geometries) {
    this.geometries = geometries;
  }
  compute() {
    if (this.geometries.length > 0) {
      return BufferGeometryUtils.mergeBufferGeometries(
        this.geometries.map((g) => g.compute()),
        false
      );
    }
  }
}
export const joinGeometry = (geometries) => new JoinGeometry(geometries);

// Curve
export class CurveToMesh {
  constructor(sidx, [curve, profile]) {
    Object.assign(this, { sidx, curve, profile });
  }
  compute() {
    return new THREE.TubeGeometry(
      this.curve.asCurve(),
      this.curve.resolution.compute(),
      this.profile.radius.compute(),
      this.profile.resolution.compute(),
      true
    );
  }
}

export const curveToMesh = (...args) => new CurveToMesh(...args);

function positionToVerts(array) {
  const verts = [];
  for (let idx = 0; idx < array.length; idx += 3) {
    verts.push(new THREE.Vector3(array[idx], array[idx + 1], array[idx + 2]));
  }
  return verts;
}

function vertsToSegments(verts) {
  const segments = [];
  segments.push([verts[verts.length - 1], verts[0]]);
  for (let idx = 0; idx < verts.length - 1; idx++) {
    segments.push([verts[idx], verts[idx + 1]]);
  }
  return segments;
}

function axisAngleNormalizedToMat3(axis, angle) {
  const mat3 = new THREE.Matrix3();
  const asin = Math.sin(angle);
  const acos = Math.cos(angle);
  const ico = 1 - acos;

  mat3.set(axis);
}

function rotateAroundAxis(v, center, axis, angle) {
  const result = v.sub(center);
  const mat3 = axisAngleNormalizedToMat3(axis, angle);
  return result.add(center);
}

export class FilletCurve {
  constructor(sidx, [curve, count, radius, limit]) {
    Object.assign(this, { sidx, curve, count, radius, limit });
  }
  compute() {
    const geometry = this.curve.compute();
    if (!geometry) {
      return;
    }
    const radius = this.radius.compute();
    const verts = positionToVerts(geometry.attributes.position.array);
    const segments = vertsToSegments(verts);
    const directions = segments.map(([a, b]) => b.sub(a).normalize());
    const angles = directions.map(
      (dir, idx) =>
        Math.PI - dir.negate().angleTo(directions[idx + 1] || directions[0])
    );
    // verts.map((v, idx) => {
    //   const dir = directions[idx];
    //   const angle = angles[idx];
    //   const d = radius * Math.tan(angle / 2);
    //   const prevDir =
    //     directions[idx === 0 ? verts.length - 1 : idx - 1].negate();
    //   const nextDir = directions[idx];
    //   const aStart = v.add(prevDir.multiplyScalar(d));
    //   const aEnd = v.add(nextDir.multiplyScalar(d));

    //   const axis = prevDir.cross(nextDir).normalize().negate();
    //   const centerDir = nextDir.add(prevDir).multiplyScalar(0.5).normalize();
    //   const distToCenter = Math.sqrt(Math.pow(radius, 2) + Math.pow(d, 2));
    //   const center = v.add(centerDir.multiplyScalar(distToCenter));
    //   const segmentAngle = angle / (middle + 1);
    // });
    return geometry;
  }
}

export const filletCurve = (...args) => new FilletCurve(...args);

// Point
export class Points {
  constructor(sidx, [count, position, radius]) {
    Object.assign(this, { sidx, count, position, radius });
    this.position =
      position || new Vector(new Value(0), new Value(0), new Value(0));
  }
  compute() {
    const points = [];

    for (let idx = 0; idx < this.count.compute(); idx++) {
      _index.value = idx;
      points.push(...this.position.compute());
    }

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(points);
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

    return geometry;
  }
}

export const points = (...args) => new Points(...args);

// Instances
export class InstanceOnPoints {
  constructor(sidx, [points, instance, rotation, scale]) {
    Object.assign(this, { sidx, points, instance, rotation, scale });
  }
  compute() {
    const instance = this.instance.compute();

    if (!instance) {
      return;
    }

    const geometry = new THREE.InstancedBufferGeometry();
    geometry.setAttribute("position", instance.getAttribute("position"));
    geometry.setIndex(instance.index);

    const position = this.points.compute().getAttribute("position");

    // position
    geometry.setAttribute(
      "translation",
      new THREE.InstancedBufferAttribute(position.array, 3, true)
    );

    // rotation & scale
    const pointCount = position.count;
    const rotation = [];
    const scale = [];

    for (let idx = 0; idx < pointCount; idx++) {
      _index.value = idx;

      const rx = this.rotation.x;
      const ry = this.rotation.y;
      const rz = this.rotation.z;

      const sx = this.scale.x.compute();
      const sy = this.scale.y.compute();
      const sz = this.scale.z.compute();

      rotation.push(...xyzToQuaternion(rx, ry, rz));
      scale.push(sx, sy, sz);
    }

    geometry.setAttribute(
      "rotation",
      new THREE.InstancedBufferAttribute(new Float32Array(rotation), 4, true)
    );

    geometry.setAttribute(
      "scale",
      new THREE.InstancedBufferAttribute(new Float32Array(scale), 3, true)
    );

    return geometry;
  }
}

export const instanceOnPoints = (...args) => new InstanceOnPoints(...args);

function vec3ToQuaternion(v) {
  return new THREE.Quaternion().setFromEuler(
    new THREE.Euler(...v.multiplyScalar(DEG2RAD), "XYZ")
  );
}

function xyzToQuaternion(x, y, z) {
  const values = [x, y, z].map((v) =>
    v instanceof Value ? v.compute() * DEG2RAD : v.compute()
  );
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(...values, "XYZ"));
}

export class Transform {
  constructor(sidx, [geometry, translation, rotation, scale]) {
    Object.assign(this, { sidx, geometry, translation, rotation, scale });
  }
  compute() {
    const geometry = this.geometry.compute();
    if (!geometry) {
      return;
    }
    const m4 = new THREE.Matrix4().compose(
      this.translation.compute(),
      vec3ToQuaternion(this.rotation.compute()),
      this.scale.compute()
    );
    return geometry.applyMatrix4(m4);
  }
}

export const transform = (...args) => new Transform(...args);

// Main
export class GroupOutput {
  constructor(sidx, [geometry]) {
    Object.assign(this, { sidx, geometry });
  }
  compute() {
    const geometry = this.geometry.compute();
    if (geometry) {
      if (geometry.getAttribute("scale") === undefined) {
        const scale = new Float32Array(
          geometry.getAttribute("position").count * 3
        ).fill(1);
        geometry.setAttribute("scale", new THREE.BufferAttribute(scale, 3));
      }
    }
    return geometry;
  }
}

export const groupOutput = (...args) => new GroupOutput(...args);

export class GroupInput {
  constructor(sidx, geometry) {
    Object.assign(this, { sidx, geometry });
  }
  compute() {
    return this.geometry;
  }
}

export const groupInput = (...args) => new GroupInput(...args);

// Output
export class Viewer {
  constructor(sidx, [geometry]) {
    Object.assign(this, { sidx, geometry });
  }
  compute() {
    return this.geometry.compute();
  }
}

export const viewer = (...args) => new Viewer(...args);
