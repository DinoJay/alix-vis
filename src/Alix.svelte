<script>
  import Vis from "./Vis2.svelte";
  import { onMount } from "svelte";
  import { csvParse } from "d3-dsv";
  export let types = [];

  const dreamData = fetch("static/dreams1.csv")
    .then((response) => response.text())
    .then((data) =>
      csvParse(data).map((d, i) => ({
        ...d,
        id: i,
        title: "DreaM " + i,
        width: 15,
        height: 15,
        size: 7,
      }))
    );

  const objectData = fetch("static/element1.csv")
    .then((response) => response.text())
    .then((data) =>
      csvParse(data).map((d, i) => ({
        ...d,
        // type: "object",
        title: d.id,
        size: 7,
        // color: "#E9967A",
        width: 15,
        size: 25,
        height: 15,
      }))
    );
  const promise = Promise.all([dreamData, objectData]);
  let w;
  let h;
  let width;
  let dom;
  let counter = 0;
  const maxWidth = 950;

  $: {
    width = Math.min(maxWidth, w);
    console.log("counter", counter);
    console.log("w", w);
  }
  onMount(() => {
    window.addEventListener("resize", function (event) {
      console.log("resize", w);
      width = Math.min(maxWidth, w);
      // do stuff here
    });
  });
</script>

<style>
</style>

<div
  class="flex-grow flex md:mx-8 "
  style=""
  bind:this={dom}
  bind:clientWidth={w}>
  {#if promise}
    {#await promise}
      <p class="text-6xl m-auto">Loading...</p>
    {:then [dreams, objects]}
      <Vis {types} {dreams} {objects} {width} />
    {/await}
  {/if}
</div>
