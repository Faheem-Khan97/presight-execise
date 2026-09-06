import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UserAvatar } from "./UserAvatar";

describe("UserAvatar", () => {
  it("renders an img with the user's full name as alt text", () => {
    render(<UserAvatar src="https://example.com/a.svg" firstName="Amara" lastName="Okafor" />);
    expect(screen.getByRole("img", { name: "Amara Okafor" })).toBeInTheDocument();
  });

  it("falls back to initials when the image fails to load", () => {
    render(<UserAvatar src="https://example.com/broken.svg" firstName="Amara" lastName="Okafor" />);

    fireEvent.error(screen.getByRole("img"));

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("AO")).toBeInTheDocument();
  });
});
