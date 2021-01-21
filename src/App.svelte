<script>
  export let name;
  import Alix from "./Alix.svelte";
</script>

<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  main {
    background: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/567707/paper_fibers.png)
      repeat;
  }
</style>

<main>
  <h1 class="text-8xl">ALix Vis</h1>
  <Alix />
</main>
