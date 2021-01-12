import { quadtree } from "d3-quadtree";
// import {nest} from 'd3-collection';
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
    color: "blue",
    selected: true,
    size: 100, //Math.min(40, objects.length),
    // tx: width / 2,
    // ty: height / 2,
  };
  return [
    dreams,
    {
      id: "objects",
      title: "ObJecTs",
      values: objects
        .map((o) => ({
          ...o,
          attrs: [
            { id: "color", value: o.couleur, color: "black", size: 40 },
            { id: "characteristic", value: o.char, color: "orange", size: 40 },
            { id: "type", value: o.type, color: "cyan", size: 40 },
            { id: "category", value: o.categorie, color: "brown", size: 40 },
          ],
          values: dreams.values.filter((d) =>
            d.element.split(",").includes(o.id)
          ),
        }))
        .concat(
          dreams.values.flatMap((d) =>
            d.element
              .split(",")
              .filter((pid) => !objects.find((p) => p.id === pid))
              .map((s) => s.trim())
              .filter(Boolean)
              .reduce((acc, s) => (!acc.includes(s) ? [s, ...acc] : acc), [])
              .map((d) => ({
                id: d,
                type: "person",
                color: "blue",
                title: d,
                attrs: [],
                size: 25,
              }))
          )
        ),
      linkedDreams: objects.flatMap((o) =>
        dreams.values.filter((d) => d.element.split(",").includes(o.id))
      ),
      visible: true,
      color: "blue",
      size: 40, //Math.min(40, objects.length),
    },
    {
      id: "persons",
      title: "PeRsOns",
      values: persons
        .map((o) => ({
          ...o,
          values: dreams.values.filter((d) =>
            d.personne.split(",").includes(o.id)
          ),
          attrs: [
            { id: "characteristic", value: o.char, color: "orange", size: 40 },
            { id: "type", value: o.type, color: "cyan", size: 40 },
          ],
        }))
        .concat(
          dreams.values.flatMap((d) =>
            d.personne
              .split(",")
              .filter((pid) => !persons.find((p) => p.id === pid))
              .map((s) => s.trim())
              .filter(Boolean)
              .reduce((acc, s) => (!acc.includes(s) ? [s, ...acc] : acc), [])
              .map((d) => ({
                id: d,
                type: "person",
                color: "green",
                title: d,
                attrs: [],
                size: 25,
              }))
          )
        ),
      linkedDreams: persons.flatMap((o) =>
        dreams.values.filter((d) => d.personne.split(",").includes(o.id))
      ),
      visible: true,
      color: "green",
      size: 40, //Math.min(40, persons.length),
    },
    {
      id: "animals",
      title: "AnImAls",
      values: animals
        .map((o) => ({
          ...o,
          values: dreams.values.filter((d) =>
            d.animaux.split(",").includes(o.id)
          ),
          attrs: [
            { id: "color", value: o.couleur, color: "black", size: 40 },
            { id: "characteristic", value: o.char, color: "orange", size: 40 },
            { id: "type", value: o.type, color: "cyan", size: 40 },
          ],
        }))
        .concat(
          dreams.values.flatMap((d) =>
            d.animaux
              .split(",")
              .filter((pid) => !animals.find((p) => p.id === pid))
              .map((s) => s.trim())
              .filter(Boolean)
              .reduce((acc, s) => (!acc.includes(s) ? [s, ...acc] : acc), [])
              .map((d) => ({
                id: d,
                type: "animal",
                color: "brown",
                title: d,
                attrs: [],
                size: 25,
              }))
          )
        ),
      linkedDreams: animals.flatMap((o) =>
        dreams.values.filter((d) => d.animaux.split(",").includes(o.id))
      ),
      visible: true,
      color: "brown",
      size: 40, //Math.min(40, animals.length),
    },
    {
      id: "vehicles",
      title: "VeHiCles",
      values: vehicles
        .map((o) => ({
          ...o,
          values: dreams.values.filter((d) =>
            d.vehicule.split(",").includes(o.id)
          ),
          attrs: [
            { id: "color", value: o.couleur, color: "black", size: 40 },
            { id: "characteristic", value: o.char, color: "orange", size: 40 },
            { id: "type", value: o.type, color: "cyan", size: 40 },
          ],
        }))
        .concat(
          dreams.values.flatMap((d) =>
            d.vehicule
              .split(",")
              .filter((pid) => !vehicles.find((p) => p.id === pid))
              .map((s) => s.trim())
              .filter(Boolean)
              .reduce((acc, s) => (!acc.includes(s) ? [s, ...acc] : acc), [])
              .map((d) => ({
                id: d,
                type: "vehicle",
                values: [],
                color: "red",
                title: d,
                attrs: [],
                size: 25,
              }))
          )
        ),
      linkedDreams: vehicles.flatMap((o) =>
        dreams.values.filter((d) => d.vehicule.split(",").includes(o.id))
      ),
      visible: true,
      color: "red",
      size: 40, //Math.max(40, vehicles.length),
    },
    {
      id: "places",
      title: "PlAcEs",
      values: places
        .map((o) => ({
          ...o,
          values: dreams.values.filter((d) => d.lieu.split(",").includes(o.id)),
          attrs: [
            { id: "color", value: o.couleur, color: "black", size: 40 },
            { id: "characteristic", value: o.char, color: "orange", size: 40 },
            { id: "type", value: o.type, color: "cyan", size: 40 },
          ],
        }))
        .concat(
          dreams.values.flatMap((d) =>
            d.lieu
              .split(",")
              .filter((pid) => !places.find((p) => p.id === pid))
              .map((s) => s.trim())
              .filter(Boolean)
              .reduce((acc, s) => (!acc.includes(s) ? [s, ...acc] : acc), [])
              .map((d) => ({
                id: d,
                type: "animal",
                title: d,
                attrs: [],
                size: 25,
              }))
          )
        ),
      visible: true,
      color: "yellow",
      linkedDreams: places.flatMap((o) =>
        dreams.values.filter((d) => d.lieu.split(",").includes(o.id))
      ),
      size: 40, //Math.max(40, places.length),
    },
  ];
};
