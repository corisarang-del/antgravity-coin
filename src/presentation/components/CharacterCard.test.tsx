import { fireEvent, render, screen } from "@testing-library/react";
import { CharacterCard } from "@/presentation/components/CharacterCard";
import { characters } from "@/shared/constants/characters";

describe("CharacterCard", () => {
  it("전문 용어와 초보용 한줄 해설을 함께 보여준다", () => {
    const onClick = vi.fn();

    render(<CharacterCard character={characters[0]} onClick={onClick} />);

    expect(screen.getByText(characters[0].specialty)).toBeInTheDocument();
    expect(screen.getByText("초보용 한줄 해설")).toBeInTheDocument();
    expect(screen.getByText(characters[0].beginnerSummary)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
