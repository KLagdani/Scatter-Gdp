import _ from "lodash";

import { maxPopulation, minPopulation } from "./getMax";

export const populationData = data => {
  const interval = maxPopulation(data) / 3;
  return [
    minPopulation(data),
    minPopulation(data) + interval,
    minPopulation(data) + interval * 2,
    maxPopulation(data)
  ];
};

export const continentData = data => {
  return data.map(d => {
    const allContinents = d.countries.map(c => c.continent);

    return _.uniq(_.map(allContinents));
  })[0];
};
