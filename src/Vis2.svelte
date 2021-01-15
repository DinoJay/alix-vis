<script>
  import { onMount } from "svelte";
  // import d3_radial from "d3-radial";
  import * as d3 from "d3-force";

  import * as shape from "d3-shape";

  import uniq from "lodash.uniqby";
  // import * as z from "d3-zoom";
  import * as array from "d3-array";
  import * as sel from "d3-selection";
  import Alix from "./Alix.svelte";
  // import Vis from "./Vis.tmp";
  import { bboxCollide } from "d3-bboxCollide";
  import Arrow from "./Arrow.svelte";
  import { organizeData } from "./lib";
  import { polygonCentroid } from "d3-polygon";
  import App from "./App.svelte";
  import Node from "./Node.svelte";

  import RadialLabels from "./RadialLabels.svelte";
  const arc = shape.arc();
  const line = shape.line();

  export let data = [];
  export let objects = [];
  export let persons = [];
  export let animals = [];
  export let vehicles = [];
  export let places = [];

  const START_ANGLE = -140;
  const END_ANGLE = 360;
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
    return [x + width * Math.cos(angle), y + height * Math.sin(angle)];
  };
  // let translate = null;
  const placement = (nodes, cx, cy, r, half) => {
    const increment = END_ANGLE / nodes.length; //: 360 / nodes.length;
    let current = START_ANGLE;
    const rad = degrees_to_radians(rad);

    return nodes.map((d, i) => {
      // const angle = ((i / (nodes.length / 2)) * Math.PI) / 2;
      const angle = degrees_to_radians(current);
      const [tx, ty] = radialLocation([cx, cy], angle, r, r, 0);
      const [lx, ly] = radialLocation([cx, cy], angle, r + 50, r + 50, 0);
      current += increment;
      console.log(d, "angle", angle);
      return {
        ...d,
        tx,
        ty,
        lx,
        ly,
        angle,
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

  const dreams = {
    ...ns.find((n) => n.id === "dreams"),
    angle: 0,
    tx: width / 2,
    ty: height / 2,
  };
  const otherData = ns.filter((n) => n.id !== "dreams");

  const r = 150;
  let center = [width / 2, height / 2, r];
  const tmpNodes = placement(otherData, width / 2, height / 2, r, true);
  let nodes = [...tmpNodes, dreams];
  let counter = 0;
  let domNodes = [];
  let dims = [];
  const simulation = d3
    .forceSimulation([...nodes])
    // .alphaMin(0.5)
    .force(
      "collision",
      d3
        .forceCollide((d) => {
          return d.size; //d.w / 2;
        })
        .strength(1)
    )

    .force("x", d3.forceX((d) => d.tx).strength(0.2))
    .force("y", d3.forceY((d) => d.ty).strength(0.2))
    // .force("charge", d3.forceManyBody())
    // .force("center", d3.forceCenter(width / 2, height / 2).strength(0.5))

    .on("tick", () => {
      // if (counter % 10 === 0)
      nodes = simulation.nodes();
      // counter++;
    });

  let bounds = null;
  let translate;

  console.log("nodes", nodes);
  let dreamsNode = nodes.find((d) => d.id === "dreams");
  let level1Node = nodes.find((d) => {
    console.log("d", d.level);

    return d.level === 1;
  });

  $: {
    console.log("nodes", nodes);
    dreamsNode = nodes.find((d) => d.id === "dreams");
    level1Node = nodes.find((d) => d.type === 1);
    console.log("levelNode", level1Node);
    // console.log("dreamsNode", dreamsNode);
    // console.log("nodes", nodes);
    if (domNodes.length > 0) {
      const bbox = (i) =>
        domNodes[i]
          ? domNodes[i].getBBox(domNodes[i])
          : { width: 0, height: 0 };
      bounds = [
        [
          array.min(nodes, (d, i) => d.x - bbox(i).width / 1.5),
          array.min(nodes, (d, i) => d.y - bbox(i).height / 1.5),
        ],
        [
          array.max(nodes, (d, i) => d.x + bbox(i).width / 1.5),
          array.max(nodes, (d, i) => d.y + bbox(i).height / 1.5),
        ],
      ];

      // console.log("bounds", bounds);
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
  }

  let state = 0;
  const firstClickHandler = (n) => {
    n.size = !n.selected ? 10 : 7;
    // n.tx = 0;
    // n.ty = 0;
    console.log("n", n);
    // console.log("groups", groups);
    // const gr = group(n.values)

    const r = 150;
    const xPad = 120;
    const xPadBetween = 50;
    const groups = placement(n.groups, n.tx, n.ty, r, true);
    const linkedDreams = n.linkedDreams.map((d) => ({
      ...d,
      angle: 0,
      tx: n.tx, //width / 2,
      ty: n.ty, //height / 2,
      size: 5,
    })); //placement(n.linkedDreams, n.tx, n.ty, 300, true);

    center = [n.tx, n.ty, r];
    const newNodes = [
      {
        ...dreams,
        size: 20,
        x: 0,
        tx: n.tx - r - xPad - xPadBetween,
        ty: n.ty,
        angle: degrees_to_radians(-230),
      },
      ...linkedDreams,
      ...groups,
      {
        ...n,
        tx: n.tx - r - xPad / 2,
        angle: degrees_to_radians(-230),
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
    n.size = !n.selected ? 12 : 7;
    const ls = n.linkedDreams.map((d) => ({ ...d, visible: false }));

    const ns = placement(n.values, n.tx, n.ty, 200, true);
    const na = placement(ls, n.tx, n.ty, 0, true);

    const newNodes = [{ ...n, tx: 200, ty: height / 2 }, ...na, ...ns];
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
  .trans {
    transform-origin: 0 0;
  }
</style>

<div
  class="relative border border-black overflow-hidden"
  style="width:{width}px; height:{height}px;}">
  <svg
    {width}
    {height}
    id="zoom-cont"
    class="left-0 top-0 absolute  overflow-visible"
    style="transform: {translate ? `translate(${translate[0]}px, ${translate[1]}px) scale(${translate[2]})` : `translate(0%,0%)`}; ">
    <g transform="translate({center[0]}, {center[1]})">
      <path
        stroke-width="2px"
        stroke="green"
        fill="none"
        d={arc({
          innerRadius: r,
          outerRadius: r,
          startAngle: degrees_to_radians(START_ANGLE),
          endAngle: degrees_to_radians(END_ANGLE),
        })} />
    </g>

    {#if state === 1}
      <path
        d={line([
          [dreamsNode.x + 15, dreamsNode.y],
          [dreamsNode.x + 100, dreamsNode.y],
        ])}
        fill="none"
        stroke-width="4px"
        stroke="black" />
    {/if}

    {#each nodes as n, i (n.id)}
      <g
        class="text-green-500"
        bind:this={domNodes[i]}
        on:click={() => {
          clickHandlers[state](n);
          state++;
        }}>
        <circle
          class="border-2 text-gray-500"
          r={n.size}
          cx={n.x}
          cy={n.y}
          fill="black" />
        <text
          class={!n.visible && 'hidden'}
          x={n.x}
          y={n.y}
          dy=".35em"
          dx={n.size + 5}
          text-anchor="start"
          transform="rotate({(n.angle * 180) / Math.PI}, {n.x}, {n.y})">
          {n.title}
        </text>
      </g>
    {/each}
  </svg>
</div>
