import React, { Component } from "react";
import * as d3 from "d3";

import {
  maxIncome,
  maxLifeExpec,
  maxPopulation,
  minIncome,
  minPopulation
} from "../utils/getMax";

import { continentData } from "../utils/legendData";

export class Gdp extends Component {
  constructor() {
    super();
    this.state = {
      margins: {
        left: 100,
        top: 100,
        right: 100,
        bottom: 100
      },
      width: 700,
      height: 400,
      incomeScale: "",
      lifeExpecScale: "",
      populationScale: "",
      xAxisGroup: "",
      yAxisGroup: "",
      t: d3.transition().duration(75),
      yearCount: 0,
      yearGroup: ""
    };
  }

  componentDidMount() {
    const { margins, width, height } = this.state;

    //SVG Area
    const g = d3
      .select(this.refs.chartArea)
      .append("svg")
      .attr("width", width + margins.left + margins.right)
      .attr("height", height + margins.top + margins.bottom)
      .append("g")
      .attr("transform", `translate(${margins.left}, ${margins.top})`);

    //LABELS
    g.append("text")
      .attr("class", "x axis-label")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("GDP Per Capita");
    g.append("text")
      .attr("class", "y axis-label")
      .attr("x", -(height / 2))
      .attr("y", -40)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Life expectancy");
    const yearGroup = g
      .append("text")
      .attr("class", "year-label")
      .attr("x", width - 100)
      .attr("y", 40)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("Year");
    this.setState({ yearGroup });

    //DATA
    d3.json("data/gdp.json")
      .then(data => {
        const cleanData = data.map(d => {
          return {
            countries: d.countries
              .filter(
                c =>
                  c.income &&
                  c.life_exp &&
                  c.income != null &&
                  c.life_exp != null
              )
              .map(c => {
                c.income = +c.income;
                c.life_exp = +c.life_exp;
                return c;
              }),
            year: d.year
          };
        });

        //Scales
        const incomeScale = d3
          .scaleLog()
          .domain([minIncome(data), maxIncome(data)])
          .range([0, width])
          .base(10);

        const lifeExpecScale = d3
          .scaleLinear()
          .domain([0, maxLifeExpec(data)])
          .range([height, 0]);

        const populationScale = d3
          .scaleLinear()
          .domain([minPopulation(data), maxPopulation(data)])
          .range([5, 60]);

        const continentScale = d3.scaleOrdinal(d3.schemePastel1);

        this.setState({
          incomeScale,
          lifeExpecScale,
          populationScale,
          continentScale
        });

        //X Axis
        const xAxisCall = d3
          .axisBottom(incomeScale)
          .tickValues([500, 5000, 50000])
          .tickFormat(d3.format("$"));
        const xAxisGroup = g
          .append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0, ${height})`)
          .call(xAxisCall);

        //Y Axis
        const yAxisCall = d3.axisLeft(lifeExpecScale);
        const yAxisGroup = g
          .append("g")
          .attr("class", "y-axis")
          .call(yAxisCall);

        this.setState({ xAxisGroup, yAxisGroup });

        //Intervals
        d3.interval(() => {
          this.setState({
            yearCount:
              this.state.yearCount > data.length - 2
                ? 0
                : this.state.yearCount + 1
          });
          this.updateData(g, cleanData[this.state.yearCount]);
        }, 1000);
        this.updateData(g, cleanData[0]);

        this.buildLegend(data);
      })
      .catch(err => console.log(err));
  }

  updateData(g, data) {
    let {
      incomeScale,
      lifeExpecScale,
      populationScale,
      continentScale,
      height,
      yearGroup,
      t
    } = this.state;

    //JOIN new data with old elements
    const circles = g.selectAll("circle").data(data.countries);

    //EXIT old elements not present in new data
    circles.exit().remove();

    //ENTER new elements and Drawing circles
    circles
      .enter()
      .append("circle")
      .attr("cx", d => incomeScale(d.income))
      .attr("cy", d => height - lifeExpecScale(d.life_exp))
      .attr("r", populationScale(0))
      .attr("fill", d => continentScale(d.continent))
      .attr("opacity", "0.8")
      .merge(circles)
      .transition(t)
      .attr("cx", d => incomeScale(d.income))
      .attr("cy", d => height - lifeExpecScale(d.life_exp))
      .attr("r", d => populationScale(d.population));

    yearGroup.text(`Year ${data.year}`);
  }

  buildLegend(data) {
    let { continentScale } = this.state;

    const svg = d3
      .select(this.refs.chartLegend)
      .append("svg")
      .attr("class", "chart-legend-svg")
      .attr("width", "1000")
      .attr("height", "500");

    //Continent Legend

    const continentG = svg.append("g").attr("transform", `translate(100, 90)`);
    const continentCircles = continentG
      .selectAll("circle")
      .data(continentData(data));
    const continentCirclesG = continentCircles.enter().append("g");
    continentCirclesG
      .append("circle")
      .attr("class", (d, i) => `legend-continent legend-continent-${i}`)
      .attr("cx", (d, i) => i * 200)
      .attr("cy", 10)
      .attr("r", 20)
      .attr("fill", d => continentScale(d))
      .attr("opacity", "0.8");

    continentCirclesG
      .append("text")
      .text(d => d)
      .attr(
        "class",
        (d, i) => `paragraph legend-continent legend-continent-text-${i}`
      )
      .attr("transform", (d, i) => {
        var legendContinentText = d3
          .select(`.legend-continent-text-${i}`)
          .node()
          .getBoundingClientRect().width;
        var x = i * 200 - legendContinentText / 2;
        return "translate(" + [x, 48] + `)`;
      });

    //Population Legend
    // const g = svg.append("g").attr("transform", `translate(100, 210)`);
    // const circles = g.selectAll("circle").data(populationData(data));
    // const circlesG = circles.enter().append("g");
    // circlesG
    //   .append("circle")
    //   .attr("class", (d, i) => `legend-population legend-population-${i}`)
    //   .attr("cx", (d, i) => i * 200)
    //   .attr("cy", 10)
    //   .attr("r", d => populationScale(d))
    //   .attr("fill", "none")
    //   .attr("stroke", "grey")
    //   .attr("stroke-width", "1")
    //   .attr("opacity", "0.8");

    // circlesG
    //   .append("text")
    //   .text(d => d)
    //   .attr(
    //     "class",
    //     (d, i) => `paragraph legend-population legend-population-text-${i}`
    //   )
    //   .attr("transform", (d, i) => {
    //     var legendPopulationText = d3
    //       .select(`.legend-population-text-${i}`)
    //       .node()
    //       .getBoundingClientRect().width;
    //     var x = i * 200 - legendPopulationText / 2;
    //     return "translate(" + [x, 88] + `)`;
    //   });
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="chart-area" ref="chartArea"></div>
          <div className="chart-legend" ref="chartLegend"></div>
        </div>
      </div>
    );
  }
}

export default Gdp;
