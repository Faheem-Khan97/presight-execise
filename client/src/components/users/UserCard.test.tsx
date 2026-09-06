import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { User } from "../../types/user";
import { UserCard } from "./UserCard";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    avatar: "https://example.com/avatar.svg",
    first_name: "Amara",
    last_name: "Okafor",
    age: 29,
    nationality: "Nigerian",
    hobbies: [],
    ...overrides,
  };
}

describe("UserCard", () => {
  it("renders the avatar, full name, nationality, and age", () => {
    render(<UserCard user={makeUser()} />);

    expect(screen.getByRole("img", { name: "Amara Okafor" })).toBeInTheDocument();
    expect(screen.getByText("Amara Okafor")).toBeInTheDocument();
    expect(screen.getByText("Nigerian")).toBeInTheDocument();
    expect(screen.getByText("29")).toBeInTheDocument();
  });

  it("shows every hobby when there are 2 or fewer, with no overflow badge", () => {
    render(<UserCard user={makeUser({ hobbies: ["Chess", "Hiking"] })} />);

    expect(screen.getByText("Chess")).toBeInTheDocument();
    expect(screen.getByText("Hiking")).toBeInTheDocument();
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it("shows only the first 2 hobbies plus a +n badge for the remainder", () => {
    render(<UserCard user={makeUser({ hobbies: ["Chess", "Hiking", "Cooking", "Reading", "Gaming"] })} />);

    expect(screen.getByText("Chess")).toBeInTheDocument();
    expect(screen.getByText("Hiking")).toBeInTheDocument();
    expect(screen.queryByText("Cooking")).not.toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("renders no hobby badges at all for a user with zero hobbies", () => {
    render(<UserCard user={makeUser({ hobbies: [] })} />);

    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });
});
