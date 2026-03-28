import { fireEvent, render, screen } from "@testing-library/react";
import { CharacterDetailModal } from "@/presentation/components/CharacterDetailModal";
import { characters } from "@/shared/constants/characters";

describe("CharacterDetailModal", () => {
  it("선택한 캐릭터의 이미지와 성격, 초보 해설을 보여준다", () => {
    const onClose = vi.fn();

    render(<CharacterDetailModal character={characters[0]} onClose={onClose} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByAltText(characters[0].name)).toBeInTheDocument();
    expect(screen.getByText("성격")).toBeInTheDocument();
    expect(screen.getByText("어려운 부분만 쉽게 보기")).toBeInTheDocument();
    expect(screen.getByText(characters[0].beginnerGuide[0].term)).toBeInTheDocument();
    expect(screen.getByText(characters[0].beginnerGuide[0].easyMeaning)).toBeInTheDocument();
    expect(screen.getByText(characters[0].personality)).toBeInTheDocument();
    expect(screen.queryByText("고른 이유")).not.toBeInTheDocument();
    expect(screen.queryByText(characters[0].selectionReason)).not.toBeInTheDocument();
    expect(screen.queryByText(/원본 이미지:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/배포 이미지:/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("모달 이미지를 원본 하나로 꽉 차게 보여준다", () => {
    render(<CharacterDetailModal character={characters[0]} onClose={() => undefined} />);

    expect(screen.getByAltText(characters[0].name)).toHaveClass("object-cover");
  });

  it("초보 해설은 캐릭터마다 2개 이내로만 보여준다", () => {
    render(<CharacterDetailModal character={characters[0]} onClose={() => undefined} />);

    expect(characters[0].beginnerGuide).toHaveLength(2);
  });
});
