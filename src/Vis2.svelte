<script>
  import { onMount } from "svelte";

  import { group } from "d3-array";
  // import d3_radial from "d3-radial";
  import * as d3 from "d3-force";
  import RadialLabels from "./RadialLabels.svelte";
  import * as sc from "d3-scale";

  import { Delaunay } from "d3-delaunay";
  import { polygonCentroid, polygonArea } from "d3-polygon";
  import * as shape from "d3-shape";

  import uniq from "lodash.uniqby";
  // import * as z from "d3-zoom";
  import * as array from "d3-array";
  import * as sel from "d3-selection";
  import Alix from "./Alix.svelte";
  // import Vis from "./Vis.tmp";
  // import { bboxCollide } from "d3-bboxCollide";
  import { organizeData, colors } from "./lib";
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

  const getDistance = ([x1, y1], [x2, y2]) => {
    var a = x1 - x2;
    var b = y1 - y2;

    var c = Math.sqrt(a * a + b * b);
    return Math.abs(c);
  };

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

  const width = 875;
  const height = 875;
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
        radius,
        maxRadius: r,
        dist: r - radius,
        angleDeg,
        // visible: i % 2,
      };
    });
  };

  const rawData = organizeData({
    dreams,
    objects,
  });
  const data = rawData.map((d, i) => ({
    ...d,
    values: d.values.map((d) => ({ ...d, element: true })),
    initial: true,
    visible: false,
    // title: d.id,
    size: 7,
  }));
  const allData = data.flatMap((d) => d.values);
  console.log("allData", allData);

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
    r: 0,
    dist: r,
    maxRadius: r,
    size: 20,
  };
  let domNodes = [];

  const simulation = d3
    .forceSimulation([...nodes, dreamNode])
    .alphaMin(0.5)
    // .tick(1)
    .force(
      "collision",
      d3
        .forceCollide((d) => {
          return d.size + 3; //d.w / 2;
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
      // nodes.forEach((n) => {
      //   n.visible = true;
      // });
      // counter++;
    });
  // .on("end", () => {
  //   domNodes.map((n, i) => {
  //     const ns = domNodes.filter((o, j) => {
  //       return collide(n.getBBox(), o.getBBox());
  //     });
  //     console.log("ns", ns);
  //     if (ns.length > 0) {
  //       console.log("yeah", n.id);
  //       nodes[i].visible = false;
  //     }
  //     // else n.visible = true;
  //   });
  // });

  let bounds = null;
  let translate;
  let voronoi;
  let cells = [];
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
        1,
        Math.min(20, 0.9 / Math.max(dx / width, dy / height))
      );

      translate = [width / 2 - scale * xx, height / 2 - scale * yy, scale];
      const ds = nodes.map((d) => [d.x, d.y]);
      const delaunay = Delaunay.from(ds);
      voronoi = delaunay.voronoi([-100, -100, width + 100, height + 100]);
      console.log("nodes", nodes);

      cells = ds.map((d, i) => [d, voronoi.cellPolygon(i)]);
    }
  }

  let state = 0;
  const size = 2;
  const initialClickHandler = (n) => {
    console.log("initialClickHandler", n);

    const r = Math.max(90, n.values.length * 1.5);

    const groups = placement(n.values, n.tx, n.ty, r).map((d) => ({
      ...d,
      size,
    }));

    center = [n.tx, n.ty, r];
    const newNodes = [...groups, n];
    simulation.nodes(newNodes);
    simulation.alpha(1);
    simulation.restart();
  };

  let prevAngle = 0;
  const getRadius = (values) => {
    const circum = values.length * (size + 1) * 2; //2 * Math.PI * r
    const r = Math.max(150, circum / (Math.PI * 2));
    return r;
  };
  const elementClickHandler = (n) => {
    console.log("elementClickHandler", n);

    const elems = Object.entries(n.links)
      .flatMap(([type, values]) =>
        [...group(values, (d) => d)].map(([id, values]) => {
          // console.log("allData", allData);
          const ob = allData.find((d) => d.id === id);
          const n = nodes.find((n) => n.id === id) || {
            x: width / 2,
            y: height / 2,
          };
          return {
            ...ob,
            x: n.x,
            y: n.y,

            strength: values.length,
          };
        })
      )
      .filter((e) => e.id !== n.id);

    const gr = group(elems, (d) => d.id);
    // console.log("gr", gr);
    // console.log("elems", elems);

    const r = getRadius(elems) / (elems.length > 200 ? 1.5 : 1);
    const elemNodes = placement(elems, width / 2, height / 2, r);

    const domain = array.extent(elemNodes, (d) =>
      d.links ? Object.values(d.links).flat().length : 0
    );
    const sizeScale = sc.scaleLinear().domain(domain).range([1, 10]);
    elemNodes.forEach((d) => {
      d.size = d.links
        ? sizeScale(Object.values(d.links).flat().length)
        : d.values.length;
    });

    const newNodes = uniq(
      [
        { ...n, selected: true, size: 20, tx: width / 2, ty: height / 2 },
        ...elemNodes,
      ],
      "id"
    );
    simulation.nodes(newNodes);
    simulation.alpha(1);
    simulation.restart();
  };

  const getSize = ([[x, y], cell]) => {
    if (!cell) return 0;
    const area = -polygonArea(cell);
    return area;
    // const dist = getDistance([cx, cy], [x, y]);
    // console.log("dist", dist);
    // return dist;
  };
  const getAngle = ([[x, y], cell]) => {
    if (!cell) return 0;
    const [cx, cy] = polygonCentroid(cell);
    const angle = (Math.atan2(cy - y, cx - x) / Math.PI) * 2;

    const angleRounded =
      (Math.round((Math.atan2(cy - y, cx - x) / Math.PI) * 2) + 4) % 4;
    return angleRounded === 0
      ? "right"
      : angleRounded === 3
      ? "top"
      : angleRounded === 1
      ? "bottom"
      : "left";
    // return radians_to_degrees(angle);
    // const dist = getDistance([cx, cy], [x, y]);
    // console.log("dist", dist);
    // return dist;
  };

  const orientTextAnchor = {
    top: "middle",
    right: "start",
    bottom: "middle",
    left: "end",
  };

  const orientDy = {
    right: "0.35em",
    bottom: "0.70em",
    left: "0.35em",
  };

  const orientY = (n) => ({
    top: -n.size - 1,
    right: n.size + 1,
    left: -n.size,
    bottom: n.size,
  });
  const orientX = (n) => ({
    top: 0,
    bottom: 0,
    right: 0, //n.size/2,
    left: Math.min(-n.size, -7),
  });
  const getRotate = (n) => {
    return `rotate(${(n.angle * 180) / Math.PI}, ${n.x}, ${n.y})`;
  };
  const getXOffset = (n, i) => {
    const ret = n.dist > 10 && cells[i] ? orientX(n)[getAngle(cells[i])] : 0;
    return ret;
  };
  const getYOffset = (n, i) => {
    const ret = n.dist > 10 && cells[i] ? orientY(n)[getAngle(cells[i])] : 0;
    return ret;
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
    <g transform="translate({center[0]}, {center[1]})">
      <path
        class="hidden fill-current text-gray-500"
        stroke-width="2px"
        d={arc({
          innerRadius: r,
          outerRadius: 50,
          startAngle: degrees_to_radians(START_ANGLE),
          endAngle: degrees_to_radians(END_ANGLE),
        })} />
    </g>

    <g>
      {#each nodes as n, i (n.id)}
        <circle
          on:click={() => {
            state++;
            if (n.initial) return initialClickHandler(n);
            if (n.element) return elementClickHandler(n);
          }}
          class="opacity-70 cursor-pointer stroke-current border-black"
          fill={colors[n.type]}
          r={n.size}
          cx={n.x}
          cy={n.y} />
      {/each}
      {#each nodes as n, i (n.id)}
        <g
          on:click={() => {
            state++;
            if (n.initial) return initialClickHandler(n);
            if (n.element) return elementClickHandler(n);
          }}>
          <text
            bind:this={domNodes[i]}
            class={' cursor-pointer'}
            fill={colors[n.type]}
            font-size="10px"
            x={n.x + getXOffset(n, i)}
            y={n.y + getYOffset(n, i)}
            dy={n.dist > 10 && cells[i] ? orientDy[getAngle(cells[i])] : '0.35em'}
            dx={n.size + 1}
            text-anchor={n.dist > 10 && cells[i] && orientTextAnchor[getAngle(cells[i])]}
            transform={n.dist < 20 && nodes.length > 10 ? getRotate(n) : ''}>
            {#if !(cells[i] && getSize(cells[i]) < 1000)}{n.title}{/if}
          </text>
          <title>{n.title}</title>
        </g>
      {/each}
    </g>

    <path fill="none" stroke="none" d={voronoi && voronoi.render()} />
  </svg>
</div>
