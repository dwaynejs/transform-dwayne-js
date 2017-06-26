const _ = require('lodash');
const { decode, encode } = require('sourcemap-codec');

module.exports = (map, { start, end }, lines) => {
  if (!map) {
    return null;
  }

  const newMappings = [];

  start = lines.locationForIndex(start);
  end = lines.locationForIndex(end);

  decode(map.mappings)
    .slice(start.line, end.line + 1)
    .forEach((lineMappings, line, lines) => {
      const newLineMappings = [];

      newMappings.push(newLineMappings);

      lineMappings.forEach((mapping) => {
        if (line === 0) {
          if (mapping[0] >= start.column && (line !== lines.length - 1 || mapping[0] < end.column)) {
            newLineMappings.push([
              mapping[0] - start.column,
              ...mapping.slice(1)
            ]);
          }
        } else if (line === lines.length - 1) {
          if (mapping[0] < end.column) {
            newLineMappings.push(mapping);
          }
        } else {
          newLineMappings.push(mapping);
        }
      });
    });

  return _.assign(_.cloneDeep(map), {
    mappings: encode(newMappings)
  });
};
