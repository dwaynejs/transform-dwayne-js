const { decode, encode } = require('sourcemap-codec');

module.exports = (map) => {
  if (!map) {
    return null;
  }

  const mappings = decode(map.mappings);
  const { names } = map;

  for (let i = 0; i < names.length; i++) {
    if (
      mappings.every((lineMappings) => (
        lineMappings.every((mapping) => mapping[4] !== i)
      ))
    ) {
      names.splice(i, 1);

      mappings.forEach((lineMappings) => {
        lineMappings.forEach((mapping) => {
          if (mapping[4] > i) {
            mapping[4]--;
          }
        });
      });

      i--;
    }
  }

  map.mappings = encode(mappings);

  return map;
};
