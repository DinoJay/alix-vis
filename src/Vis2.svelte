<script>
  export let data = [];
  export let objects = [];
  export let persons = [];
  export let animals = [];
  export let vehicles = [];
  export let places = [];

  import { onMount } from "svelte";
  // import d3_radial from "d3-radial";
  import * as d3 from "d3-force";
  // import * as z from "d3-zoom";
  import * as array from "d3-array";
  import * as sel from "d3-selection";
  import Alix from "./Alix.svelte";
  import Vis from "./Vis.svelte";
  const width = 600;
  const height = 800;
  // var spiral = d3_radial
  //   .spiral([width / 2, height / 2])
  //   .increment(10)
  //   .coil(6);
  var radialLocation = function (center, angle, width, height, taper) {
    const [x, y] = center;
    return [
      x + (width * Math.cos((angle * Math.PI) / 180) - taper),
      y + (height * Math.sin((angle * Math.PI) / 180) - taper),
    ];
  };
  // let translate = null;
  const placement = (nodes, cx, cy, r) => {
    const increment = 180 / nodes.length;
    let current = -75;

    return nodes.map((d) => {
      const [tx, ty] = radialLocation([cx, cy], current, r, r, 1);
      const [lx, ly] = radialLocation([cx, cy], current, r + 100, r + 100, 1);
      current += increment;
      return { ...d, tx, ty, lx, ly };
    });
  };

  const dreams = {
    id: "dreams",
    values: data,
    color: "blue",
    size: 100, //Math.min(40, objects.length),
    tx: width / 2,
    ty: height / 2,
  };

  const ns = [
    {
      id: "objects",
      values: objects,
      color: "blue",
      size: 40, //Math.min(40, objects.length),
    },
    {
      id: "persons",
      values: persons,
      color: "green",
      size: 40, //Math.min(40, persons.length),
    },
    {
      id: "animals",
      values: animals,
      color: "brown",
      size: 40, //Math.min(40, animals.length),
    },
    {
      id: "vehicles",
      values: vehicles,
      color: "red",
      size: 40, //Math.max(40, vehicles.length),
    },
    {
      id: "places",
      values: places,
      color: "yellow",
      size: 40, //Math.max(40, places.length),
    },
  ];
  const tmpNodes = placement(ns, width / 2, height / 2, 150);
  let nodes = [];
  let simulation = null;
  let cont = null;
  onMount(() => {
    console.log("cont", cont);

    simulation = d3
      .forceSimulation([...tmpNodes, dreams])
      // .force("box", boxForce)
      // .force("r", radialForce)
      .force("collision", d3.forceCollide((d) => d.size / 2).strength(1))
      .force("x", d3.forceX((d) => d.tx).strength(1))
      .force("y", d3.forceY((d) => d.ty).strength(1))
      // .force("collision", collisionForce)
      // .force( //   "link",
      //   d3.forceLink(links).id((d) => d.index)
      // )
      // .force("X", d3.forceX((d) => d.sx).strength(1))
      // .force("Y", d3.forceY((d) => d.sy).strength(1))
      .force("charge", d3.forceManyBody())
      // .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", () => {
        // console.log("tick", simulation.nodes());
        nodes = simulation.nodes();
      });
  });

  let bounds = null;
  let xx = 0;
  let yy = 0;
  let translate;
  $: {
    bounds = [
      [
        nodes.length ? array.min(nodes, (d) => d.lx) : 0,
        nodes.length ? array.min(nodes, (d) => d.ly) : 0,
      ],
      [
        nodes.length ? array.max(nodes, (d) => d.lx) : width,
        nodes.length ? array.max(nodes, (d) => d.ly) : height,
      ],
    ];

    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    xx = (bounds[0][0] + bounds[1][0]) / 2;
    yy = (bounds[0][1] + bounds[1][1]) / 2;
    console.log("bounds", bounds);
    let scale = Math.max(
      0.1,
      Math.min(20, 0.9 / Math.max(dx / (width - 50), dy / (height - 10)))
    );

    translate = [width / 2 - scale * xx, height / 2 - scale * yy, scale];
  }
</script>

<style>
  #zoom-cont {
    transform-origin: 0 0;
  }
</style>

<div
  class="relative border border-black overflow-hidden"
  bind:this={cont}
  style="width:{width}px; height:{height}px;}">
  <div
    id="zoom-cont"
    class="w-full h-full"
    style="transform: {translate ? `translate(${translate[0]}px, ${translate[1]}px) scale(${translate[2]})` : `translate(0%,0%)`}">
    {#each nodes as n (n.id)}
      <div
        on:click={() => {
          const ns = placement(n.values, n.tx, n.ty, 200);
          const drs = placement(dreams.values.slice(0, 20), n.tx, n.ty, 300);

          console.log('drs', drs);
          const newNodes = [n, ...ns, ...drs];
          simulation.nodes(newNodes);
          // nodes = ns;
          console.log('coll', array);
          simulation.alpha(1);
          simulation.restart();
          console.log('bounds', bounds);
        }}
        class="absolute overflow-hidden border-2 border-black rounded-full"
        style="left:{n.x - n.size / 2}px; top:{n.y - n.size / 2}px; width:{n.size}px; height:{n.size}px; background: {n.color}; " />
    {/each}
    {#each nodes as n (n.id)}
      <div
        class="absolute "
        style="left:{n.lx}px; top:{n.ly}px; transform: translate(-50%, -50%)">
        {n.id}
      </div>
    {/each}
    <!-- <div
      class="bg-black w-3 h-3 absolute"
      style="left:{bounds[0][0]}px; top:{bounds[0][1]}px" />
    <div
      class="bg-black w-3 h-3 absolute"
      style="left:{bounds[1][0]}px; top:{bounds[1][1]}px" />
    <div
      class="bg-green-500 w-3 h-3 absolute"
      style="left:{xx}px; top:{yy}px" /> -->
  </div>
</div>
