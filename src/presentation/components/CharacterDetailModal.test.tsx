import { fireEvent, render, screen } from "@testing-library/react";
import { CharacterDetailModal } from "@/presentation/components/CharacterDetailModal";
import { characters } from "@/shared/constants/characters";

describe("CharacterDetailModal", () => {
  it("선택한 캐릭터의 이미지와 성격, 고른 이유를 보여준다", () => {
    const onClose = vi.fn();

    render(<CharacterDetailModal character={characters[0]} onClose={onClose} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByAltText(characters[0].name)).toBeInTheDocument();
    expect(screen.getByText("성격")).toBeInTheDocument();
    expect(screen.getByText("고른 이유")).toBeInTheDocument();
    expect(screen.getByText(characters[0].personality)).toBeInTheDocument();
    expect(screen.getByText(characters[0].selectionReason)).toBeInTheDocument();
    expect(screen.queryByText(/원본 이미지:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/배포 이미지:/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("모달 이미지를 원본 하나로 꽉 차게 보여준다", () => {
    render(<CharacterDetailModal character={characters[0]} onClose={() => undefined} />);

    expect(screen.getByAltText(characters[0].name)).toHaveClass("object-cover");
  });
});
