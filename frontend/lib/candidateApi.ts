/**
 * Luồng tư vấn của ứng viên, gọi từ trình duyệt.
 *
 * Khác `publicApi.ts` ở chỗ file đó chạy trên máy chủ để dựng sẵn trang đơn hàng,
 * còn file này chạy trong trình duyệt và có trạng thái theo từng người dùng.
 *
 * **Mã phiên là của riêng luồng này.** Không đọc ké phiên của khung chat: hai phần
 * do hai người phát triển song song, đọc ké là bản demo gãy mỗi lần bên kia sửa
 * widget. Mã phiên sinh một lần rồi nằm lại trong trình duyệt, nên ứng viên đóng
 * tab mở lại vẫn thấy hồ sơ mình vừa khai.
 */
import { BACKEND_PUBLIC_URL } from "./publicApi";

const SESSION_KEY = "xkld-candidate-session";

/** Một ô dữ liệu trong hồ sơ. Giá trị nào cũng mang theo nguồn của nó. */
export interface ProfileCell<T = unknown> {
  value: T;
  source: "staff" | "user_confirmed" | "cv" | "chat";
  confidence: number;
  evidence: string | null;
}

export interface CandidateProfile {
  code: string;
  session_id: string;
  status: string;
  version: number;
  fields: Record<string, ProfileCell>;
  preferences: Record<string, ProfileCell>;
  labels: Record<string, string | null>;
  missing_required: string[];
  confirmed_at: string | null;
}

export interface CatalogOption {
  code: string;
  label: string;
}

export interface PrefectureOption extends CatalogOption {
  region_group: string;
}

export interface ProfileMeta {
  japanese_levels: CatalogOption[];
  education_levels: CatalogOption[];
  employer_types: CatalogOption[];
  regions: CatalogOption[];
  prefectures: PrefectureOption[];
  genders: CatalogOption[];
  required_fields: string[];
}

export interface CriterionRow {
  key: string;
  label: string;
  requirement_text: string;
  candidate_text: string;
  result: "DAT" | "KHONG_DAT" | "CHUA_RO";
  missing_field: string | null;
}

export interface SoftRow {
  key: string;
  label: string;
  requirement_text: string;
  candidate_text: string;
  points: number;
  max_points: number;
}

export interface MatchItem {
  code: string;
  title: string;
  employer_name: string;
  prefecture: string;
  employer_type: string;
  program: string;
  deadline: string;
  eligible: boolean;
  score: number;
  rank: number | null;
  hard_rows: CriterionRow[];
  soft_rows: SoftRow[];
  gaps: string[];
  labels: Record<string, string | null>;
  explanation_text: string;
  explanation_block: string;
}

export interface MatchResult {
  log_code: string;
  as_of: string;
  total_considered: number;
  eligible_count: number;
  missing_info: string[];
  matches: MatchItem[];
  disclaimer: string;
  from_cache: boolean;
}

/** Giá trị người dùng gõ vào biểu mẫu, trước khi gửi đi. */
export interface ProfileFormValues {
  full_name?: string;
  birth_year?: number;
  gender?: string;
  education_level?: string;
  major?: string;
  japanese_level?: string;
  experience_years?: number;
  care_experience?: boolean;
  phone?: string;
}

export interface PreferenceFormValues {
  desired_prefecture?: string;
  desired_employer_type?: string;
  salary_expectation_jpy?: number;
  budget_vnd?: number;
  reason?: string;
}

/**
 * Lỗi có thông điệp đọc được. Backend trả `detail` là chuỗi, hoặc là đối tượng
 * khi cần kèm danh sách trường còn thiếu, nên gom cả hai về một chỗ.
 */
export class ApiError extends Error {
  status: number;
  missing: string[];

  constructor(status: number, message: string, missing: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.missing = missing;
  }
}

/** Mã phiên của trình duyệt này, sinh lần đầu rồi dùng lại mãi. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let value = window.localStorage.getItem(SESSION_KEY);
  if (!value) {
    value = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
    window.localStorage.setItem(SESSION_KEY, value);
  }
  return value;
}

/** Quên hồ sơ cũ và bắt đầu lại từ đầu. */
export function resetSession(): string {
  if (typeof window === "undefined") return "";
  window.localStorage.removeItem(SESSION_KEY);
  return getSessionId();
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BACKEND_PUBLIC_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
  } catch {
    throw new ApiError(
      0,
      "Không kết nối được máy chủ. Bạn kiểm tra lại mạng rồi thử lần nữa nhé.",
    );
  }

  if (response.ok) {
    return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
  }

  const payload = await response.json().catch(() => null);
  const detail = payload?.detail;
  if (detail && typeof detail === "object") {
    throw new ApiError(
      response.status,
      detail.message ?? "Hồ sơ còn thiếu thông tin.",
      detail.missing ?? [],
    );
  }
  throw new ApiError(
    response.status,
    typeof detail === "string" ? detail : "Có lỗi xảy ra, bạn thử lại giúp em.",
  );
}

/** Bỏ ô trống trước khi gửi: trường vắng mặt nghĩa là chưa rõ, không phải rỗng. */
function clean<T extends object>(values: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== undefined && value !== "" && value !== null,
    ),
  ) as Partial<T>;
}

export function fetchProfileMeta(): Promise<ProfileMeta> {
  return request<ProfileMeta>("/public/profiles/meta");
}

export async function fetchProfile(
  sessionId: string,
): Promise<CandidateProfile | null> {
  try {
    return await request<CandidateProfile>(
      `/public/profiles/${encodeURIComponent(sessionId)}`,
    );
  } catch (error) {
    // Chưa có hồ sơ là trạng thái bình thường của người vào lần đầu, không phải lỗi.
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function createProfile(
  sessionId: string,
  fields: ProfileFormValues,
  preferences: PreferenceFormValues,
): Promise<CandidateProfile> {
  return request<CandidateProfile>("/public/profiles", {
    method: "POST",
    body: JSON.stringify({
      session_id: sessionId,
      mode: "manual",
      fields: clean(fields),
      preferences: clean(preferences),
    }),
  });
}

export function updateProfile(
  sessionId: string,
  fields: ProfileFormValues,
  preferences: PreferenceFormValues,
  expectedVersion?: number,
): Promise<CandidateProfile> {
  return request<CandidateProfile>(
    `/public/profiles/${encodeURIComponent(sessionId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        fields: clean(fields),
        preferences: clean(preferences),
        ...(expectedVersion ? { expected_version: expectedVersion } : {}),
      }),
    },
  );
}

export function confirmProfile(sessionId: string): Promise<CandidateProfile> {
  return request<CandidateProfile>(
    `/public/profiles/${encodeURIComponent(sessionId)}/confirm`,
    { method: "POST" },
  );
}

export function fetchMatches(
  sessionId: string,
  options: { limit?: number; refresh?: boolean } = {},
): Promise<MatchResult> {
  const params = new URLSearchParams();
  if (options.limit) params.set("limit", String(options.limit));
  if (options.refresh) params.set("refresh", "true");
  const query = params.toString();
  return request<MatchResult>(
    `/public/matches/${encodeURIComponent(sessionId)}${query ? `?${query}` : ""}`,
  );
}

/** Đọc giá trị ra khỏi ô `{value, source}` để đổ ngược vào biểu mẫu. */
export function valueOf<T>(
  section: Record<string, ProfileCell> | undefined,
  key: string,
): T | undefined {
  const cell = section?.[key];
  return cell === undefined ? undefined : (cell.value as T);
}
