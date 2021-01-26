<script>
  import Vis from "./Vis2.svelte";
  import { onMount } from "svelte";
  import { csvParse } from "d3-dsv";

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
  $: {
    width = Math.min(1200, w);
    console.log("counter", counter);
  }

  const ro = new ResizeObserver((entries) => {
    for (let entry of entries) {
      counter++;
      console.log("entry", entry);
      // entry.target.style.borderRadius =
      //   Math.max(0, 250 - entry.contentRect.width) + "px";
    }
  });
  onMount(() => {
    ro.observe(dom);
  });
</script>

<style>
</style>

<div class="flex-grow flex mx-8 " bind:this={dom} bind:clientWidth={w}>
  {#if promise}
    {#await promise}
      <p class="text-6xl m-auto">Loading...</p>
    {:then [dreams, objects]}
      <Vis {dreams} {objects} {width} />
    {/await}
  {/if}
</div>
