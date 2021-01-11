<script>
    export let x;
    export let y;
    let arrow;
    export { arrow as this };
</script>

<div
    bind:this={arrow}
    class="absolute relative"
    style="left:{x - 128}px; top: {y - 64 / 2}px; transform: translate(-0%,-0%)">
    <div class="absolute" style="transform: translate(-56%, 0)">Alix</div>
    <svg
        class="w-16 h-16"
        x="0px"
        y="0px"
        viewBox="0 0 31.49 31.49"
        xml:space="preserve">
        <path
            style="fill:#1E201D;"
            d="M21.205,5.007c-0.429-0.444-1.143-0.444-1.587,0c-0.429,0.429-0.429,1.143,0,1.571l8.047,8.047H1.111
C0.492,14.626,0,15.118,0,15.737c0,0.619,0.492,1.127,1.111,1.127h26.554l-8.047,8.032c-0.429,0.444-0.429,1.159,0,1.587
c0.444,0.444,1.159,0.444,1.587,0l9.952-9.952c0.444-0.429,0.444-1.143,0-1.571L21.205,5.007z" />
    </svg>
    <div class="absolute" style="transform: translate(-56%, -120%)">Dreams</div>
</div>
