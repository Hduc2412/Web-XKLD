"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ErrorBanner, PageHeader } from "@/components/admin/AdminUI";
import {
  CandidateDocument,
  CandidateProfile,
  ProfileCell,
  managementApi,
} from "@/lib/managementApi";

const FIELD_LABELS: Record<string, string> = {
  full_name: "Họ và tên",
  birth_year: "Năm sinh",
  gender: "Giới tính",
  education_level: "Bằng cấp",
  major: "Chuyên ngành",
  japanese_level: "Trình độ tiếng Nhật",
  experience_years: "Số năm kinh nghiệm",
  care_experience: "Kinh nghiệm chăm sóc",
  phone: "Số điện thoại",
  desired_prefecture: "Tỉnh mong muốn",
  desired_region_group: "Vùng mong muốn",
  desired_employer_type: "Loại cơ sở mong muốn",
  salary_expectation_jpy: "Lương mong muốn",
  budget_vnd: "Ngân sách",
  reason: "Lý do tham gia",
  notes: "Ghi chú",
};

const SOURCE_LABELS: Record<string, string> = {
  staff: "Nhân viên nhập",
  user_confirmed: "Ứng viên xác nhận",
  cv: "Đọc từ CV",
  chat: "Nghe trong hội thoại",
};

const SOURCE_STYLES: Record<string, string> = {
  staff: "bg-slate-100 text-slate-700 ring-slate-200",
  user_confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cv: "bg-sky-50 text-sky-700 ring-sky-200",
  chat: "bg-amber-50 text-amber-700 ring-amber-200",
};

const DOCUMENT_STATUS: Record<string, string> = {
  received: "Đã nhận, đang xử lý",
  extracted: "Đã đọc xong",
  unreadable: "Bản scan, không đọc được chữ",
  failed: "Đọc hỏng",
};

function display(cell: ProfileCell, label: string | null | undefined): string {
  if (label) return label;
  if (typeof cell.value === "boolean") return cell.value ? "Có" : "Không";
  if (cell.value === null || cell.value === undefined) return "—";
  return String(cell.value);
}

function CellRow({
  fieldKey,
  cell,
  label,
}: {
  fieldKey: string;
  cell: ProfileCell;
  label: string | null | undefined;
}) {
  return (
    <div className="border-b border-slate-100 px-4 py-3 last:border-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-48 shrink-0 text-xs uppercase tracking-wide text-slate-400">
          {FIELD_LABELS[fieldKey] || fieldKey}
        </span>
        <span className="font-medium text-slate-800">{display(cell, label)}</span>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
            SOURCE_STYLES[cell.source] || "bg-slate-50 text-slate-600 ring-slate-200"
          }`}
        >
          {SOURCE_LABELS[cell.source] || cell.source}
        </span>
      </div>
      {cell.evidence && (
        <p className="mt-2 border-l-2 border-sky-200 pl-3 text-xs italic leading-5 text-slate-500">
          “{cell.evidence}”
        </p>
      )}
    </div>
  );
}

export default function CandidateProfileDetailPage({
  params,
}: {
  params: { code: string };
}) {
  const { code } = params;
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      managementApi.candidateProfile(code),
      // Hồ sơ có thể không đến từ CV nào cả (ứng viên tự khai). Thiếu tài liệu
      // không phải lỗi, nên nhánh này không được làm hỏng cả trang.
      managementApi.profileDocuments(code).catch(() => [] as CandidateDocument[]),
    ])
      .then(([loadedProfile, loadedDocuments]) => {
        setProfile(loadedProfile);
        setDocuments(loadedDocuments);
      })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [code]);

  useEffect(load, [load]);

  if (loading) return <p className="text-sm text-slate-400">Đang tải…</p>;
  if (error) return <ErrorBanner message={error} />;
  if (!profile) return <ErrorBanner message="Không tìm thấy hồ sơ." />;

  const fieldKeys = Object.keys(profile.fields || {});
  const preferenceKeys = Object.keys(profile.preferences || {});

  return (
    <>
      <PageHeader
        eyebrow="Ứng viên"
        title={`Hồ sơ ${profile.code}`}
        description="Mỗi giá trị đều mang nguồn của nó. Giá trị đọc từ CV kèm luôn đoạn trích nguyên văn trong tài liệu gốc, để kiểm chứng được mà không phải mở file ra dò lại."
        action={
          <Link
            href="/admin/profiles"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            ← Danh sách
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <h3 className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              Năng lực — dùng cho điều kiện bắt buộc
            </h3>
            {fieldKeys.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-400">Chưa có thông tin nào.</p>
            ) : (
              fieldKeys.map((key) => (
                <CellRow
                  key={key}
                  fieldKey={key}
                  cell={profile.fields[key]}
                  label={profile.labels?.[key]}
                />
              ))
            )}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <h3 className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              Nguyện vọng — chỉ dùng để xếp hạng, không loại đơn
            </h3>
            {preferenceKeys.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-400">
                Ứng viên chưa nêu nguyện vọng nào.
              </p>
            ) : (
              preferenceKeys.map((key) => (
                <CellRow
                  key={key}
                  fieldKey={key}
                  cell={profile.preferences[key]}
                  label={profile.labels?.[key]}
                />
              ))
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Tình trạng</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">Trạng thái</dt>
                <dd className="text-slate-700">
                  {profile.status === "confirmed"
                    ? "Đã xác nhận"
                    : "Chờ ứng viên xác nhận"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">Người phụ trách</dt>
                <dd className="text-slate-700">{profile.assigned_to || "Chưa giao"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">Phiên bản</dt>
                <dd className="text-slate-700">{profile.version}</dd>
              </div>
              {profile.missing_required?.length > 0 && (
                <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Còn thiếu:{" "}
                  {profile.missing_required
                    .map((key) => FIELD_LABELS[key] || key)
                    .join(", ")}
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">
              Tài liệu ứng viên gửi
            </h3>
            {documents.length === 0 ? (
              <p className="text-sm text-slate-400">
                Hồ sơ này không đến từ file nào — ứng viên tự khai thông tin.
              </p>
            ) : (
              <ul className="space-y-3">
                {documents.map((document) => (
                  <li
                    key={document.code}
                    className="rounded-xl border border-slate-100 p-3"
                  >
                    <p className="text-sm font-medium text-slate-700">
                      {document.filename}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {document.code} ·{" "}
                      {Math.round(document.size_bytes / 1024).toLocaleString("vi-VN")} KB ·{" "}
                      {DOCUMENT_STATUS[document.status] || document.status}
                    </p>
                    {Object.keys(document.rejected || {}).length > 0 && (
                      <div className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-700">
                        Không nhận:{" "}
                        {Object.entries(document.rejected)
                          .map(
                            ([key, reason]) =>
                              `${FIELD_LABELS[key] || key} (${reason})`,
                          )
                          .join("; ")}
                      </div>
                    )}
                    {document.error && (
                      <p className="mt-2 text-xs text-red-600">{document.error}</p>
                    )}
                    <a
                      href={managementApi.documentOriginalUrl(document.code)}
                      className="mt-2 inline-block text-xs font-medium text-[#cb1d1e] hover:underline"
                    >
                      Tải bản gốc ↓
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
