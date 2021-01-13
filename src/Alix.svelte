<script>
  import Vis from "./Vis2.svelte";
  import { onMount } from "svelte";
  import { csvParse } from "d3-dsv";

  const key = "bWA5AlcAzMfYGBYhlinMvf1rmP5Kt33j";

  const prData = fetch("static/data.csv")
    .then((response) => response.text())
    .then((data) =>
      csvParse(data).map((d, i) => ({
        ...d,
        id: i,
        title: "DreaM " + i,
        // type: "dream",
        // color: "#8FBC8F",
        width: 15,
        height: 15,
        size: 25,
      }))
    );

  const prObject = fetch("static/objet.csv")
    .then((response) => response.text())
    .then((data) =>
      csvParse(data).map((d, i) => ({
        ...d,
        // type: "object",
        title: "ObJecT " + i,
        // color: "#E9967A",
        width: 15,
        size: 25,
        height: 15,
      }))
    );
  const prPersonne = fetch("static/personne.csv")
    .then((response) => response.text())
    .then((data) =>
      csvParse(data).map((d, i) => ({
        ...d,
        // type: "person",
        title: "PerSon " + i,
        // color: "#483D8B",
        width: 15,
        size: 25,
        height: 15,
      }))
    );
  const prAnimaux = fetch("static/animaux.csv")
    .then((response) => response.text())
    .then((data) =>
      csvParse(data).map((d, i) => ({
        ...d,
        //TODO: why explicit?
        id: "a" + (i + 1),
        // type: "animal",
        title: "AnImaL " + i,
        // color: "red",
        width: 15,
        size: 25,
        height: 15,
      }))
    );
  const prVehicule = fetch("static/vehicule.csv")
    .then((response) => response.text())
    .then((data) =>
      csvParse(data).map((d, i) => ({
        ...d,
        //TODO: why explicit?
        id: "a" + (i + 1),
        // id: 'vehicle',
        // type: "vehicle",
        title: "VeHiCle",
        // color: "brown",
        width: 15,
        size: 25,
        height: 15,
      }))
    );
  const prLieu = fetch("static/lieu.csv")
    .then((response) => response.text())
    .then((data) =>
      csvParse(data).map((d, i) => ({
        ...d,
        //TODO: why explicit?
        // id: "a" + (i + 1),
        // type: "place",
        // color: "yellow",
        width: 15,
        height: 15,
        size: 25,
      }))
    );
  const promise = Promise.all([
    prData,
    prObject,
    prPersonne,
    prAnimaux,
    prVehicule,
    prLieu,
  ]);
</script>

<style>
</style>

{#if promise}
  {#await promise}
    <p>Loading...</p>
  {:then [data, objects, persons, animals, vehicles, places]}
    <Vis {data} {objects} {persons} {animals} {vehicles} {places} />
  {/await}
{/if}
