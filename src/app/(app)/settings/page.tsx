"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/delete", {
        method: "DELETE",
      });

      if (res.ok) {
        alert("회원 탈퇴가 완료되었습니다.");
        router.push("/login");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "탈퇴 처리 중 오류가 발생했습니다");
      }
    } catch (error) {
      alert("연결 오류가 발생했습니다");
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">설정</h1>
        <Link href="/" className="text-primary hover:underline text-sm">
          홈으로
        </Link>
      </div>

      <div className="bg-card border rounded-2xl p-6 space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">약관 및 정책</h2>
          <div className="space-y-2">
            <Link
              href="/terms"
              className="block p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <span className="text-foreground">이용약관</span>
              <span className="text-muted-foreground text-sm ml-2">→</span>
            </Link>
            <Link
              href="/privacy"
              className="block p-3 rounded-lg hover:bg-secondary transition-colors"
            >
              <span className="text-foreground">개인정보 처리방침</span>
              <span className="text-muted-foreground text-sm ml-2">→</span>
            </Link>
          </div>
        </section>

        <hr className="border-border" />

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">계정 관리</h2>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="w-full p-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-left font-medium"
          >
            회원 탈퇴
          </button>
          <p className="text-xs text-muted-foreground mt-2">
            탈퇴 시 모든 학습 데이터가 즉시 삭제되며 복구할 수 없습니다.
          </p>
        </section>
      </div>

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-foreground mb-3">정말 탈퇴하시겠습니까?</h3>
            <p className="text-foreground/80 text-sm mb-4">
              탈퇴하시면 모든 학습 기록이 영구적으로 삭제되며 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={loading}
                className="flex-1 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {loading ? "처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
