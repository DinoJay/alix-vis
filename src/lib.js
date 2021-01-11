import {quadtree} from 'd3-quadtree';
// import {nest} from 'd3-collection';
export const rectCollide = () => {
    var nodes, sizes, masses
    var size = constant([0, 0])
    var strength = 1
    var iterations = 1

    function force() {
        var node, size, mass, xi, yi
        var i = -1
        while (++i < iterations) { iterate() }

        function iterate() {
            var j = -1
            var tree = quadtree(nodes, xCenter, yCenter).visitAfter(prepare)

            while (++j < nodes.length) {
                node = nodes[j]
                size = sizes[j]
                mass = masses[j]
                xi = xCenter(node)
                yi = yCenter(node)

                tree.visit(apply)
            }
        }

        function apply(quad, x0, y0, x1, y1) {
            var data = quad.data
            var xSize = (size[0] + quad.size[0]) / 2
            var ySize = (size[1] + quad.size[1]) / 2
            if (data) {
                if (data.index <= node.index) { return }

                var x = xi - xCenter(data)
                var y = yi - yCenter(data)
                var xd = Math.abs(x) - xSize
                var yd = Math.abs(y) - ySize

                if (xd < 0 && yd < 0) {
                    var l = Math.sqrt(x * x + y * y)
                    var m = masses[data.index] / (mass + masses[data.index])

                    if (Math.abs(xd) < Math.abs(yd)) {
                        node.vx -= (x *= xd / l * strength) * m
                        data.vx += x * (1 - m)
                    } else {
                        node.vy -= (y *= yd / l * strength) * m
                        data.vy += y * (1 - m)
                    }
                }
            }

            return x0 > xi + xSize || y0 > yi + ySize ||
                   x1 < xi - xSize || y1 < yi - ySize
        }

        function prepare(quad) {
            if (quad.data) {
                quad.size = sizes[quad.data.index]
            } else {
                quad.size = [0, 0]
                var i = -1
                while (++i < 4) {
                    if (quad[i] && quad[i].size) {
                        quad.size[0] = Math.max(quad.size[0], quad[i].size[0])
                        quad.size[1] = Math.max(quad.size[1], quad[i].size[1])
                    }
                }
            }
        }
    }

    function xCenter(d) { return d.x + d.vx + sizes[d.index][0] / 2 }
    function yCenter(d) { return d.y + d.vy + sizes[d.index][1] / 2 }

    force.initialize = function (_) {
        sizes = (nodes = _).map(size)
        masses = sizes.map(function (d) { return d[0] * d[1] })
    }

    force.size = function (_) {
        return (arguments.length
             ? (size = typeof _ === 'function' ? _ : constant(_), force)
             : size)
    }

    force.strength = function (_) {
        return (arguments.length ? (strength = +_, force) : strength)
    }

    force.iterations = function (_) {
        return (arguments.length ? (iterations = +_, force) : iterations)
    }

    return force
}

export const boundedBox=() => {
    var nodes, sizes
    var bounds
    var size = constant([0, 0])

    function force() {
        var node, size
        var xi, x0, x1, yi, y0, y1
        var i = -1
        while (++i < nodes.length) {
            node = nodes[i]
            size = sizes[i]
            xi = node.x + node.vx
            x0 = bounds[0][0] - xi
            x1 = bounds[1][0] - (xi + size[0])
            yi = node.y + node.vy
            y0 = bounds[0][1] - yi
            y1 = bounds[1][1] - (yi + size[1])
            if (x0 > 0 || x1 < 0) {
                node.x += node.vx
                node.vx = -node.vx
                if (node.vx < x0) { node.x += x0 - node.vx }
                if (node.vx > x1) { node.x += x1 - node.vx }
            }
            if (y0 > 0 || y1 < 0) {
                node.y += node.vy
                node.vy = -node.vy
                if (node.vy < y0) { node.vy += y0 - node.vy }
                if (node.vy > y1) { node.vy += y1 - node.vy }
            }
        }
    }

    force.initialize = function (_) {
        sizes = (nodes = _).map(size)
    }

    force.bounds = function (_) {
        return (arguments.length ? (bounds = _, force) : bounds)
    }

    force.size = function (_) {
        return (arguments.length
             ? (size = typeof _ === 'function' ? _ : constant(_), force)
             : size)
    }

    return force
}

function constant(_) {
return function () {
    return _;
};
}

const rectangular = (w, h, s, size) => {
    const ns = Math.ceil(s / 4);
    const incrW = w / ns;
    const incrH = h / ns;
    // console.log({w, h, s, incrH, incrW});

    const s0 = [...Array(ns).keys()].map((i) => ({ x: (i + 0) * incrW, y: 0 }));

    const s1 = [...Array(ns - 1).keys()].map((i) => ({
      x: w - size,
      y: (i + 1) * incrH,
    }));

    const s2 = [...Array(ns).keys()].map((i) => ({ x: (i + 0) * incrW, y: h }));

    const s3 = [...Array(ns + 1).keys()].map((i) => ({
      x: 0,
      // TODO: dirty hack missing one sometimes
      y: Math.min(h, (i + 1) * incrH),
    }));

    const allEls = [...s0, ...s1, ...s2, ...s3];
    return (i) => allEls[i];
  };

  export const layoutRectangularNodes = ({
    data,
    size,
    width,
    height,
    selected,
    offset,
  }) => {
    let offsetW = Math.max(width / (selected ? 2 : 2.3), 550);
    let offsetH = Math.max(width / (selected ? 2 : 2.3), 550);
    let level = 0;
    const res = [];
    while (res.length < data.length) {
      const len = 2 * offsetW + 2 * offsetH;
      const num = Math.ceil(len / (size + 5));
      // const num = n - 2; // n % 2 === 0 ? n : n;

      const rect = rectangular(
        offsetW,
        offsetH,
        Math.min(num, data.length - res.length),
        size
      );

      const resTitles = res.map((d) => d.title);
      const layoutNodes = data
        .slice(res.length, res.length + num)
        .filter((d) => !resTitles.includes(d.id))
        .map((d, i) => ({
          ...d,
          level,
          sx: width / 2 - offsetW / 2 + rect(i).x,
          sy: height / 2 - offsetH / 2 + rect(i).y,
        }));

      level++;

      offsetW += offset;
      offsetH += offset;
      res.push(...layoutNodes);
    }

    return res; // uniqBy(res, 'title');
  };
  export const forceRadial = (radius, x, y, offset) => {
    var nodes,
        strength = constant(0.1),
        strengths,
        radiuses;
    var width = 500;
    var height = 500;
    var taper = 10;
    var center = [0,0];
    var start = 90;

    var current = start;

  var radialLocation = function(center, angle, width, height, taper) {
    return {"x":(x + Math.abs(width * Math.cos(angle * Math.PI / 180) - taper)),
            "y": (y + (height * Math.sin(angle * Math.PI / 180) + taper))};
  };

  var place = function(obj, i, alpha, incr) {
    var value = radialLocation(center, current, radiuses[i], radiuses[i], taper);
    const dx = obj.x - value.x || 1e-6;
    const dy = obj.y - value.y || 1e-6;
    const r = (dx**2 + dy**2)**2
    const k = (radiuses[i] - r) * strengths[i] * alpha / r;
    obj.vx = dx * k || null;
    obj.vy = dy * k || null;
    obj.angle = current;

    current += incr;
    taper += incr;
    taper = Math.min(taper, 0);
    return value;
  };

  var placement = function(objs, alpha) {

    objs.forEach((obj, i) => {
        // console.log('obj', offset(obj));
      place(obj, i, alpha, offset(obj) !==null ? ( 180 / offset(obj) ): 0);
    });

    return objs;
  };

    
    if (typeof radius !== "function") radius = constant(+radius);
    if (x == null) x = 0;
    if (y == null) y = 0;
  
    function force(alpha) {
        placement(nodes, alpha)
    }
  
    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length;
      strengths = new Array(n);
      radiuses = new Array(n);
      for (i = 0; i < n; ++i) {
        radiuses[i] = +radius(nodes[i], i, nodes);
        strengths[i] = isNaN(radiuses[i]) ? 0 : +strength(nodes[i], i, nodes);
      }
    }
  
    force.initialize = function(_) {
      nodes = _, initialize();
    };
  
    force.strength = function(_) {
      return arguments.length ? (strength = typeof _ === "function" ? _ : constant(+_), initialize(), force) : strength;
    };
  
    force.radius = function(_) {
      return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), initialize(), force) : radius;
    };
  
    force.offset = function(_) {
      return arguments.length ? (offset = typeof _ === "function" ? _ : constant(+_), initialize(), force) : offset;
    };
    force.x = function(_) {
      return arguments.length ? (x = +_, force) : x;
    };
  
    force.y = function(_) {
      return arguments.length ? (y = +_, force) : y;
    };
  
    return force;
  }

  export const organizeData = ({data, objects, persons, animals, places, vehicles}) =>{
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
      values: objects.map((o) => ({
        ...o,
      attrs: [
        {id:"color", value: o.couleur, color: 'black', size: 40}, 
        {id: 'characteristic', value: o.char, color: 'orange', size: 40}, 
        {id: "type", value: o.type, color: 'cyan', size: 40}, 
        {id:"category",value: o.categorie, color: 'brown', size: 40}],
        values: dreams.values.filter((d) =>
          d.element.split(",").includes(o.id)
        ),
      })),
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
      values: persons.map((o) => ({
        ...o,
        values: dreams.values.filter((d) =>
          d.personne.split(",").includes(o.id)
        ),
      })),
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
      values: animals.map((o) => ({
        ...o,
        values: dreams.values.filter((d) =>
          d.animaux.split(",").includes(o.id)
        ),
      })),
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
      values: vehicles.map((o) => ({
        ...o,
        values: dreams.values.filter((d) =>
          d.vehicule.split(",").includes(o.id)
        ),
      })),
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
      values: places.map((o) => ({
        ...o,
        values: dreams.values.filter((d) => d.lieu.split(",").includes(o.id)),
      })),
      visible: true,
      color: "yellow",
      linkedDreams: places.flatMap((o) =>
        dreams.values.filter((d) => d.lieu.split(",").includes(o.id))
      ),
      size: 40, //Math.max(40, places.length),
    },
  ];

  }