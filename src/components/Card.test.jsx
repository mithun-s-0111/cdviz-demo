import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card Component", () => {
  test("renders Card component", () => {
    render(<Card />);
    expect(screen.getByRole("article")).toBeInTheDocument();
  });

  test("renders default title", () => {
    render(<Card />);
    expect(screen.getByText("Card")).toBeInTheDocument();
  });

  test("renders custom title", () => {
    render(<Card title="Test Card" />);
    expect(screen.getByText("Test Card")).toBeInTheDocument();
  });

  test("renders default description", () => {
    render(<Card />);
    expect(
      screen.getByText("This is the description of card"),
    ).toBeInTheDocument();
  });

  test("renders custom description", () => {
    const customDesc = "Custom description text";
    render(<Card description={customDesc} />);
    expect(screen.getByText(customDesc)).toBeInTheDocument();
  });

  test("renders default link text", () => {
    render(<Card />);
    expect(screen.getByText("Learn more")).toBeInTheDocument();
  });

  test("renders custom link text", () => {
    render(<Card linkText="Click here" />);
    expect(screen.getByText("Click here")).toBeInTheDocument();
  });

  test("link opens in new tab", () => {
    render(<Card link="https://example.com" />);
    const link = screen.getByText("Learn more");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("link has correct href when provided", () => {
    const testUrl = "https://test.com";
    render(<Card link={testUrl} />);
    const link = screen.getByText("Learn more");
    expect(link).toHaveAttribute("href", testUrl);
  });

  test("renders heading element", () => {
    render(<Card title="Test Title" />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
  });
});
