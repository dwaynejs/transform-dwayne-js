module.exports = (name, path, options) => {
  let varName;

  do {
    varName = path.scope.generateUid(name);
  } while (options.unscopables.indexOf(varName) !== -1);

  return varName;
};
