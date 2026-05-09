


function AppContainer({ children }) {
  return children;
}

if (process.env.NODE_ENV !== 'production') {
  AppContainer.displayName = 'AppContainer';
}

module.exports = AppContainer;
module.exports.default = AppContainer;
