import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 pb-20">
      <div className="mb-6">
        <Link href="/login" className="text-primary hover:underline text-sm">
          ← 로그인으로 돌아가기
        </Link>
      </div>

      <article className="prose prose-slate max-w-none">
        <h1 className="text-3xl font-bold mb-6">개인정보 처리방침</h1>
        <p className="text-sm text-muted-foreground mb-8"><strong>시행일</strong>: 2026년 2월 4일</p>

        <p className="text-foreground/80 leading-relaxed mb-8">
          Voca App(이하 "서비스")은 개인정보보호법 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제1조 (개인정보의 처리목적)</h2>
          <p className="text-foreground/80 mb-4">서비스는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-foreground mb-2">1. 회원 가입 및 관리</h3>
              <p className="text-foreground/80">회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지 목적으로 개인정보를 처리합니다.</p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2">2. 서비스 제공</h3>
              <p className="text-foreground/80">학습 콘텐츠 제공, 학습 진도 관리, 맞춤형 서비스 제공을 목적으로 개인정보를 처리합니다.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제2조 (처리하는 개인정보 항목)</h2>
          <p className="text-foreground/80 mb-4">서비스는 다음의 개인정보 항목을 처리하고 있습니다.</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-foreground mb-2">1. 필수항목</h3>
              <ul className="list-disc list-inside text-foreground/80 space-y-1">
                <li>회원가입 시: 아이디, 비밀번호</li>
                <li>카카오 로그인 시: 카카오 계정 ID, 닉네임</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2">2. 자동 수집 항목</h3>
              <p className="text-foreground/80">서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제3조 (개인정보의 처리 및 보유기간)</h2>
          <ol className="list-decimal list-inside space-y-2 text-foreground/80">
            <li>서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</li>
            <li className="mt-4">각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li><strong>회원 정보</strong>: 회원 탈퇴 시까지</li>
                <li><strong>학습 기록</strong>: 회원 탈퇴 후 즉시 삭제</li>
                <li><strong>접속 로그</strong>: 최대 3개월</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제4조 (개인정보의 제3자 제공)</h2>
          <p className="text-foreground/80 leading-relaxed">
            서비스는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
          </p>
          <p className="text-foreground/80 mt-4 font-semibold">현재 서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제5조 (개인정보처리의 위탁)</h2>
          <p className="text-foreground/80 font-semibold">현재 서비스는 개인정보 처리업무를 외부에 위탁하지 않습니다.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제6조 (정보주체의 권리·의무 및 행사방법)</h2>
          <ol className="list-decimal list-inside space-y-3 text-foreground/80">
            <li>정보주체는 서비스에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리정지 요구</li>
              </ul>
            </li>
            <li>제1항에 따른 권리 행사는 서비스에 대해 서면, 전화, 전자우편 등을 통하여 하실 수 있으며 서비스는 이에 대해 지체없이 조치하겠습니다.</li>
            <li>정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 서비스는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제7조 (개인정보의 파기)</h2>
          <ol className="list-decimal list-inside space-y-3 text-foreground/80">
            <li>서비스는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</li>
            <li>개인정보 파기의 절차 및 방법은 다음과 같습니다.
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li><strong>파기절차</strong>: 불필요한 개인정보는 개인정보 보호책임자의 승인을 거쳐 파기합니다.</li>
                <li><strong>파기방법</strong>: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
              </ul>
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제8조 (개인정보의 안전성 확보조치)</h2>
          <p className="text-foreground/80 mb-4">서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
          <ol className="list-decimal list-inside space-y-2 text-foreground/80">
            <li><strong>관리적 조치</strong>: 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
            <li><strong>기술적 조치</strong>: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 개인정보의 암호화</li>
            <li><strong>물리적 조치</strong>: 전산실, 자료보관실 등의 접근통제</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제9조 (개인정보 자동 수집 장치의 설치·운영 및 거부)</h2>
          <ol className="list-decimal list-inside space-y-3 text-foreground/80">
            <li>서비스는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.</li>
            <li>쿠키는 웹사이트를 운영하는데 이용되는 서버(http)가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자들의 PC 컴퓨터내의 하드디스크에 저장되기도 합니다.</li>
            <li>이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서, 이용자는 웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수도 있습니다.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제10조 (개인정보 보호책임자)</h2>
          <p className="text-foreground/80 mb-4">
            서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <div className="bg-secondary p-4 rounded-lg">
            <p className="font-bold text-foreground">개인정보 보호책임자</p>
            <p className="text-foreground/80 mt-2">문의: whwkzzang@gmail.com</p>
          </div>
          <p className="text-foreground/80 mt-4">
            정보주체는 서비스의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다. 서비스는 정보주체의 문의에 대해 지체없이 답변 및 처리해드릴 것입니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">제11조 (개인정보 처리방침 변경)</h2>
          <p className="text-foreground/80 leading-relaxed">
            이 개인정보 처리방침은 2026년 2월 4일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">부칙</h2>
          <p className="text-foreground/80">본 방침은 2026년 2월 4일부터 시행합니다.</p>
        </section>
      </article>
    </div>
  );
}
