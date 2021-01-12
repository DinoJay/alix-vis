<script>
  import { onMount } from "svelte";
  // import d3_radial from "d3-radial";
  import * as d3 from "d3-force";
  import uniq from "lodash.uniqby";
  // import * as z from "d3-zoom";
  import * as array from "d3-array";
  import * as sel from "d3-selection";
  import Alix from "./Alix.svelte";
  // import Vis from "./Vis.tmp";
  import Arrow from "./Arrow.svelte";
  import { organizeData } from "./lib";

  export let data = [];
  export let objects = [];
  export let persons = [];
  export let animals = [];
  export let vehicles = [];
  export let places = [];
  const width = 375;
  const height = 667;
  // var spiral = d3_radial
  //   .spiral([width / 2, height / 2])
  //   .increment(10)
  //   .coil(6);
  var radialLocation = function (center, angle, width, height, taper) {
    const [x, y] = center;
    return [
      x + width * Math.cos((angle * Math.PI) / 180 - taper),
      y + (height * Math.sin((angle * Math.PI) / 180) - taper),
    ];
  };
  // let translate = null;
  const placement = (nodes, cx, cy, r, half) => {
    const increment = half ? 180 / (nodes.length - 1) : 360 / nodes.length;
    let current = -90;

    return nodes.map((d) => {
      const [tx, ty] = radialLocation([cx, cy], current, r, r, 0);
      const [lx, ly] = radialLocation([cx, cy], current, r + 50, r + 50, 1);
      current += increment;
      return { ...d, tx, ty, lx, ly };
    });
  };

  const ns = organizeData({
    data,
    places,
    vehicles,
    objects,
    animals,
    persons,
  });
  console.log("ns", ns);
  const dreams = ns.find((n) => n.id === "dreams");
  dreams.tx = width / 2;
  dreams.ty = height / 2;
  const otherData = ns.filter((n) => n.id !== "dreams");

  const tmpNodes = placement(otherData, width / 2, height / 2, 150, true);
  let nodes = [];

  const simulation = d3
    .forceSimulation([...tmpNodes, dreams])
    // .alphaMin(0.9)
    .force("collision", d3.forceCollide((d) => d.size / 2 + 5).strength(1))
    .force("x", d3.forceX((d) => d.tx).strength(0.8))
    .force("y", d3.forceY((d) => d.ty).strength(0.8))
    .force("charge", d3.forceManyBody())
    .on("tick", () => {
      nodes = simulation.nodes();
    });

  let bounds = null;
  let xx = 0;
  let yy = 0;
  let translate;

  let arrow;
  $: {
    bounds = [
      [
        array.min(nodes, (d) => d.x - d.size / 2),
        array.min(nodes, (d) => d.y - d.size / 2),
      ],
      [
        array.max(nodes, (d) => d.x + d.size / 2),
        array.max(nodes, (d) => d.y + d.size / 2),
      ],
    ];

    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    xx = (bounds[0][0] + bounds[1][0]) / 2;
    yy = (bounds[0][1] + bounds[1][1]) / 2;
    // console.log("bounds", bounds);
    let scale = Math.max(
      0.1,
      Math.min(20, 0.9 / Math.max(dx / width, dy / height))
    );

    // console.log("arrow", arrow);
    translate = [width / 2 - scale * xx, height / 2 - scale * yy, scale];
  }

  let state = 0;
  const firstClickHandler = (n) => {
    n.size = !n.selected ? 120 : 25;

    const ns = placement(n.values, n.tx, n.ty, 300, true);
    const drs = placement(n.linkedDreams, n.tx, n.ty, 450, true);

    console.log("drs", drs);
    const newNodes = uniq([n, ...ns, ...drs], "id");
    simulation.nodes(newNodes);
    simulation.alpha(1);
    // simulation.alphaMin(0.2);
    simulation.restart();
    // console.log('bounds', bounds);
  };
  const secClickHandler = (n) => {
    n.size = !n.selected ? 80 : 25;

    console.log("secClickHandler", n);
    const ns = placement(n.values, n.tx, n.ty, 200, true);
    const na = placement(n.attrs, n.tx, n.ty, 100, true);

    // console.log('drs', drs);
    const newNodes = [n, ...ns, ...na];
    console.log("newNodes", newNodes);
    simulation.nodes(newNodes);
    simulation.alpha(1);
    // simulation.alphaMin(0.2);
    simulation.restart();
    // console.log('bounds', bounds);
  };
  const clickHandlers = [firstClickHandler, secClickHandler];
</script>

<style>
  #zoom-cont {
    transform-origin: 0 0;
  }
</style>

<div
  class="relative border border-black overflow-hidden"
  style="width:{width}px; height:{height}px;}">
  <div
    id="zoom-cont"
    class="w-full h-full transition"
    style="transform: {translate ? `translate(${translate[0]}px, ${translate[1]}px) scale(${translate[2]})` : `translate(0%,0%)`}">
    {#each nodes as n (n.id)}
      <div
        on:click={() => {
          clickHandlers[state](n);
          state++;
        }}
        class="flex absolute  transition"
        style="left:{n.x - n.size / 2}px; top:{n.y - n.size / 2}px; width:{n.size}px; height:{n.size}px; ">
        <div
          class="absolute border-2 -white"
          style="width:{n.size}px; height:{n.size}px; border-color: {n.color};" />
        <div
          class="m-auto bg-white whitespace-nowrap"
          style="transform: translate(-10%,-0%)">
          {#if n.visible || n.selected}{n.title}{/if}
        </div>
      </div>
    {/each}
    {#each nodes as n (n.id)}
      <div
        class="absolute  w-3 h-3"
        style="left:{n.lx}px; top:{n.ly}px; transform: translate(-50%, -50%)" />
    {/each}

    <!-- <div
      class="bg-black w-3 h-3 absolute"
      style="left:{bounds[1][0]}px; top:{bounds[1][1]}px" />
    <div
      class="bg-green-500 w-3 h-3 absolute"
      style="left:{xx}px; top:{yy}px" /> -->
  </div>
</div>
