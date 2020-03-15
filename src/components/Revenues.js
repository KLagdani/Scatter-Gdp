import React, { Component } from "react";
import * as d3 from "d3";

export class Revenues extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      margins: {
        left: 100,
        top: 100,
        right: 100,
        bottom: 100
      },
      width: 0,
      height: 0,
      flag: true,
      t: d3.transition().duration(750),
      x: 0,
      y: 0,
      yLabel: "",
      xAxisGroup: 0,
      yAxisGroup: 0
    };
  }
  componentDidMount() {
    const { margins } = this.state;

    const width = 900 - this.state.margins.left - this.state.margins.right;
    const height = 600 - this.state.margins.top - this.state.margins.bottom;

    this.setState({
      width,
      height
    });

    const g = d3
      .select(this.refs.chartArea)
      .append("svg")
      .attr("width", width + margins.left + margins.right)
      .attr("height", height + margins.top + margins.bottom)
      .append("g")
      .attr("transform", `translate(${margins.left},${margins.top})`);

    g.append("text")
      .attr("class", "x axis-label")
      .attr("x", width / 2)
      .attr("y", height + 50)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("Month");

    let yLabel = g
      .append("text")
      .attr("class", "y axis-label")
      .attr("x", -(height / 2))
      .attr("y", -60)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Revenue");

    this.setState({ yLabel });

    d3.json("data/revenues.json")
      .then(data => {
        data.forEach(d => {
          d.revenue = +d.revenue;
          d.profit = +d.profit;
        });

        this.setState({ data });

        const x = d3
          .scaleBand()
          .range([0, width])
          .paddingInner(0.3)
          .paddingOuter(0.3);

        const y = d3.scaleLinear().range([height, 0]);

        const xAxisGroup = g
          .append("g")
          .attr("class", "x axis")
          //putting th x axis in the bottom
          .attr("transform", `translate(0, ${height})`);

        const yAxisGroup = g.append("g").attr("class", "y axis");

        this.setState({ x, y, xAxisGroup, yAxisGroup });

        d3.interval(() => {
          this.updateData(g);
          this.setState({
            flag: !this.state.flag
          });
        }, 1000);

        //initiating the update funtion
        this.updateData(g);
      })
      .catch(err => {
        console.log(err);
      });
  }

  updateData(g) {
    let { data, x, y, xAxisGroup, yAxisGroup, yLabel, t, flag } = this.state;

    data = flag ? data : data.slice(1);
    let value = flag ? "revenue" : "profit";

    x.domain(data.map(d => d.month));
    y.domain([0, d3.max(data, d => d[value])]);

    //X Axis
    const xAxisCall = d3.axisBottom(x);
    xAxisGroup.transition(t).call(xAxisCall);

    //Y Axis
    const yAxisCall = d3
      .axisLeft(y)
      .ticks(5)
      .tickFormat(d => `${d} $`);
    yAxisGroup.call(yAxisCall);

    //JOIN new data with old elements
    const circles = g.selectAll("circle").data(data, d => d.month);

    //EXIT old elements not present in new data
    circles
      .exit()
      .attr("fill", "grey")
      .transition(t)
      .attr("cy", y(0))
      .remove();

    //ENTER new elements present in new data
    circles
      .enter()
      .append("circle")
      .attr("cx", d => x(d.month) + x.bandwidth() / 2)
      .attr("r", 5)
      .attr("fill", "pink")
      .attr("cy", y(0))
      .attr("height", 0)
      .merge(circles)
      .transition(t)
      .attr("cx", d => x(d.month) + x.bandwidth() / 2)
      .attr("cy", d => y(d[value]));

    let label = flag ? "Revenue" : "Profit";
    yLabel.text(label);
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="chart-area" ref="chartArea"></div>
        </div>
      </div>
    );
  }
}

export default Revenues;
