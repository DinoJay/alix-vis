<script>
  import { onMount } from "svelte";

  import { group } from "d3-array";
  // import d3_radial from "d3-radial";
  import * as d3 from "d3-force";
  import * as sc from "d3-scale";

  import { Delaunay } from "d3-delaunay";
  import { polygonCentroid, polygonArea } from "d3-polygon";

  import { types as initialNodeTypes } from "./lib";
  import uniq from "lodash.uniqby";
  import sortBy from "lodash.sortBy";
  // import * as z from "d3-zoom";
  import * as array from "d3-array";
  import * as sel from "d3-selection";
  import Alix from "./Alix.svelte";
  // import Vis from "./Vis.tmp";
  // import { bboxCollide } from "d3-bboxCollide";
  import { organizeData, colors } from "./lib";

  import { nodeTypes } from "./store.js";

  import App from "./App.svelte";

  export let dreams = [];
  export let objects = [];
  export let width = 0;
  let initial = true;

  const height = width;

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

  const getRadius = (values) => {
    const size = 2;
    const circum = values.length * (size + 1) * 2; //2 * Math.PI * r
    const r = Math.max(150, circum / (Math.PI * 2));
    return r;
  };
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
    return sortBy(nodes, (n) => (!initial ? n.type : null)).map((d, i) => {
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
    //(d) => d.type
    //);
  };

  const rawData = organizeData({
    dreams,
    objects,
  });
  const data = rawData.map((d, i) => ({
    ...d,
    values: d.values.map((d) => ({ ...d, element: true })),
    visible: false,
    // title: d.id,
    size: 7,
  }));

  const allData = uniq([...data.flatMap((d) => d.values)], "id");
  const domain = array.extent(allData, (d) =>
    d.links ? Object.values(d.links).flat().length : 0
  );
  const sizeScale = sc.scaleLinear().domain(domain).range([1, 10]);
  allData.forEach((d) => {
    d.size = d.links
      ? sizeScale(Object.values(d.links).flat().length)
      : d.values.length;
    d.angle = 0;
  });

  const selData = allData.filter((d) => d.size > 1);
  const r = getRadius(selData);
  let center = [width / 2, height / 2, r];
  let nodes = placement(selData, width / 2, height / 2, r).map((d) => ({
    ...d,
    r,
  }));

  let domNodes = [];

  const simulation = d3
    .forceSimulation([...nodes])
    .alphaMin(0.6)
    .force(
      "collision",
      d3
        .forceCollide((d) => {
          return d.size + 3; //d.w / 2;
        })
        .strength(1)
    )
    .force("center", d3.forceCenter(width / 2, height / 2).strength(0.5))

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

  const restartSim = (ns) => {
    simulation
      .force("x", d3.forceX((d) => d.tx).strength(0.2))
      .force("y", d3.forceY((d) => d.ty).strength(0.2))
      .nodes(ns)
      .alpha(1)
      .restart();
  };

  let bounds = null;
  let translate;
  let voronoi;
  let cells = [];

  $: {
    nodeTypes.update(sortBy([...group(nodes, (d) => d.type).keys()], (d) => d));

    if (domNodes.length > 0) {
      const bbox = (i) =>
        domNodes[i]
          ? domNodes[i].getBBox(domNodes[i])
          : { width: 0, height: 0 };
      bounds = [
        [
          array.min(nodes, (d, i) => d.x - bbox(i).width / 1.5),
          array.min(nodes, (d, i) => d.y - bbox(i).height * 1.5),
        ],
        [
          array.max(nodes, (d, i) => d.x + bbox(i).width / 1.5),
          array.max(nodes, (d, i) => d.y + bbox(i).height * 1.5),
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

      console.log("scale", scale);
      translate = [width / 2 - scale * xx, height / 2 - scale * yy, scale];

      const ds = nodes.map((d) => [d.x, d.y]);
      const delaunay = Delaunay.from(ds);
      voronoi = delaunay.voronoi([-100, -100, width + 100, height + 100]);

      cells = ds.map((d, i) => [d, voronoi.cellPolygon(i)]);
    }
  }

  const extractElems = (n, allData) => {
    const elems = Object.entries(n.links)
      .flatMap(([type, values]) =>
        [...group(values, (d) => d)].map(([id, values]) => {
          const ob = allData.find((d) => d.id == id);
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

    const r = getRadius(elems) / (elems.length > 200 ? 1.5 : 1);
    const elemNodes = placement(
      uniq(elems, "id"),
      width / 2,
      height / 2,
      r,
      0,
      360
    ).map((d) => ({ ...d, r }));
    return elemNodes;
  };
  const elementClickHandler = (n) => {
    initial = false;
    console.log("elementClickHandler", n);
    const elemNodes = extractElems(n, allData);

    const newNodes = uniq(
      [
        {
          ...n,
          selected: true,
          angle: degrees_to_radians(90),
          size: 20,
          tx: width / 2,
          ty: height / 2,
        },
        ...elemNodes,
      ],
      "id"
    );
    restartSim(newNodes);
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
    top: -n.size - 3,
    right: n.size + 2,
    left: -n.size - 2,
    bottom: n.size * 1.5,
  });

  const orientX = (n) => ({
    top: 0,
    bottom: 0,
    right: 0, //n.size/2,
    left: 0, //Math.min(-n.size * 2, -7),
  });
  const getRotate = (n) => {
    return `rotate(${(n.angle * 180) / Math.PI}, ${n.x}, ${n.y})`;
  };
  const distMaxRad = 29;
  const getXOffset = (n, i) => {
    if (!n.selected && nodes.length < 40) return 0;
    // if (n.selected) return -n.size;
    const ret =
      n.dist / n.maxRadius > distMaxRad / n.maxRadius && cells[i]
        ? orientX(n)[getAngle(cells[i])]
        : 2;
    return ret || 0;
  };
  const getYOffset = (n, i) => {
    if (!n.selected && nodes.length < 40) return 0;
    // if (n.selected) return -n.size - 5;
    const ret =
      n.dist / n.maxRadius > distMaxRad / n.maxRadius && cells[i]
        ? orientY(n)[getAngle(cells[i])]
        : 0;
    return ret || 0;
  };
  const getTextOrient = (n, i) => {
    if (!n.selected && nodes.length < 40) return "start";
    if (cells[i]) {
      const orient = getAngle(cells[i]);
      if (initial && n.id === "chambre") return "end";
      // console.log(
      //   "n dist",
      //   n.dist,
      //   "maxRad",
      //   n.maxRadius,
      //   "distMax",
      //   distMaxRad
      // );
      if (n.dist / n.maxRadius > distMaxRad / n.maxRadius && cells[i])
        return orientTextAnchor[orient];
    }

    return "start";
  };
  const getDY = (n, i) => {
    if (!n.selected && nodes.length < 40) return "0.35em";
    if (n.selected) return 0;
    if (n.dist > distMaxRad && cells[i]) return orientDy[getAngle(cells[i])];
    return "0.35em";
  };
  const getTransform = (n, i) => {
    let rot = "";
    if (
      (!n.selected && n.dist / n.maxRadius < distMaxRad / n.maxRadius) ||
      (!n.selected && nodes.length < 40)
    )
      rot = getRotate(n);
    return `${rot} translate(${getXOffset(n, i)}, ${getYOffset(n, i)})`;
  };
  const labelShown = (n, i) => {
    if (initial && n.size > 4) return true;
    return !(cells[i] && getSize(cells[i]) < 1000);
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

<div class="relative flex">
  <svg
    {width}
    {height}
    id="zoom-cont"
    class="m-auto "
    style="transform: {translate ? `translate(${translate[0]}px, ${translate[1]}px) scale(${translate[2]})` : `translate(0%,0%)`}; ">
    <defs>
      <filter x="0" y="0" width="1" height="1" id="solid">
        <feFlood flood-color="black" flood-opacity="0.5" result="bg" />
        <feMerge>
          <feMergeNode in="bg" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <g>
      {#each nodes as n, i (n.id)}
        <circle
          on:click={() => {
            elementClickHandler(n);
          }}
          class=" cursor-pointer stroke-current border-black"
          opacity={initial && n.size < 4 ? 0.3 : 0.7}
          fill={colors[n.type]}
          r={n.size}
          cx={n.x}
          cy={n.y} />
      {/each}
      {#each nodes as n, i (n.id)}
        <g
          on:click={() => {
            elementClickHandler(n);
          }}>
          <text
            bind:this={domNodes[i]}
            class={' cursor-pointer'}
            font-weight={n.selected || (initial && n.size > 4) ? 'bold' : ''}
            fill={colors[n.type]}
            font-size={n.selected ? '12px' : '10px'}
            x={n.x}
            y={n.y}
            dy={getDY(n, i)}
            dx={n.size + 1}
            text-anchor={getTextOrient(n, i)}
            transform={getTransform(n, i)}>
            {#if labelShown(n, i)}{n.title}{/if}
          </text>
          <title>{n.title}</title>
        </g>
      {/each}
    </g>

    <path fill="none" stroke="none" d={voronoi && voronoi.render()} />
  </svg>
</div>
