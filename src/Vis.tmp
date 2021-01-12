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
  import {
    layoutRectangularNodes,
    boundedBox,
    rectCollide,
    forceRadial,
  } from "./lib";

  let nodes = [];
  const width = 1000;
  const height = width;
  // var spiral = d3_radial
  //   .spiral([width / 2, height / 2])
  //   .increment(10)
  //   .coil(6);
  console.log(
    "animals",
    animals.map((a) => a.id)
  );
  onMount(async () => {
    const boxForce = boundedBox()
      .bounds([
        [width / 2, 0],
        [width, height],
      ])
      .size((d) => {
        return [d.width, d.height];
      });
    const collisionForce = rectCollide()
      .size((d) => {
        return [d.width, d.height];
      })
      .strength(0.1);
    const radialForce = forceRadial((d) => {
      switch (d.type) {
        case "dream":
          return null;
        case "object":
          return 200;
        case "animal":
          return 250;
        case "place":
          return 300;
        case "person":
          return 350;
        case "vehicle":
          return 400;
      }
    })
      .offset((d) => {
        switch (d.type) {
          case "dream":
            return 8;
          case "object":
            return 8;
          case "animal":
            return 8;
          case "place":
            return 8;
          case "person":
            return 8;
          case "vehicle":
            return 8;
          // default:
          //   console.log("d.type", d.type);
        }
      })
      .strength(1)
      .x(width / 2)
      .y(height / 2);

    const simulation = d3
      .forceSimulation([
        ...data,
        ...objects,
        ...persons,
        ...animals,
        ...vehicles,
        ...places,
      ])
      .force("box", boxForce)
      .force("r", radialForce)
      .force("collision", d3.forceCollide((d) => d.width).strength(1))
      // .force("collision", collisionForce)

      // .force(
      //   "link",
      //   d3.forceLink(links).id((d) => d.index)
      // )
      // .force("X", d3.forceX((d) => d.sx).strength(1))
      // .force("Y", d3.forceY((d) => d.sy).strength(1))
      // .force("charge", d3.forceManyBody())
      // .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", () => {
        nodes = simulation.nodes();
      });
  });
</script>

<div
  class="relative border border-black"
  style="width:{width}px; height:{height}px">
  {#each nodes as n (n.id)}
    <div
      class="absolute overflow-hidden border-2 border-black"
      style="left:{n.x}px; top:{n.y}px; width:{n.width}px; height:{n.height}px; background: {n.color}">
      <!-- {n.id} -->
    </div>
  {/each}
</div>
