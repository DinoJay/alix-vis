<script>
    import { claim_component } from "svelte/internal";

    export let x;
    export let y;
    export let clickHandler;
</script>

<div
    on:click={clickHandler}
    class="flex absolute  transition"
    style="left:{x - size / 2}px; top:{n.y - size / 2}px; width:{size}px; height:{size}px; ">
    <div
        class="absolute border-2 -white"
        style="width:{n.size}px; height:{n.size}px; border-color: {color};" />
    <div
        class="m-auto bg-white whitespace-nowrap"
        style="transform: translate(-10%,-0%)">
        {#if visible}{title}{/if}
    </div>
</div>
