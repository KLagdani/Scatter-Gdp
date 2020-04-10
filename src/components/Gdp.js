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
      g: "",
      lifeExpecScale: "",
      incomeScale: "",
      populationScale: "",
      yearGroup: "",
      continentScale: "",
      count: 0
    };
    this.updateData = this.updateData.bind(this);
  }

  componentDidMount() {
    var margin = { left: 100, right: 100, top: 100, bottom: 100 };
    var height = 500 - margin.top - margin.bottom,
      width = 800 - margin.left - margin.right;

    var g = d3
      .select(this.refs.chartArea)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Labels
    var xLabel = g
      .append("text")
      .attr("y", height + 50)
      .attr("x", width / 2)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("GDP Per Capita ($)");
    var yLabel = g
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -170)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("Life Expectancy (Years)");
    var yearGroup = g
      .append("text")
      .attr("class", "year-label")
      .attr("x", width - 50)
      .attr("y", height - 20)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("Year");

    this.setState({
      g,
      yearGroup
    });

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

        // Scales
        var incomeScale = d3
          .scaleLog()
          .base(10)
          .range([0, width])
          .domain([minIncome(data), maxIncome(data)]);
        var lifeExpecScale = d3
          .scaleLinear()
          .range([height, 0])
          .domain([0, maxLifeExpec(data)]);
        var populationScale = d3
          .scaleLinear()
          .range([5, 60])
          .domain([minPopulation(data), maxPopulation(data)]);
        var continentScale = d3.scaleOrdinal(d3.schemePastel1);

        // X Axis
        var xAxisCall = d3
          .axisBottom(incomeScale)
          .tickValues([500, 5000, 50000])
          .tickFormat(d3.format("$"));
        g.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxisCall);

        // Y Axis
        var yAxisCall = d3.axisLeft(lifeExpecScale).tickFormat(d => +d);
        g.append("g")
          .attr("class", "y axis")
          .call(yAxisCall);

        this.setState({
          incomeScale,
          lifeExpecScale,
          populationScale,
          continentScale
        });

        d3.interval(() => {
          this.setState({
            count: this.state.count < data.length - 2 ? this.state.count + 1 : 0
          });
          this.updateData(cleanData[this.state.count]);
        }, 100);

        this.updateData(cleanData[0]);
        this.buildLegend(data);
      })

      .catch(err => console.log(err));
  }

  updateData(data) {
    var {
      g,
      continentScale,
      lifeExpecScale,
      incomeScale,
      populationScale,
      yearGroup,
      count
    } = this.state;

    var t = d3.transition().duration(100);

    // JOIN new data with old elements.
    var circles = g.selectAll("circle").data(data.countries, d => {
      return d.country;
    });

    // EXIT old elements.
    circles
      .exit()
      .attr("class", "exit")
      .remove();

    //ENTER new elements and Drawing circles
    circles
      .enter()
      .append("circle")
      .attr("class", "enter")
      .attr("fill", d => {
        return continentScale(d.continent);
      })
      .merge(circles)
      .transition(t)
      .attr("cy", d => lifeExpecScale(d.life_exp))
      .attr("cx", d => incomeScale(d.income))
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
      .attr("height", "300");

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
