import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App Component", () => {
  test("renders without crashing", () => {
    render(<App />);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  test("renders Card component", () => {
    render(<App />);
    const card = screen.getByRole("article", { class: "card" });
    expect(card).toBeInTheDocument();
  });

  test("renders card heading", () => {
    render(<App />);
    expect(screen.getByText("Card")).toBeInTheDocument();
  });

  test("renders card description", () => {
    render(<App />);
    expect(
      screen.getByText("This is the description of card"),
    ).toBeInTheDocument();
  });

  test("renders learn more link", () => {
    render(<App />);
    expect(screen.getByText("Learn more")).toBeInTheDocument();
  });
});
