<script>
  import { onMount } from "svelte";

  import { group } from "d3-array";
  // import d3_radial from "d3-radial";
  import * as d3 from "d3-force";
  import RadialLabels from "./RadialLabels.svelte";
  import * as sc from "d3-scale";

  import * as shape from "d3-shape";

  import uniq from "lodash.uniqby";
  // import * as z from "d3-zoom";
  import * as array from "d3-array";
  import * as sel from "d3-selection";
  import Alix from "./Alix.svelte";
  // import Vis from "./Vis.tmp";
  // import { bboxCollide } from "d3-bboxCollide";
  import Arrow from "./Arrow.svelte";
  import { organizeData } from "./lib";
  import App from "./App.svelte";
  import Node from "./Node.svelte";

  const arc = shape.arc();
  const line = shape.line();

  export let dreams = [];
  export let objects = [];

  const START_ANGLE = 0;
  const END_ANGLE = 360;
  function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
  }
  function radians_to_degrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
  }

  function collide(nodeBox, otherBox) {
    const nodeLeft = nodeBox.x;
    const nodeRight = nodeBox.x + nodeBox.width;
    const nodeTop = nodeBox.y;
    const nodeBottom = nodeBox.y + nodeBox.height;

    const otherLeft = otherBox.x;
    const otherRight = otherBox.x + otherBox.width;
    const otherTop = otherBox.y;
    const otherBottom = otherBox.y + otherBox.height;

    const collideHoriz = nodeLeft < otherRight && nodeRight > otherLeft;
    const collideVert = nodeTop < otherBottom && nodeBottom > otherTop;

    return collideHoriz && collideVert;
  }

  const width = 775;
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
  const placement = (
    nodes,
    cx,
    cy,
    r,
    startAngle = START_ANGLE,
    endAngle = END_ANGLE
  ) => {
    const increment = (endAngle - startAngle) / nodes.length; //: 360 / nodes.length;
    let current = startAngle;
    const rad = degrees_to_radians(rad);
    const scale = sc

      .scalePow()
      .exponent(0.1)
      // .scaleSqrt()
      .domain(array.extent(nodes, (d) => d.strength))
      .range([r + 50, 50]);

    const maxStrength = 1 / array.max(nodes, (d) => d.strength);
    return nodes.map((d, i) => {
      const angle = degrees_to_radians(current);
      const strength = 1 / d.strength;
      const radius = scale(d.strength); //((r / 6) * strength) / maxStrength;
      const angleDeg = current;
      const [tx, ty] = radialLocation([cx, cy], angle, radius, radius, 0);
      current += increment;
      return {
        ...d,
        tx,
        ty,
        angle,
        angleDeg,
      };
    });
  };

  const rawData = organizeData({
    dreams,
    objects,
  });
  const data = rawData.map((d) => ({
    ...d,
    values: d.values.map((d) => ({ ...d, element: true })),
    initial: true,
    visible: true,
    // title: d.id,
    size: 7,
  }));
  const allData = data.flatMap((d) => d.values);

  const r = 150;
  let center = [width / 2, height / 2, r];
  let nodes = placement(data, width / 2, height / 2, r);
  const dreamNode = {
    values: allData,
    angle: 0,
    id: "dreams",
    title: "Dreams",
    tx: width / 2,
    ty: height / 2,
    x: width / 2,
    y: height / 2,
    visible: true,
    size: 12,
  };
  let domNodes = [];
  let textNodes = [];

  const simulation = d3
    .forceSimulation([...nodes, dreamNode])
    .alphaMin(0.6)
    .tick(1)
    .force(
      "collision",
      d3
        .forceCollide((d) => {
          return d.size + 1; //d.w / 2;
        })
        .strength(3)
    )

    .force("x", d3.forceX((d) => d.tx).strength(0.2))
    .force("y", d3.forceY((d) => d.ty).strength(0.2))
    // .force("charge", d3.forceManyBody())
    // .force("center", d3.forceCenter(width / 2, height / 2).strength(0.5))

    .on("tick", () => {
      // if (counter % 10 === 0)
      nodes = simulation.nodes();
      nodes.forEach((n) => {
        n.visible = true;
      });
      // counter++;
    })
    .on("end", () => {
      // textNodes.map((n, i) => {
      //   const ns = textNodes.filter((o, j) => {
      //     return (
      //       nodes[i].id !== nodes[j].id && collide(n.getBBox(), o.getBBox())
      //     );
      //   });
      //   console.log("ns", ns);
      //   if (!nodes[i].taken && ns.length > 0) {
      //     console.log("yeah", n.id);
      //     nodes[i].visible = false;
      //     nodes[i].taken = true;
      //   }
      //   // else n.visible = true;
      // });
    });

  let bounds = null;
  let translate;

  function inCircle(x, y, cx, cy, radius) {
    return (x - cx) * (x - cx) + (y - cy) * (y - cy) < radius * radius;
  }
  $: {
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

      const dx = bounds[1][0] - bounds[0][0];
      const dy = bounds[1][1] - bounds[0][1];
      const xx = (bounds[0][0] + bounds[1][0]) / 2;
      const yy = (bounds[0][1] + bounds[1][1]) / 2;
      let scale = Math.max(
        0.1,
        Math.min(20, 0.9 / Math.max(dx / width, dy / height))
      );

      translate = [width / 2 - scale * xx, height / 2 - scale * yy, scale];
    }
  }

  let state = 0;
  const initialClickHandler = (n) => {
    console.log("initialClickHandler", n);

    const r = Math.max(90, n.values.length * 1.5);

    const groups = placement(n.values, n.tx, n.ty, r).map((d) => ({
      ...d,
      size: 3,
    }));

    center = [n.tx, n.ty, r];
    const newNodes = [...groups, n];
    simulation.nodes(newNodes);
    simulation.alpha(1);
    simulation.restart();
  };

  let prevAngle = 0;
  const size = 7;
  const getRadius = (values) => {
    const circum = values.length * (size + 2) * 2; //2 * Math.PI * r
    const r = Math.max(150, circum / (Math.PI * 2));
    return r;
  };
  const elementClickHandler = (n) => {
    console.log("elementClickHandler", n);

    const elems = uniq(
      Object.entries(n.links)
        .flatMap(([type, values]) =>
          values.map((v) => {
            // console.log("allData", allData);
            const ob = allData.find((d) => d.id === v);
            // console.log("ob", ob);
            return { ...ob, size };
          })
        )
        .filter((e) => e.id !== n.id),
      "id"
    );
    // console.log("elems", elems);

    const elemNodes = placement(
      elems,
      width / 2,
      height / 2,
      getRadius(elems) / 2
    );

    const newNodes = uniq(
      [{ ...n, tx: width / 2, ty: height / 2 }, ...elemNodes],
      "id"
    );
    simulation.nodes(newNodes);
    simulation.alpha(1);
    simulation.restart();
  };

  const categoryHandler = (n) => {
    console.log("categoryHandler", n);
    // n.size = !n.selected ? 12 : 7;

    const values = uniq(
      Object.entries(n.links)
        .flatMap(([type, entries]) => {
          return entries.map((id) => ({
            ...allData.find((e) => e.id === id),
            id,
            type,
            links: { [type]: entries },
            size,
            // visible: false,
          }));
        })
        .filter((d) => d.id !== n.id),
      "id"
    );

    const r0 = getRadius(values);
    console.log("r0", r0);

    const dist = 500; //Math.max(r0 * 8, 25);
    console.log("dist", dist);

    const [nx, ny] = radialLocation([n.x, n.y], 0, dist, dist, 0);
    const valueNodes = placement(
      values,
      width / 2,
      height / 2,
      r0
      // radians_to_degrees(n.angle)
      // radians_to_degrees(n.angle) + 20
    );

    const newNodes = uniq([...nodes, ...valueNodes], "id");
    simulation.nodes(newNodes);
    simulation.alpha(1);
    simulation.restart();
  };
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
    <defs>
      <marker
        id="head"
        orient="auto"
        markerWidth="6"
        markerHeight="8"
        refX="0.1"
        refY="2">
        <path
          d="M0,0 V4 L5,2 Z"
          fill="red"
          class="fill-current text-blue-500" />
      </marker>
    </defs>
    <g transform="translate({center[0]}, {center[1]})">
      <path
        class="hidden stroke-current text-gray-500"
        stroke-width="2px"
        fill="none"
        d={arc({
          innerRadius: r,
          outerRadius: r,
          startAngle: degrees_to_radians(START_ANGLE),
          endAngle: degrees_to_radians(END_ANGLE),
        })} />
    </g>

    <g>
      {#each nodes as n, i (n.id)}
        <g
          class="text-green-500"
          bind:this={domNodes[i]}
          on:click={() => {
            if (n.initial) return initialClickHandler(n);
            if (n.element) return elementClickHandler(n);
          }}>
          <circle
            class="stroke-current stroke-2 text-blue-500"
            r={n.size}
            cx={n.x}
            cy={n.y}
            fill="white" />
          <text
            bind:this={textNodes[i]}
            class={!n.visible && 'hidden'}
            font-size="12px"
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
    </g>
  </svg>
</div>
