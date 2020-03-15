import * as d3 from "d3";

export const maxIncome = data => {
  return d3.max(data.map(d => d3.max(d.countries, d => d.income)), d => d);
};

export const maxPopulation = data => {
  return d3.max(data.map(d => d3.max(d.countries, d => d.population)), d => d);
};

export const maxLifeExpec = data => {
  return d3.max(data.map(d => d3.max(d.countries, d => d.life_exp)), d => d);
};

export const minIncome = data => {
  return d3.min(data.map(d => d3.min(d.countries, d => d.income)), d => d);
};

export const minPopulation = data => {
  return d3.min(data.map(d => d3.min(d.countries, d => d.population)), d => d);
};

export const minLifeExpec = data => {
  return d3.min(data.map(d => d3.min(d.countries, d => d.life_exp)), d => d);
};
