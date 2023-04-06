import React from "react";

const Stars = ({ highlight }) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((star, index) => {
          index += 1;
          return (
            <div
              key={index}
              className={index <= highlight ? "on" : "off"}
            >
              <span className="star">&#9733;</span>
            </div>
          );
        })}
      </div>
    );
  };
  
export default Stars;