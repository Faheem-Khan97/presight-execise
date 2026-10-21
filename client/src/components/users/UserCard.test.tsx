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

  it("surfaces a selected hobby ahead of the user's own order", () => {
    render(
      <UserCard
        user={makeUser({ hobbies: ["Chess", "Hiking", "Cooking", "Reading", "Gaming"] })}
        selectedHobbies={["Gaming"]}
      />,
    );

    expect(screen.getByText("Gaming")).toBeInTheDocument();
    expect(screen.getByText("Chess")).toBeInTheDocument();
    expect(screen.queryByText("Hiking")).not.toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("shows every selected hobby even when more than two are selected", () => {
    render(
      <UserCard
        user={makeUser({ hobbies: ["Chess", "Hiking", "Cooking", "Reading", "Gaming"] })}
        selectedHobbies={["Cooking", "Reading", "Gaming"]}
      />,
    );

    for (const hobby of ["Cooking", "Reading", "Gaming"]) {
      expect(screen.getByText(hobby)).toBeInTheDocument();
    }
    expect(screen.queryByText("Chess")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("keeps the original first-two behaviour when nothing is selected", () => {
    render(<UserCard user={makeUser({ hobbies: ["Chess", "Hiking", "Cooking"] })} selectedHobbies={[]} />);

    expect(screen.getByText("Chess")).toBeInTheDocument();
    expect(screen.getByText("Hiking")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("ignores a selected hobby the user does not have", () => {
    render(
      <UserCard user={makeUser({ hobbies: ["Chess", "Hiking", "Cooking"] })} selectedHobbies={["Surfing"]} />,
    );

    expect(screen.getByText("Chess")).toBeInTheDocument();
    expect(screen.getByText("Hiking")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("renders no hobby badges at all for a user with zero hobbies", () => {
    render(<UserCard user={makeUser({ hobbies: [] })} />);

    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });
});
