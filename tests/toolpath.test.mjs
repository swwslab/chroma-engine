import test from "node:test";
import assert from "node:assert/strict";
import {generate,validate,asCsv} from "../src/toolpath.mjs";
const p={height:8,radius:40,layerHeight:.4,lineWidth:.85,filamentDiameter:1.75,segments:180,pattern:"diamonds",repeats:8,relief:.6,flare:0,waist:0};
test("generates closed paths for all layers",()=>{const r=generate(p);assert.equal(r.layers.length,20);assert.equal(r.layers[0].points.length,181);assert.ok(Math.abs(r.layers[0].points[0].x-r.layers[0].points.at(-1).x)<1e-8);assert.ok(r.totalExtrusionMm>0);assert.equal(r.machineReady,false)});
test("rejects unsafe parameters",()=>{assert.throws(()=>validate({...p,layerHeight:1}));assert.throws(()=>validate({...p,segments:8}));});
test("exports neutral CSV",()=>{assert.match(asCsv(generate(p)),/estimated_delta_e_mm/);});
