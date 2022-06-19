import React from "react";

const TextOverFlowHandler = ({ text }) => {
  return <div className="textOverFlowHandler">
    <span className="text-gray-500">{text}</span>
    <div className="tooltip">{text}</div>
  </div>;
};

export default TextOverFlowHandler;
