import { Button, Container } from "@/components/ui/primitives";
import AnimatedBackground from "@/components/site/AnimatedBackground";
import { COMPANY } from "@/content/site";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <AnimatedBackground variant="soft" />
      <Container className="relative py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">
          Không tìm thấy
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          Trang này không còn nữa
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">
          Có thể đơn hàng bạn tìm đã hết hạn nộp hoặc đã tuyển đủ người. Xem danh
          sách đơn đang tuyển, hoặc gọi {COMPANY.hotline} để được tư vấn đơn phù
          hợp.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/don-hang">Xem đơn đang tuyển</Button>
          <Button href="/" variant="outline">
            Về trang chủ
          </Button>
        </div>
      </Container>
    </section>
  );
}
