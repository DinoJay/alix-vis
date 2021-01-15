<script>
  // export let nodes = [];
  import { onMount } from "svelte";

  import * as d3 from "d3";

  var padding = 250;

  var radialLocation = function (center, angle, width, height) {
    const [x, y] = center;
    return [x + width * Math.cos(angle), y + height * Math.sin(angle)];
  };
  // let translate = null;
  var radius = 100;
  const width = radius * 2 + padding;
  const height = radius * 2 + padding;

  var createNodes = function () {
    var nodeData = [
      { id: 1, label: "BBB" },
      { id: 2, label: "CCC" },
      { id: 3, label: "DDD" },
      { id: 4, label: "EEE" },
      { id: 5, label: "FFF" },
    ];

    var nodes = [],
      // width = radius * 2 + paddding,
      // height = radius * 2 + paddding,
      angle,
      x,
      y,
      i;

    var numNodes = nodeData.length;

    for (i = 0; i < numNodes; i++) {
      angle = (i / (numNodes / 2)) * Math.PI;
      const [x, y] = radialLocation(
        [width / 2, height / 2],
        angle,
        radius,
        radius
      );
      nodes.push({ id: i, x: x, y: y, label: nodeData[i].label, angle: angle });
    }
    return nodes;
  };

  var createElements = function (svg, nodes) {
    let element;
    element = svg
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("svg:text")
      .text(function (d, i) {
        return (
          d.label +
          " - " +
          d.angle.toFixed(2) +
          ", " +
          (d.angle * 180) / Math.PI
        );
      })
      .attr("x", function (d, i) {
        return d.x;
        // if (d.angle > Math.PI / 2 && d.angle < 1.5 * Math.PI) {
        //   return nodes[0].x - 215;
        // } else {
        //   return nodes[0].x + 15;
        // }
      })
      .attr("y", function (d, i) {
        return d.y;
      })
      .attr("dy", ".35em")
      .style("alignment-baseline", "middle")
      .style("text-anchor", function (d) {
        if (d.angle > Math.PI / 2 && d.angle < 1.5 * Math.PI) {
          return "end";
        } else {
          return "start";
        }
      });
    // .attr("transform", function (d, i) {
    //   if (d.angle > Math.PI / 2 && d.angle < 1.5 * Math.PI) {
    //     return "rotate(" + ((d.angle * 180) / Math.PI - 180) + ", 225, 225)";
    //   } else {
    //     return "rotate(" + (d.angle * 180) / Math.PI + ", 225, 225)";
    //   }
    // });
  };

  let svg;
  let nodes = createNodes();
</script>

<svg class="absolute" {width} {height}>
  {#each nodes as n, i (n.id)}
    <text
      x={n.x}
      y={n.y}
      transform="rotate({(n.angle * 180) / Math.PI}, {n.x}, {n.y})">
      {n.label + ' - ' + n.angle.toFixed(2) + ', ' + (n.angle * 180) / Math.PI}
    </text>
  {/each}
</svg>
