<script>
  export let name;
  import Alix from "./Alix.svelte";
</script>

<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  main {
  }
  ::selection {
    background: #808080;
    color: #e6e6e6;
  }

  body {
    font-family: "PT Serif", serif;
    color: #404040;
    background: url(https://s3-us-west-2.amazonaws.com/s.cdpn.io/567707/paper_fibers.png)
      repeat;
    padding: 20px;
  }

  blockquote {
    font-family: "Oswald", sans-serif;
    line-height: 1.2em;
    font-size: 1.8em;
    column-span: 2;
    -webkit-column-span: 2;
    margin: 0px;
    padding: 0px;
    margin-left: 5px;
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
    font-size: 3em;
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

<main>
  <h1>Alix Dream Vis</h1>

  <div class="time"><time>Tuesday, September, 5th, 2014</time></div>

  <section class="">
    <div class="mx-24 md:flex xs:flex-col">
      <div class="max-w-xs " style="border-right: 3px solid #333;">
        <h2>Subheading to the article</h2>
        <p lang="en">
          Maecenas faucibus mollis interdum. Cum sociis natoque penatibus et
          magnis dis parturient montes, nascetur ridiculus mus. Cras justo odio,
          dapibus ac facilisis in, egestas eget quam. Sed posuere consectetur
          est at lobortis. Morbi leo risus, porta ac consectetur ac, vestibulum
          at eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Curabitur blandit tempus porttitor.
        </p>
      </div>
      <Alix />
    </div>
  </section>
</main>
