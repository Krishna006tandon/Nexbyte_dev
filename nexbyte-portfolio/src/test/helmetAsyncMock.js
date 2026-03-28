const React = require('react');

const HelmetProvider = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

const Helmet = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

module.exports = { HelmetProvider, Helmet };
