<script>
    import * as d3 from "d3";
    import { onMount } from "svelte";
    onMount(() => {
        var w = 600,
            h = 460,
            r = (Math.min(w, h) - 50) / 2;

        // d3.csv("static/makes.csv", function (error, data) {
        const data = [
            { make: "Ford", cars: 148318 },
            { make: "Chevy", cars: 147864 },
            { make: "Toyota", cars: 139514 },
            { make: "Honda", cars: 71312 },
            { make: "Subaru", cars: 70097 },
            { make: "Dodge", cars: 60532 },
            { make: "GMC", cars: 17995 },
            { make: "Jeep", cars: 52065 },
            { make: "Nissan", cars: 44745 },
            { make: "Hyundai", cars: 32127 },
            { make: "Volkswagen", cars: 28140 },
            { make: "Chrysler", cars: 22181 },
            { make: "Buick", cars: 20454 },
            { make: "Kia", cars: 17674 },
            { make: "Volvo", cars: 17248 },
            { make: "Mazda", cars: 15021 },
            { make: "Pontiac", cars: 14879 },
            { make: "Mercedes", cars: 9983 },
            { make: "Saturn", cars: 9391 },
            { make: "Others", cars: 7703 },
        ];
        var createNodes = function () {
            var nodeData = [
                { id: 0, label: "AAA" },
                { id: 1, label: "BBB" },
                { id: 2, label: "CCC" },
                { id: 3, label: "DDD" },
                { id: 4, label: "EEE" },
                { id: 5, label: "FFF" },
                { id: 6, label: "GGG" },
                { id: 7, label: "HHH" },
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
                nodes.push({
                    id: i,
                    x: x,
                    y: y,
                    label: nodeData[i].label,
                    angle: angle,
                });
            }
            return nodes;
        };
        console.log("data", data);
        var svgPie = d3
            .select("#chart")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

        var arc = d3
            .arc()
            .outerRadius(r - 12)
            .innerRadius(2);

        var labelArc = d3
            .arc()
            .outerRadius(r + 20)
            .innerRadius(r - 5);

        var pie = d3
            .pie()
            .sort(null)
            .value(function (d) {
                return d.cars;
            });

        const pieData = pie(data);
        console.log("pieData", pieData);
        var pie = svgPie
            .selectAll(".arc")
            .data(pieData)
            .enter()
            .append("g")
            .attr("class", "arc");

        pie.append("path").attr("d", arc);
        // .style("fill", function (d) {
        //     return piecolors(d.data.make);
        // });

        pie.append("text")
            .attr("transform", function (d) {
                var midAngle =
                    d.endAngle < Math.PI
                        ? d.startAngle / 2 + d.endAngle / 2
                        : d.startAngle / 2 + d.endAngle / 2 + Math.PI;
                return (
                    "translate(" +
                    labelArc.centroid(d)[0] +
                    "," +
                    labelArc.centroid(d)[1] +
                    ") rotate(-90) rotate(" +
                    (midAngle * 180) / Math.PI +
                    ")"
                );
            })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.data.cars > 10000 ? d.data.make : null;
            });
    });
    // });
</script>

<style>
    .line {
        fill: none;
        stroke: black;
        stroke-width: 1.2px;
    }

    div#chart {
        width: 100%;
    }
</style>

<div id="chart" />
