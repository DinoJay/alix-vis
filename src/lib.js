import { quadtree } from "d3-quadtree";
import uniq from "lodash.uniqby";
import { group } from "d3-array";
// import {nest} from 'd3-collection';

const isIntersect = (setA, setB) => {
  // console.log("a", a, "b", b);
  const ret =
    setA.map((a) => setB.includes(a)).filter(Boolean).length > 0 ||
    setB.map((b) => setA.includes(b)).filter(Boolean).length > 0;
  return ret;
};
export const organizeData = ({
  data,
  objects,
  persons,
  animals,
  places,
  vehicles,
}) => {
  const dreams = {
    id: "dreams",
    title: "ALix DréAms",
    visible: true,
    values: data,
    attrs: [
      "année",
      "mois",
      "place",
      "person",
      "object",
      "corps",
      "vehicle",
      "animal",
      "evenement",
    ],
    displayColor: "blue",
    selected: true,
    size: 7, //Math.min(40, objects.length),
    // tx: width / 2,
    // ty: height / 2,
  };
  const placeAttrs = ["color", "character", "type"];
  const placeVals = places
    .map((o) => ({
      ...o,
      values: dreams.values.filter((d) => d.place.split(",").includes(o.id)),
      attrs: [
        { id: "color", value: o.couleur, displayColor: "black", size: 7 },
        {
          id: "characteristic",
          value: o.char,
          displayColor: "orange",
          size: 7,
        },
        { id: "type", value: o.type, displayColor: "cyan", size: 7 },
      ],
    }))
    .concat(
      dreams.values.flatMap((d) =>
        d.place
          .split(",")
          .filter((pid) => !places.find((p) => p.id === pid))
          .map((s) => s.trim())
          .filter(Boolean)
          .reduce((acc, s) => (!acc.includes(s) ? [s, ...acc] : acc), [])
          .map((d) => ({
            id: d,
            type: "character",
            title: d,
            attrs: [],
            values: [],
            size: 7,
          }))
      )
    );
  const vehiclelAttrs = ["color", "character", "type"];
  const vehicleVals = vehicles
    .map((o) => ({
      ...o,
      values: dreams.values.filter((d) => d.vehicle.split(",").includes(o.id)),
      attrs: [
        { id: "color", value: o.couleur, displayColor: "black", size: 7 },
        { id: "character", value: o.char, displayColor: "orange", size: 7 },
        { id: "type", value: o.type, displayColor: "cyan", size: 7 },
      ],
    }))
    .concat(
      dreams.values.flatMap((d) =>
        d.vehicle
          .split(",")
          .filter((pid) => !vehicles.find((p) => p.id === pid))
          .map((s) => s.trim())
          .filter(Boolean)
          .reduce((acc, s) => (!acc.includes(s) ? [s, ...acc] : acc), [])
          .map((d) => ({
            id: d,
            type: "vehicle",
            values: [],
            displayColor: "red",
            title: d,
            attrs: [],
            size: 25,
          }))
      )
    );
  const animalAttrs = ["color", "character", "type"];
  const animalVals = animals
    .map((o) => ({
      ...o,
      values: dreams.values.filter((d) => d.animal.split(",").includes(o.id)),
      attrs: [
        { id: "color", value: o.couleur, displayColor: "black", size: 7 },
        {
          id: "characteristic",
          value: o.char,
          displayColor: "orange",
          size: 7,
        },
        { id: "type", value: o.type, displayColor: "cyan", size: 7 },
      ],
    }))
    .concat(
      dreams.values.flatMap((d) =>
        d.animal
          .split(",")
          .filter((pid) => !animals.find((p) => p.id === pid))
          .map((s) => s.trim())
          .filter(Boolean)
          .reduce((acc, s) => (!acc.includes(s) ? [s, ...acc] : acc), [])
          .map((d) => ({
            id: d,
            type: "animal",
            displayColor: "brown",
            title: d,
            values: [],
            attrs: [],
            size: 7,
          }))
      )
    );
  const personAttrs = ["character", "type"];
  const personVals = persons
    .map((o) => ({
      ...o,
      values: dreams.values.filter((d) => d.person.split(",").includes(o.id)),
      attrs: [
        { id: "character", value: o.char, displayColor: "orange", size: 7 },
        { id: "type", value: o.type, displayColor: "cyan", size: 7 },
      ],
    }))
    .concat(
      dreams.values.flatMap((d) =>
        d.person
          .split(",")
          .filter((pid) => !persons.find((p) => p.id === pid))
          .map((s) => s.trim())
          .filter(Boolean)
          .reduce((acc, s) => (!acc.includes(s) ? [s, ...acc] : acc), [])
          .map((d) => ({
            id: d,
            type: "person",
            displayColor: "green",
            title: d,
            attrs: [],
            values: [],
            size: 7,
          }))
      )
    );
  const objectAttrs = ["color", "character", "type", "category"];
  const objectVals = objects
    .map((o) => ({
      ...o,
      displayColor: "blue",
      attrs: [
        { id: "color", value: o.couleur, displayColor: "black", size: 7 },
        {
          id: "characteristic",
          value: o.character,
          displayColor: "orange",
          size: 7,
        },
        { id: "type", value: o.type, displayColor: "cyan", size: 7 },
        { id: "category", value: o.categorie, displayColor: "brown", size: 7 },
      ],
      values: dreams.values.filter((d) => d.object.split(",").includes(o.id)),
    }))
    .concat(
      dreams.values.flatMap((d) =>
        d.object
          .split(",")
          .filter((pid) => !objects.find((p) => p.id === pid))
          .map((s) => s.trim())
          .filter(Boolean)
          .reduce((acc, s) => (!acc.includes(s) ? [s, ...acc] : acc), [])
          .map((d) => ({
            id: d,
            type: "person",
            displayColor: "blue",
            title: d,
            values: [],
            attrs: [],
            size: 5,
          }))
      )
    );
  const extractGroups = (values, attrs) =>
    attrs.map((a) => {
      const extractLinkedDreams = (ids) => {
        return uniq(
          dreams.attrs.flatMap((a) => {
            return dreams.values.filter((d) => {
              return d[a] && isIntersect(ids, d[a].split(","));
            });
          }),
          "id"
        );
      };
      // console.log("values", values);
      const tmp = values.flatMap((d) => {
        if (d[a] && d[a].includes(",")) {
          return d[a].split(",").map((b) => ({ ...d, [a]: b.trim() }));
        }
        return d;
      });
      const groups = [...group(tmp, (d) => d[a])]
        .filter(([id]) => !!id)
        .map(([id, values]) => ({
          id,
          values,
          linkedDreams: extractLinkedDreams(values.map((d) => d.id)),
          title: id,
          visible: true,
          size: 7,
        }));

      const attrIds = groups.flatMap((d) => d.values.map((d) => d.id));

      // console.log("a", a, "ids", ids, "vals", vals);

      const linkedDreams = extractLinkedDreams(attrIds);

      return {
        id: a,
        values: groups,
        linkedDreams,
        visible: true,
        title: a,
        size: 7,
      };
    });
  return [
    dreams,
    {
      id: "objects",
      title: "ObJecTs",
      level: 1,
      values: objectVals,
      attrs: objectAttrs,
      groups: extractGroups(objectVals, objectAttrs),
      linkedDreams: uniq(
        objectVals.flatMap((o) =>
          dreams.values.filter((d) => d.object.split(",").includes(o.id))
        ),
        "id"
      ),
      visible: true,
      displayColor: "blue",
      size: 7, //Math.min(40, objects.length),
    },
    {
      id: "persons",
      title: "PeRsOns",
      level: 1,
      attrs: personAttrs,
      values: personVals,
      groups: extractGroups(personVals, personAttrs),
      linkedDreams: uniq(
        personVals.flatMap((o) =>
          dreams.values.filter((d) => d.person.split(",").includes(o.id))
        ),
        "id"
      ),
      visible: true,
      displayColor: "green",
      size: 7, //Math.min(40, persons.length),
    },
    {
      id: "animals",
      title: "AnImAls",
      attrs: animalAttrs, //["color", "character", "type", "category"],
      values: animalVals,
      level: 1,
      groups: extractGroups(animalVals, animalAttrs),
      linkedDreams: uniq(
        animalVals.flatMap((o) =>
          dreams.values.filter((d) => d.animal.split(",").includes(o.id))
        ),
        "id"
      ),
      visible: true,
      displayColor: "brown",
      size: 7, //Math.min(40, animals.length),
    },
    {
      id: "vehicles",
      title: "VeHiCles",
      level: 1,
      values: vehicleVals,
      attrs: vehiclelAttrs, //["color", "character", "type"],
      groups: extractGroups(vehicleVals, vehiclelAttrs),
      linkedDreams: uniq(
        vehicleVals.flatMap((o) =>
          dreams.values.filter((d) => d.vehicle.split(",").includes(o.id))
        ),
        "id"
      ),
      visible: true,
      displayColor: "red",
      size: 7, //Math.max(40, vehicles.length),
    },
    {
      id: "places",
      level: 1,
      title: "PlAcEs",
      values: placeVals,
      attrs: placeAttrs, //["color", "character", "type"],
      groups: extractGroups(placeVals, placeAttrs),
      visible: true,
      displayColor: "yellow",
      linkedDreams: uniq(
        places.flatMap((o) =>
          dreams.values.filter((d) => d.place.split(",").includes(o.id))
        ),
        "id"
      ),
      size: 7, //Math.max(40, places.length),
    },
  ];
};
