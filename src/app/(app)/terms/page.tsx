import Link from "next/link";

/** 이용약관 페이지 */
export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-20">
      <div className="mb-6">
        <Link href="/login" className="text-primary hover:underline text-sm">
          ← 로그인으로 돌아가기
        </Link>
      </div>

      <article className="prose prose-slate max-w-none">
        <h1 className="text-3xl font-bold mb-6">Voca App 이용약관</h1>
        <p className="text-sm text-muted-foreground mb-8"><strong>시행일</strong>: 2026년 2월 4일</p>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제1조 (목적)</h2>
          <p className="text-foreground/80 leading-relaxed">
            본 약관은 Voca App(이하 "서비스")의 이용과 관련하여 서비스 제공자와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제2조 (정의)</h2>
          <ol className="list-decimal list-inside space-y-2 text-foreground/80">
            <li>"서비스"란 이용자가 웹 브라우저를 통해 접근할 수 있는 Voca App 어휘 학습 플랫폼을 의미합니다.</li>
            <li>"이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
            <li>"회원"이란 서비스에 가입하여 지속적으로 서비스를 이용할 수 있는 자를 말합니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제3조 (약관의 게시와 개정)</h2>
          <ol className="list-decimal list-inside space-y-2 text-foreground/80">
            <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.</li>
            <li>서비스 제공자는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
            <li>약관이 개정되는 경우 서비스 제공자는 개정내용과 적용일자를 명시하여 적용일자 7일 전부터 공지합니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제4조 (회원가입)</h2>
          <ol className="list-decimal list-inside space-y-2 text-foreground/80">
            <li>이용자는 서비스가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
            <li>서비스는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>가입신청자가 본 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                <li>기타 회원으로 등록하는 것이 서비스의 기술상 현저히 지장이 있다고 판단되는 경우</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제5조 (회원 탈퇴 및 자격 상실)</h2>
          <ol className="list-decimal list-inside space-y-2 text-foreground/80">
            <li>회원은 언제든지 탈퇴를 요청할 수 있으며, 서비스는 즉시 회원 탈퇴를 처리합니다.</li>
            <li>회원이 다음 각 호의 사유에 해당하는 경우, 서비스는 회원자격을 제한 및 정지시킬 수 있습니다.
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>가입 신청 시 허위 내용을 등록한 경우</li>
                <li>타인의 서비스 이용을 방해하거나 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
                <li>서비스를 이용하여 법령 또는 본 약관이 금지하는 행위를 하는 경우</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제6조 (서비스의 제공 및 변경)</h2>
          <ol className="list-decimal list-inside space-y-2 text-foreground/80">
            <li>서비스는 다음과 같은 업무를 수행합니다.
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>어휘 학습 콘텐츠 제공</li>
                <li>학습 진도 관리 및 통계 제공</li>
                <li>기타 서비스가 정하는 업무</li>
              </ul>
            </li>
            <li>서비스는 필요한 경우 서비스의 내용을 변경할 수 있습니다. 이 경우 변경된 서비스의 내용 및 제공일자를 명시하여 공지합니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제7조 (서비스의 중단)</h2>
          <ol className="list-decimal list-inside space-y-2 text-foreground/80">
            <li>서비스는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
            <li>서비스는 제1항의 사유로 서비스 제공이 일시적으로 중단됨으로 인하여 이용자가 입은 손해에 대하여 배상합니다. 단, 서비스가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제8조 (회원의 의무)</h2>
          <p className="text-foreground/80 mb-2">회원은 다음 행위를 하여서는 안 됩니다.</p>
          <ol className="list-decimal list-inside space-y-1 text-foreground/80">
            <li>신청 또는 변경 시 허위내용의 등록</li>
            <li>타인의 정보 도용</li>
            <li>서비스에 게시된 정보의 변경</li>
            <li>서비스가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
            <li>서비스 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
            <li>서비스 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
            <li>외설 또는 폭력적인 메시지, 화상, 음성 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제9조 (저작권의 귀속 및 이용제한)</h2>
          <ol className="list-decimal list-inside space-y-2 text-foreground/80">
            <li>서비스가 작성한 저작물에 대한 저작권 기타 지적재산권은 서비스에 귀속합니다.</li>
            <li>이용자는 서비스를 이용함으로써 얻은 정보 중 서비스에게 지적재산권이 귀속된 정보를 서비스의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제10조 (개인정보보호)</h2>
          <p className="text-foreground/80 leading-relaxed">
            서비스는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 서비스의 개인정보처리방침이 적용됩니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제11조 (분쟁해결)</h2>
          <ol className="list-decimal list-inside space-y-2 text-foreground/80">
            <li>서비스는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</li>
            <li>서비스와 이용자 간에 발생한 전자상거래 분쟁과 관련하여 이용자의 피해구제신청이 있는 경우에는 공정거래위원회 또는 시·도지사가 의뢰하는 분쟁조정기관의 조정에 따를 수 있습니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제12조 (재판권 및 준거법)</h2>
          <ol className="list-decimal list-inside space-y-2 text-foreground/80">
            <li>서비스와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 대한민국 법률을 적용합니다.</li>
            <li>서비스와 이용자 간에 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제기합니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">부칙</h2>
          <p className="text-foreground/80">본 약관은 2026년 2월 4일부터 시행합니다.</p>
        </section>
      </article>
    </div>
  );
}
