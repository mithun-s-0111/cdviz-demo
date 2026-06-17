import React from "react";

const Card = ({ title, description, link, linkText = "Learn more" }) => {
  return (
    <article className="card">
      <header>
        <h2>{title ?? "Card"}</h2>
      </header>
      <p>{description ?? "This is the description of card"}</p>
      <a href={link} target="_blank" rel="noopener noreferrer">
        {linkText}
      </a>
    </article>
  );
};

export default Card;
