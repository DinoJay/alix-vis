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
  const spreadData = rawData.flatMap((d) => {
    const links = attrs.reduce((acc, a) => {
      const ls = d[a]
        .split(",")
        .filter(Boolean)
        .map((d) => d.trim())
        .filter((e) => e.id !== d.id);
      return { ...acc, [a]: ls };
    }, {});

    return attrs.flatMap((a) => {
      const strs = d[a].split(",").map((d) => d.trim());
      return strs.filter(Boolean).map((id) => {
        return { type: a, id: id, links };
      });
    });
  });

  // const dreamData = rawData

  const elements = [...group(spreadData, (d) => d.type)].map(([id, values]) => {
    const vals = [...group(values, (d) => d.id)].map(([id, values]) => {
      const links = attrs.reduce((acc, a) => ({ ...acc, [a]: [] }), {});
      values.forEach((d) =>
        attrs.map((a) => {
          links[a] = uniq([...links[a], ...d.links[a]], (d) => d);
        })
      );
      const numLinks = Object.values(links).flat().length;
      return { id, links, title: id, strength: numLinks };
    });

    return {
      id,
      strength: values.length,
      //TODO: get links
      values: uniq(vals, "id"),
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
  });
  return elements;
};
