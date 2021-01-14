<script>
  import { onMount } from "svelte";
  // import d3_radial from "d3-radial";
  import * as d3 from "d3-force";
  import { Delaunay } from "d3-delaunay";

  import uniq from "lodash.uniqby";
  // import * as z from "d3-zoom";
  import * as array from "d3-array";
  import * as sel from "d3-selection";
  import Alix from "./Alix.svelte";
  // import Vis from "./Vis.tmp";
  import { bboxCollide } from "d3-bboxCollide";
  import Arrow from "./Arrow.svelte";
  import { organizeData, rectCollide } from "./lib";
  import { polygonCentroid } from "d3-polygon";
  import App from "./App.svelte";
  import Node from "./Node.svelte";
  import { null_to_empty } from "svelte/internal";

  export let data = [];
  export let objects = [];
  export let persons = [];
  export let animals = [];
  export let vehicles = [];
  export let places = [];

  function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
  }
  const width = 675;
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
    const increment = half ? 280 / (nodes.length - 1) : 360 / nodes.length;
    let current = -140;

    return nodes.map((d) => {
      const [tx, ty] = radialLocation([cx, cy], current, r, r, 0);
      const [lx, ly] = radialLocation([cx, cy], current, r + 50, r + 50, 0);
      current += increment;
      return {
        ...d,
        tx,
        ty,
        lx,
        ly,
        angle: degrees_to_radians(current),
      };
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
  let counter = 0;
  let domNodes = [];
  let dims = [];
  const simulation = d3
    .forceSimulation([...tmpNodes, dreams].map((d) => ({ ...d, w: 96, h: 30 })))
    // .alphaMin(0.5)
    .force(
      "collision",
      d3
        .forceCollide((d) => {
          return 5; //d.w / 2;
        })
        .strength(1)
    )

    // .force(
    //   "force",
    //   rectCollide()
    //     .size((d) => {
    //       return [d.w, d.h];
    //     })
    //     .strength(5)
    // )
    .force("x", d3.forceX((d) => d.tx).strength(0.4))
    .force("y", d3.forceY((d) => d.ty).strength(0.4))
    // .force("charge", d3.forceManyBody())
    // .force("center", d3.forceCenter(width / 2, height / 2).strength(0.5))

    .on("tick", () => {
      // if (counter % 10 === 0)
      nodes = simulation.nodes();
      // counter++;
    });

  let bounds = null;
  let translate;

  let voronoi;
  $: {
    const delaunay = Delaunay.from(nodes.map((d) => [d.x, d.y]));
    voronoi = delaunay.voronoi([-1, -1, width + 1, height + 1]);
    const cells = nodes.map((d, i) => [[d.x, d.y], voronoi.cellPolygon(i)]);
    // console.log("cells", cells);
    // const angles = cells.map(([[x, y], cell]) => {
    //   const [cx, cy] = polygonCentroid(cell);
    //   // console.log("node", polygonCentroid(cell));
    //   // const angle =
    //   // var midAngle = d.endAngle < Math.PI ? d.startAngle/2 + d.endAngle/2 : d.startAngle/2  + d.endAngle/2 + Math.PI
    // });
    // console.log("angle", angles);

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

    console.log("nodes", nodes);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const xx = (bounds[0][0] + bounds[1][0]) / 2;
    const yy = (bounds[0][1] + bounds[1][1]) / 2;
    // console.log("bounds", bounds);
    let scale = Math.max(
      0.1,
      Math.min(20, 0.9 / Math.max(dx / width, dy / height))
    );

    translate = [width / 2 - scale * xx, height / 2 - scale * yy, scale];
  }

  let state = 0;
  const firstClickHandler = (n) => {
    n.size = !n.selected ? 100 : 25;
    // n.tx = 0;
    // n.ty = 0;
    console.log("n", n);
    // console.log("groups", groups);
    // const gr = group(n.values)

    const vals = placement(n.groups, n.tx, n.ty, 200, true);
    const linkedDreams = n.linkedDreams.map((d) => ({
      ...d,
      tx: n.tx, //width / 2,
      ty: n.ty, //height / 2,
    })); //placement(n.linkedDreams, n.tx, n.ty, 300, true);

    // console.log("linkedDreams", linkedDreams);
    // console.log("vals", vals);
    const newNodes = [
      ...linkedDreams,
      ...vals,
      {
        ...n,
        tx: 0, //n.tx - 200 - n.size,
        x: 0,
        ty: n.ty, //height / 2 - n.size / 2,
        y: height / 2 - n.size / 2,
      },
    ];
    simulation.nodes(newNodes);
    simulation.alpha(1);
    simulation.restart();
  };
  const secClickHandler = (n) => {
    n.size = !n.selected ? 80 : 25;

    const ns = placement(n.values, n.tx, n.ty, 300, true);
    const na = placement(n.linkedDreams, n.tx, n.ty, 400, true);

    const newNodes = [n, ...na, ...ns];
    simulation.nodes(newNodes);
    simulation.alpha(1);
    // simulation.alphaMin(0.2);
    simulation.restart();
    // console.log('bounds', bounds);
  };
  const clickHandlers = [firstClickHandler, secClickHandler];
  let tmp;
</script>

<style>
  #zoom-cont {
    transform-origin: 0 0;
  }
  .trans {
    transform-origin: 0 0;
  }
</style>

<div
  class="relative border border-black overflow-hidden"
  style="width:{width}px; height:{height}px;}">
  <div
    id="zoom-cont"
    class="relative w-full h-full transition-all"
    style="transform: {translate ? `translate(${translate[0]}px, ${translate[1]}px) scale(${translate[2]})` : `translate(0%,0%)`}; ">
    <svg class="w-full h-full absolute"><path
        fill="none"
        stroke="black"
        d={voronoi && voronoi.render()} /></svg>
    {#each nodes as n, i (n.id)}
      <div
        bind:this={domNodes[i]}
        on:click={() => {
          clickHandlers[state](n);
          state++;
        }}
        class=" trans flex absolute  overflow-visible transition border-2 -white"
        style="left:{n.x - n.size / 2}px; top:{n.y - n.size / 2}px; width:{n.size}px; height:{n.size}px;
        ">
        <div
          class="m-auto bg-white whitespace-nowrap "
          style="transform:rotate(-90deg) rotate({(n.angle * 180) / Math.PI}deg)  translate({0}px,0)">
          {#if n.visible || n.selected}{n.title}{/if}
        </div>
      </div>
    {/each}
    <div />

    <!-- <div
      class="bg-black w-3 h-3 absolute"
      style="left:{bounds[1][0]}px; top:{bounds[1][1]}px" />
    <div
      class="bg-green-500 w-3 h-3 absolute"
      style="left:{xx}px; top:{yy}px" /> -->
  </div>
</div>
