<script>
  import { onMount } from "svelte";

  import { group } from "d3-array";
  // import d3_radial from "d3-radial";
  import * as d3 from "d3-force";
  import * as sc from "d3-scale";
  import tsnejs from "tsne";

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

  export let dreams = [];
  export let objects = [];
  export let width = 0;
  let initial = true;

  const height = width;
  let nodes = [];

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
  const allData1 = allData.map((d) => ({
    ...d,
    links: Object.values(d.links).flat(),
  }));

  console.log("allData1", allData1);

  const dists = allData1.map((a) =>
    allData1.map((b) => {
      return 2; //b.links.filter((id) => a.id === id).length;
    })
  );

  console.log("dists", dists);
  var opt = {};
  opt.epsilon = 10; // epsilon is learning rate (10 = default)
  opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
  opt.dim = 2; // dimensionality of the embedding (2 = default)

  var tsne = new tsnejs.tSNE(opt); // create a tSNE instance

  // initialize data. Here we have 3 points and some example pairwise dissimilarities
  // var dists = [
  //   [1.0, 0.1, 0.2],
  //   [0.1, 1.0, 0.3],
  //   [0.2, 0.1, 1.0],
  // ];
  tsne.initDataDist(dists);

  for (var k = 0; k < 500; k++) {
    tsne.step(); // every time you call this, solution gets better
  }

  var Y = tsne.getSolution(); // Y is an array of 2-D points that you can plot
  console.log("Y", Y);

  const scaleX = sc
    .scaleLinear()
    .domain(array.extent(Y, (d) => d[0]))
    .range([0, width]);
  const scaleY = sc
    .scaleLinear()
    .domain(array.extent(Y, (d) => d[1]))
    .range([0, height]);

  const simulation = d3
    .forceSimulation([...allData])
    .alphaMin(0.6)
    // .force(
    //   "collision",
    //   d3
    //     .forceCollide((d) => {
    //       return d.size + 3; //d.w / 2;
    //     })
    //     .strength(1)
    // )
    .force(
      "X",
      d3.forceX((d, i) => scaleX(Y[i][0]))
    )
    .force(
      "Y",
      d3.forceY((d, i) => scaleY(Y[i][1]))
    )
    // .force("center", d3.forceCenter(width / 2, height / 2).strength(0.5))

    .on("tick", () => {
      // if (counter % 10 === 0)
      nodes = simulation.nodes();
      // nodes.forEach((n) => {
      //   n.visible = true;
      // });
      // counter++;
    });

  const restartSim = (ns) => {
    simulation
      .force("x", d3.forceX((d) => d.tx).strength(0.2))
      .force("y", d3.forceY((d) => d.ty).strength(0.2))
      .nodes(ns)
      .alpha(1)
      .restart();
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
  <svg {width} {height} id="zoom-cont" class="m-auto ">
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
        <g>
          <circle
            class=" cursor-pointer stroke-current border-black"
            opacity={initial && n.size < 4 ? 0.3 : 0.7}
            fill={colors[n.type]}
            r={Math.min(allData1[i].links.length, 20)}
            cx={n.x}
            cy={n.y} />
          <title>{n.title}</title>
        </g>
      {/each}
      {#each nodes as n, i (n.id)}
        <g
          on:click={() => {
            elementClickHandler(n);
          }}>
          <text
            class={' hidden cursor-pointer'}
            font-weight={n.selected || (initial && n.size > 4) ? 'bold' : ''}
            fill={colors[n.type]}
            font-size={n.selected ? '12px' : '10px'}
            x={n.x}
            y={n.y}>
            {n.title}
          </text>
          <title>{n.title}</title>
        </g>
      {/each}
    </g>
  </svg>
</div>
