import { quadtree } from "d3-quadtree";
import uniq from "lodash.uniqby";
import { group } from "d3-array";
export const types = [
  "animal",
  "clothing",
  "vehicle",
  "body",
  "place",
  "person",
  "ambiance",
  "object",
  "element",
  "color",
  "character",
  "material",
];
const cs = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
];
const cs1 = [
  "#4e79a7",
  "#f28e2c",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc949",
  "#af7aa1",
  "#ff9da7",
  "#9c755f",
  "#bab0ab",
];
export const colors = cs1.reduce(
  (acc, d, i) => ({ ...acc, [types[i]]: d }),
  {}
);
// export const colors = {
//   animal: "#8dd3c7",
//   clothing: "#ffffb3",
//   vehicle: "#bebada",
//   body: "#fb8072",
//   place: "#80b1d3",
//   person: "#fdb462",
//   ambiance: "#b3de69",
//   object: "#fccde5",
//   element: "#fccde5",
// };
// import {nest} from 'd3-collection';

const isIntersect = (setA, setB) => {
  // console.log("a", a, "b", b);
  const ret =
    setA.map((a) => setB.includes(a)).filter(Boolean).length > 0 ||
    setB.map((b) => setA.includes(b)).filter(Boolean).length > 0;
  return ret;
};
export const organizeData = ({ dreams: rawData, objects: rawObjects }) => {
  const attrs = [
    "place",
    "person",
    "element",
    "body",
    "vehicle",
    "animal",
    "ambiance",
    "object",
    "clothing",
  ];
  const elemAttrs = ["color", "character", "material"];
  const objects = rawObjects.map((d) => ({ ...d, kind: "object" }));
  const extractElems = (a, id) =>
    a
      .split(",")
      .filter(Boolean)
      .map((d) => d.trim())
      .filter((e) => e.id !== id);
  const spreadData = [...rawData, ...objects].flatMap((d) => {
    const links = [...attrs, ...elemAttrs].reduce((acc, a) => {
      let ls = d[a] ? extractElems(d[a], d.id) : [];

      let newAcc = acc;
      if (a === "element" || a === "object") {
        const el = objects.find((o) => o.id === d[a]);
        if (el) {
          const tmpLs = elemAttrs.reduce((acc, a) => {
            const elems = extractElems(el[a], null);
            if (elems.length > 1) {
              return { ...acc, [a]: elems };
            }
            return acc;
          }, {});
          newAcc = { ...acc, ...tmpLs };
        }
      }

      // if (elemAttrs.includes(a)) {
      //   const objs = d[a]
      //     ? objects.filter((e) => ls.includes(e[a])).map((d) => d.id)
      //     : [];
      //   console.log("objs", objs);
      //   newAcc = { ...acc, element: objs };
      // }

      return { [a]: ls, ...newAcc };
    }, {});
    console.log("links", links);

    return [...attrs, ...elemAttrs].flatMap((a) => {
      const strs = d[a] ? d[a].split(",").map((d) => d.trim()) : [];
      return strs.filter(Boolean).map((id) => {
        return { type: a, id, links };
      });
    });
  });

  console.log(
    "spreadData",
    spreadData.find((d) => d.id === "petit")
  );
  // const dreamData = rawData

  const elements = [...group(spreadData, (d) => d.type)].map(
    ([type, values]) => {
      const vals = [...group(values, (d) => d.id)].map(([id, values]) => {
        const links = [...attrs, ...elemAttrs].reduce(
          (acc, a) => ({ ...acc, [a]: [] }),
          {}
        );
        const objVals = values[0];
        values.forEach((d) =>
          [...attrs, ...elemAttrs].map((a) => {
            links[a] = [...links[a], ...(d.links[a] || [])];
          })
        );
        // if (type === "element") console.log(id, "color values", links);

        // values.forEach(d => {
        //   d.links

        // })

        const numLinks = Object.values(links).flat().length;
        return {
          ...objVals,
          id: id,
          visible: true,
          links,
          title: id,
          strength: numLinks,
        };
      });

      return {
        id: type + " group",
        type,
        title: type,
        strength: values.length,
        //TODO: get links
        values: vals,
        // .filter((d) => d.id)
        // .map((d, i) => ({
        //   ...d,
        //   ...objects.find((o) => o.id === d.id),
        //   id: id + "" + i,
        //   title: d.id,
        //   // values: uniq(
        //   //   rawData.filter((e) => e[d.type].includes(d.id)),
        //   //   "id"
        //   // ),
        // })),
      };
    }
  );
  console.log("elements", elements);
  return elements;
};
