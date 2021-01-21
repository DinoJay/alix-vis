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
export const organizeData = ({ dreams: rawData, objects }) => {
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
  console.log("objects", objects);
  const spreadData = [...rawData, ...objects].flatMap((d) => {
    const links = [...attrs, ...elemAttrs].reduce((acc, a) => {
      let ls;
      // if (a === "element") {
      //   const elemId = d[a];
      //   const element = objects.find((d) => d.id === elemId);
      //   if (element) {
      //     ls = elemAttrs.flatMap((ea) =>
      //       element[ea]
      //         .split(",")
      //         .map((d) => d.trim())
      //         .filter(Boolean)
      //         .filter((e) => e.id !== d.id)
      //     );
      //     console.log("ls", ls);
      //   } else ls = [];
      // } else {
      ls = d[a]
        ? d[a]
            .split(",")
            .filter(Boolean)
            .map((d) => d.trim())
            .filter((e) => e.id !== d.id)
        : [];
      // }
      return { ...acc, [a]: ls };
    }, {});
    // console.log("links", links);

    return [...attrs, ...elemAttrs].flatMap((a) => {
      const strs = d[a] ? d[a].split(",").map((d) => d.trim()) : [];
      return strs.filter(Boolean).map((id) => {
        return { type: a, id: id, links };
      });
    });
  });

  console.log(
    "spreadData",
    spreadData.filter((s) => s.type === "character")
  );
  // const dreamData = rawData

  const elements = [...group(spreadData, (d) => d.type)].map(
    ([type, values]) => {
      const vals = [...group(values, (d) => d.id)].map(([id, values]) => {
        const links = attrs.reduce((acc, a) => ({ ...acc, [a]: [] }), {});
        const objVals = values[0];
        values.forEach((d) =>
          attrs.map((a) => {
            links[a] = [...links[a], ...d.links[a]];
          })
        );

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
  return elements;
};
