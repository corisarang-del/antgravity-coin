import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPageClient } from "@/app/login/LoginPageClient";

const signInWithOAuthMock = vi.fn();
const searchParamsState = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParamsState,
}));

vi.mock("@/infrastructure/auth/supabaseBrowserClient", () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signInWithOAuth: signInWithOAuthMock,
    },
  }),
}));

describe("LoginPageClient", () => {
  beforeEach(() => {
    signInWithOAuthMock.mockReset();
    searchParamsState.delete("next");
    searchParamsState.delete("error");
  });

  it("Google 버튼 클릭 시 next=/me 기준 OAuth 로그인을 시작한다", async () => {
    render(<LoginPageClient />);

    fireEvent.click(screen.getByRole("button", { name: /Google로 시작/i }));

    await waitFor(() => {
      expect(signInWithOAuthMock).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/auth/callback?next=%2Fme",
        },
      });
    });
  });

  it("OAuth callback 실패 파라미터가 있으면 안내 문구를 보여준다", () => {
    searchParamsState.set("error", "oauth_callback_failed");

    render(<LoginPageClient />);

    expect(screen.getByText(/로그인 연결이 끊겼어/)).toBeInTheDocument();
  });
});
