"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/** 설정 페이지 - 알림, 계정 관리, 약관 링크 */
export default function SettingsPage() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificationTime, setNotificationTime] = useState("08:00");
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [timeLoading, setTimeLoading] = useState(true);
  const [timeSaving, setTimeSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch current notification settings
    fetch("/api/settings/notification-time")
      .then((res) => res.json())
      .then((data) => {
        if (data.dailyTime) {
          setNotificationTime(data.dailyTime);
        }
        if (data.isActive !== undefined) {
          setNotificationEnabled(data.isActive);
        }
      })
      .catch((err) => console.error("Failed to fetch notification settings:", err))
      .finally(() => setTimeLoading(false));
  }, []);

  // 알림 시간 변경 및 서버에 저장
  const handleTimeChange = async (newTime: string) => {
    setNotificationTime(newTime);
    setTimeSaving(true);

    try {
      const res = await fetch("/api/settings/notification-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyTime: newTime }),
      });

      if (res.ok) {
        console.log("Notification time updated:", newTime);
      } else {
        const data = await res.json();
        alert(data.error || "시간 저장에 실패했습니다");
      }
    } catch (error) {
      alert("연결 오류가 발생했습니다");
    } finally {
      setTimeSaving(false);
    }
  };

  // 알림 활성화/비활성화 토글
  const handleToggleNotification = async (enabled: boolean) => {
    setNotificationEnabled(enabled);
    setTimeSaving(true);

    try {
      const res = await fetch("/api/settings/notification-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: enabled }),
      });

      if (res.ok) {
        console.log("Notification enabled:", enabled);
      } else {
        const data = await res.json();
        alert(data.error || "설정 저장에 실패했습니다");
        // Revert on error
        setNotificationEnabled(!enabled);
      }
    } catch (error) {
      alert("연결 오류가 발생했습니다");
      // Revert on error
      setNotificationEnabled(!enabled);
    } finally {
      setTimeSaving(false);
    }
  };

  // 로그아웃 처리 후 로그인 페이지로 이동
  const handleLogout = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        router.push("/login");
        router.refresh();
      } else {
        alert("로그아웃 처리 중 오류가 발생했습니다");
      }
    } catch (error) {
      alert("연결 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  // 회원 탈퇴 처리 및 데이터 삭제
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
    <div className="max-w-lg mx-auto px-4 pt-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">설정</h1>
        <Link href="/" className="text-primary hover:underline text-sm">
          홈으로
        </Link>
      </div>

      <div className="bg-card border rounded-2xl p-6 space-y-6">
        {/* Notification Settings */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">학습 알림</h2>
          <div className="space-y-4">
            {/* Toggle Switch */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  알림 받기
                </label>
                <p className="text-xs text-muted-foreground">
                  매일 정해진 시간에 학습 알림을 보내드립니다
                </p>
              </div>
              {timeLoading ? (
                <div className="w-12 h-6 bg-secondary rounded-full animate-pulse"></div>
              ) : (
                <button
                  onClick={() => handleToggleNotification(!notificationEnabled)}
                  disabled={timeSaving}
                  className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ${
                    notificationEnabled ? "bg-primary" : "bg-gray-300"
                  }`}
                  role="switch"
                  aria-checked={notificationEnabled}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationEnabled ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Time Picker */}
            {!timeLoading && notificationEnabled && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  알림 시간
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={notificationTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    disabled={timeSaving || !notificationEnabled}
                    className="flex-1 px-4 py-3 bg-secondary border border-border rounded-lg text-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  />
                  {timeSaving && (
                    <div className="text-xs text-muted-foreground">저장 중...</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <hr className="border-border" />

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
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full p-3 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors text-left font-medium disabled:opacity-50 flex items-center justify-between"
            >
              <span>로그아웃</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
            
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full p-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-left font-medium"
            >
              회원 탈퇴
            </button>
            <p className="text-xs text-muted-foreground">
              탈퇴 시 모든 학습 데이터가 즉시 삭제되며 복구할 수 없습니다.
            </p>
          </div>
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
