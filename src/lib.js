import { quadtree } from "d3-quadtree";
import uniq from "lodash.uniqby";
import { group } from "d3-array";
// import {nest} from 'd3-collection';

function constant(_) {
  return function () {
    return _;
  };
}
const isIntersect = (setA, setB) => {
  // console.log("a", a, "b", b);
  const ret =
    setA.map((a) => setB.includes(a)).filter(Boolean).length > 0 ||
    setB.map((b) => setA.includes(b)).filter(Boolean).length > 0;
  return ret;
};
export const rectCollide = () => {
  var nodes, sizes, masses;
  var size = constant([0, 0]);
  var strength = 1;
  var iterations = 1;

  function force() {
    var node, size, mass, xi, yi;
    var i = -1;
    while (++i < iterations) {
      iterate();
    }

    function iterate() {
      var j = -1;
      var tree = quadtree(nodes, xCenter, yCenter).visitAfter(prepare);

      while (++j < nodes.length) {
        node = nodes[j];
        size = sizes[j];
        mass = masses[j];
        xi = xCenter(node);
        yi = yCenter(node);

        tree.visit(apply);
      }
    }

    function apply(quad, x0, y0, x1, y1) {
      var data = quad.data;
      var xSize = (size[0] + quad.size[0]) / 2;
      var ySize = (size[1] + quad.size[1]) / 2;
      if (data) {
        if (data.index <= node.index) {
          return;
        }

        var x = xi - xCenter(data);
        var y = yi - yCenter(data);
        var xd = Math.abs(x) - xSize;
        var yd = Math.abs(y) - ySize;

        if (xd < 0 && yd < 0) {
          var l = Math.sqrt(x * x + y * y);
          var m = masses[data.index] / (mass + masses[data.index]);

          if (Math.abs(xd) < Math.abs(yd)) {
            node.vx -= (x *= (xd / l) * strength) * m;
            data.vx += x * (1 - m);
          } else {
            node.vy -= (y *= (yd / l) * strength) * m;
            data.vy += y * (1 - m);
          }
        }
      }

      return (
        x0 > xi + xSize || y0 > yi + ySize || x1 < xi - xSize || y1 < yi - ySize
      );
    }

    function prepare(quad) {
      if (quad.data) {
        quad.size = sizes[quad.data.index];
      } else {
        quad.size = [0, 0];
        var i = -1;
        while (++i < 4) {
          if (quad[i] && quad[i].size) {
            quad.size[0] = Math.max(quad.size[0], quad[i].size[0]);
            quad.size[1] = Math.max(quad.size[1], quad[i].size[1]);
          }
        }
      }
    }
  }

  function xCenter(d) {
    return d.x + d.vx + sizes[d.index][0] / 2;
  }
  function yCenter(d) {
    return d.y + d.vy + sizes[d.index][1] / 2;
  }

  force.initialize = function (_) {
    sizes = (nodes = _).map(size);
    masses = sizes.map(function (d) {
      return d[0] * d[1];
    });
  };

  force.size = function (_) {
    return arguments.length
      ? ((size = typeof _ === "function" ? _ : constant(_)), force)
      : size;
  };

  force.strength = function (_) {
    return arguments.length ? ((strength = +_), force) : strength;
  };

  force.iterations = function (_) {
    return arguments.length ? ((iterations = +_), force) : iterations;
  };

  return force;
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
    size: 100, //Math.min(40, objects.length),
    // tx: width / 2,
    // ty: height / 2,
  };
  const placeAttrs = ["color", "character", "type"];
  const placeVals = places
    .map((o) => ({
      ...o,
      values: dreams.values.filter((d) => d.place.split(",").includes(o.id)),
      attrs: [
        { id: "color", value: o.couleur, displayColor: "black", size: 40 },
        {
          id: "characteristic",
          value: o.char,
          displayColor: "orange",
          size: 40,
        },
        { id: "type", value: o.type, displayColor: "cyan", size: 40 },
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
            size: 25,
          }))
      )
    );
  const vehiclelAttrs = ["color", "character", "type"];
  const vehicleVals = vehicles
    .map((o) => ({
      ...o,
      values: dreams.values.filter((d) => d.vehicle.split(",").includes(o.id)),
      attrs: [
        { id: "color", value: o.couleur, displayColor: "black", size: 40 },
        { id: "character", value: o.char, displayColor: "orange", size: 40 },
        { id: "type", value: o.type, displayColor: "cyan", size: 40 },
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
        { id: "color", value: o.couleur, displayColor: "black", size: 40 },
        {
          id: "characteristic",
          value: o.char,
          displayColor: "orange",
          size: 40,
        },
        { id: "type", value: o.type, displayColor: "cyan", size: 40 },
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
            size: 25,
          }))
      )
    );
  const personAttrs = ["character", "type"];
  const personVals = persons
    .map((o) => ({
      ...o,
      values: dreams.values.filter((d) => d.person.split(",").includes(o.id)),
      attrs: [
        { id: "character", value: o.char, displayColor: "orange", size: 40 },
        { id: "type", value: o.type, displayColor: "cyan", size: 40 },
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
            size: 25,
          }))
      )
    );
  const objectAttrs = ["color", "character", "type", "category"];
  const objectVals = objects
    .map((o) => ({
      ...o,
      displayColor: "blue",
      attrs: [
        { id: "color", value: o.couleur, displayColor: "black", size: 40 },
        {
          id: "characteristic",
          value: o.character,
          displayColor: "orange",
          size: 40,
        },
        { id: "type", value: o.type, displayColor: "cyan", size: 40 },
        { id: "category", value: o.categorie, displayColor: "brown", size: 40 },
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
            size: 25,
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
      console.log("values", values);
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
          size: 25,
        }));
      console.log("groups", groups);

      const ids = groups.flatMap((d) => d.values.map((d) => d.id));

      // console.log("a", a, "ids", ids, "vals", vals);

      const linkedDreams = extractLinkedDreams(ids);

      console.log("linkedDreams", linkedDreams);
      return {
        id: a,
        values: groups,
        linkedDreams,
        visible: true,
        title: a,
        size: 50,
      };
    });
  return [
    dreams,
    {
      id: "objects",
      title: "ObJecTs",
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
      size: 40, //Math.min(40, objects.length),
    },
    {
      id: "persons",
      title: "PeRsOns",
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
      size: 40, //Math.min(40, persons.length),
    },
    {
      id: "animals",
      title: "AnImAls",
      attrs: animalAttrs, //["color", "character", "type", "category"],
      values: animalVals,
      groups: extractGroups(animalVals, animalAttrs),
      linkedDreams: uniq(
        animalVals.flatMap((o) =>
          dreams.values.filter((d) => d.animal.split(",").includes(o.id))
        ),
        "id"
      ),
      visible: true,
      displayColor: "brown",
      size: 40, //Math.min(40, animals.length),
    },
    {
      id: "vehicles",
      title: "VeHiCles",
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
      size: 40, //Math.max(40, vehicles.length),
    },
    {
      id: "places",
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
      size: 40, //Math.max(40, places.length),
    },
  ];
};
