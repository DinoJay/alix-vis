<script>
  export let name;
  import Alix from "./Alix.svelte";

  import { colors } from "./lib";
  import { nodeTypes } from "./store.js";
  let types = [];
  const updateTypes = (id) => {
    if (types.includes(id)) types = types.filter((t) => t !== id);
    else types = [...types, id];
  };
</script>

<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  ::selection {
    background: #808080;
    color: #e6e6e6;
  }

  body {
    font-family: "PT Serif", serif;
    color: #404040;
    /* background: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/567707/paper_fibers.png) */
    /* repeat; */
    /* padding: 20px; */
  }

  h1 {
    font-family: "Oswald", sans-serif;
    text-transform: uppercase;
    font-size: 4em;
    line-height: 1em;
    text-align: center;
    font-weight: 700;
    padding: 0px;
    margin: 0px;
    margin-bottom: 24px;
  }

  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: "PT Sans Narrow", sans-serif;
  }

  h2 {
    font-size: 2em;
    line-height: 1em;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  h3 {
    font-size: 2.4em;
    margin: 0px;
    padding: 0px;
    line-height: 0.8em;
    padding-top: 20px;
  }

  .time {
    text-align: center;
    font-family: "PT Sans Narrow", sans-serif;
    border-top: 3px solid #333;
    border-bottom: 3px solid #333;
    font-size: 1.6em;
    padding-top: 12px;
    padding-bottom: 12px;
    margin-bottom: 30px;
    font-weight: 700;
    text-transform: uppercase;
  }
  svg {
    font-family: "PT Sans Narrow", sans-serif;
    /* border-top: 3px solid #333;
    border-bottom: 3px solid #333; */
    text-transform: uppercase;
  }
</style>

<main class="md:mx-16 xl:mx-16">
  <h1>Alix Dream Vis</h1>

  <div class="time"><time>Alix' Dreams visualized between 2012-2017</time></div>

  <section class="">
    <div class="md:flex xs:flex-col ">
      <div
        style="min-width:18rem; max-width: 20rem"
        class="md:max-w-xs md:px-8  md:mr-8 min-w-content border-black ">
        <h2>What is this?</h2>

        <p class="text-justify" lang="en">
          For a long time, Alix kept track of her dreams in a diary. In the end
          of 2020, she finally found the heart to extract all the kewyords in a
          Google Sheet. This is my attempt to visualize them by showing the
          co-occurence. The distance between two circles denotes how often the
          corresponing keywords occur together in dreams whereas the size of the
          circle shows the absolute number how often a term occurs in the set of
          dreams. You can select a starting node on the right side and see the
          visualized categories in the bottom.
        </p>
        <div
          class="flex mt-3 ml-3 uppercase"
          style="transform:translateX(-00%) ">
          <ul class="list-disc list-inside">
            {#each $nodeTypes.slice(0, $nodeTypes.length / 2) as n}
              <li
                class={!n.enabled && 'line-through'}
                style="color: {colors[n.id]}"
                on:click={() => updateTypes(n.id)}>
                {n.id}
              </li>
            {/each}
          </ul>
          <ul class="ml-6 list-inside list-disc ">
            {#each $nodeTypes.slice($nodeTypes.length / 2) as n}
              <li style="color: {colors[n.id]}">{n.id}</li>
            {/each}
          </ul>
        </div>
      </div>
      <Alix />
    </div>
  </section>
</main>
