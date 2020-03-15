import React, { Component } from "react";
import * as d3 from "d3";

export class Container extends Component {
  componentDidMount() {
    const margin = { left: 100, right: 100, top: 100, bottom: 100 };

    const width = 900 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const g = d3
      .select(this.refs.chartArea)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    g.append("text")
      .attr("class", "x axis-label")
      .attr("x", width / 2)
      .attr("y", height + 90)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("The tallest buildings");

    g.append("text")
      .attr("class", "y axis-label")
      .attr("x", -(height / 2))
      .attr("y", -60)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Height");

    d3.json("data/buildings.json")
      .then(data => {
        data.forEach(d => {
          d.height = +d.height;
        });

        const x = d3
          .scaleBand()
          .domain(data.map(d => d.name))
          .range([0, width])
          .paddingInner(0.3)
          .paddingOuter(0.3);

        const y = d3
          .scaleLinear()
          .domain([0, d3.max(data, d => d.height)])
          .range([height, 0]);

        //X Axis
        const xAxisCall = d3.axisBottom(x);

        g.append("g")
          .attr("class", "x axis")
          .attr("transform", `translate(0, ${height})`)
          .call(xAxisCall)
          .selectAll("text")
          .attr("y", "10")
          .attr("x", "-5")
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-20)");

        //Y Axis
        const yAxisCall = d3
          .axisLeft(y)
          .ticks(3)
          .tickFormat(d => `${d} m`);

        g.append("g")
          .attr("class", "y axis")
          .call(yAxisCall);

        const rects = g.selectAll("rect").data(data);

        rects
          .enter()
          .append("rect")
          .attr("x", d => x(d.name))
          .attr("y", d => y(d.height))
          .attr("height", d => height - y(d.height))
          .attr("width", x.bandwidth)
          .attr("fill", "pink");
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <div className="div container">
        <div className="row">
          <div className="chart-area" ref="chartArea"></div>
        </div>
      </div>
    );
  }
}

export default Container;
