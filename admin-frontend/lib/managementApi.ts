const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface Overview {
  appointments_total: number;
  appointments_pending: number;
  appointments_confirmed: number;
  appointments_completed: number;
  leads_total: number;
  leads_new: number;
  conversations_total: number;
  messages_total: number;
  notifications_unread: number;
  staff_active: number;
}

export interface Appointment {
  appointment_code: string;
  customer_name: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  confirmed_by?: string | null;
  assigned_to?: string | null;
  assigned_name?: string | null;
  assigned_by?: string | null;
  assigned_at?: string | null;
  result_note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentEvent {
  appointment_code: string;
  action: "created" | "assigned" | "status_changed" | "rescheduled";
  actor_name: string;
  actor_email?: string | null;
  old_status?: string | null;
  new_status?: string | null;
  note?: string | null;
  details: {
    previous_assigned_to?: string | null;
    assigned_to?: string;
    assigned_name?: string;
    previous_date?: string;
    previous_time?: string;
    appointment_date?: string;
    appointment_time?: string;
  };
  created_at: string;
}

export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  unreachable: number;
  cancelled: number;
  confirmation_rate: number;
  completion_rate: number;
  unreachable_rate: number;
  cancellation_rate: number;
}

export interface Notification {
  appointment_code: string;
  customer_name: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  is_read: boolean;
  created_at: string;
}

export interface ManagedLead {
  lead_code: string;
  customer_name: string;
  phone: string;
  source: string;
  status: string;
  assigned_to?: string | null;
  note?: string | null;
  created_at: string;
}

export interface StaffUser {
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export interface RecruitmentApplication {
  application_code: string;
  lead_code: string;
  customer_name: string;
  phone: string;
  status: string;
  is_active: boolean;
  assigned_to?: string | null;
  destination?: string | null;
  japanese_level?: string | null;
  qualification?: string | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  action: string;
  outcome: "success" | "failure";
  actor_email?: string | null;
  actor_name?: string | null;
  actor_role?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  ip_address?: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface Conversation {
  session_id: string;
  message_count: number;
  last_intent?: string;
  created_at: string;
  last_active: string;
  booking_step?: string | null;
  latest_message?: { role: string; content: string };
}

export interface ConversationMessage {
  role: string;
  content: string;
  intent?: string;
  created_at: string;
}

export interface CustomerJourneyConversation extends Conversation {
  messages: ConversationMessage[];
}

export interface CustomerJourney {
  lead: ManagedLead;
  applications: RecruitmentApplication[];
  appointments: Appointment[];
  conversations: CustomerJourneyConversation[];
  events: {
    applications: Array<Record<string, unknown>>;
    appointments: AppointmentEvent[];
  };
}

/** Nhãn tiếng Việt do backend trả kèm, để giao diện không giữ bản sao bảng danh mục. */
export interface JobOrderLabels {
  status: string | null;
  employer_type: string | null;
  program: string | null;
  region_group: string | null;
  japanese_required: string | null;
  education_required: string | null;
  gender_pref: string | null;
}

/** Điều kiện bắt buộc — dùng để loại ứng viên khi đối chiếu. */
export interface JobOrderRequirements {
  japanese_required: string;
  education_required: string | null;
  experience_min: number;
  age_min: number | null;
  age_max: number | null;
  gender_pref: string;
}

/** Thông tin tham khảo — chỉ để hiển thị và xếp hạng, không loại ai. */
export interface JobOrderReference {
  salary_min: number | null;
  salary_max: number | null;
  allowances: string[];
  cost_total_vnd: number | null;
  interview_date: string | null;
  departure_expected: string | null;
  highlights: string[];
}

export interface JobOrder {
  code: string;
  title: string;
  employer_name: string;
  employer_type: string;
  program: string;
  prefecture: string;
  region_group: string | null;
  city: string | null;
  quota: number;
  hired_count: number;
  deadline: string;
  requirements: JobOrderRequirements;
  reference: JobOrderReference;
  description: string | null;
  internal_note: string | null;
  status: string;
  published: boolean;
  labels: JobOrderLabels;
  visible_publicly?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CatalogOption {
  code: string;
  label: string;
}

export interface PrefectureOption extends CatalogOption {
  region_group: string;
}

export interface JobOrderMeta {
  employer_types: CatalogOption[];
  programs: CatalogOption[];
  japanese_levels: CatalogOption[];
  education_levels: CatalogOption[];
  gender_prefs: CatalogOption[];
  statuses: CatalogOption[];
  transitions: Record<string, string[]>;
  regions: CatalogOption[];
  prefectures: PrefectureOption[];
}

export interface JobOrderEvent {
  job_order_code: string;
  action: string;
  actor_email: string | null;
  actor_name: string | null;
  old_status: string | null;
  new_status: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface JobOrderImportRow {
  row_number: number;
  action: "create" | "update" | "error";
  code: string | null;
  title: string | null;
  errors: string[];
  data: Record<string, unknown>;
}

export interface JobOrderImportResult {
  summary: { total: number; create: number; update: number; error: number };
  missing_columns: string[];
  rows: JobOrderImportRow[];
  dry_run: boolean;
  applied?: {
    created: number;
    updated: number;
    failed: { row_number: number; reason: string }[];
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== "undefined") window.location.href = "/login";
    }
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.detail || "Không thể kết nối hệ thống.");
  }
  return response.json();
}

/**
 * Gửi biểu mẫu có file. Khác `request` ở chỗ **không** đặt `Content-Type`:
 * trình duyệt phải tự sinh header multipart kèm chuỗi phân tách, đặt tay vào là
 * phía máy chủ không tách được file ra khỏi phần dữ liệu.
 */
async function requestForm<T>(path: string, body: FormData): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    body,
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
    }
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.detail || "Không thể tải file lên hệ thống.");
  }
  return response.json();
}

export const managementApi = {
  overview: () => request<Overview>("/management/overview"),
  appointments: (filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    assignedTo?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.dateFrom) params.set("date_from", filters.dateFrom);
    if (filters?.dateTo) params.set("date_to", filters.dateTo);
    if (filters?.assignedTo) params.set("assigned_to", filters.assignedTo);
    const query = params.toString();
    return request<Appointment[]>(`/appointments${query ? `?${query}` : ""}`);
  },
  appointmentStats: (filters?: {
    dateFrom?: string;
    dateTo?: string;
    assignedTo?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.dateFrom) params.set("date_from", filters.dateFrom);
    if (filters?.dateTo) params.set("date_to", filters.dateTo);
    if (filters?.assignedTo) params.set("assigned_to", filters.assignedTo);
    const query = params.toString();
    return request<AppointmentStats>(`/appointments/stats${query ? `?${query}` : ""}`);
  },
  updateAppointment: (
    code: string,
    status: string,
    resultNote?: string,
  ) =>
    request<Appointment>(`/appointments/${code}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        result_note: resultNote || null,
      }),
    }),
  appointmentAssignees: () =>
    request<StaffUser[]>("/appointments/assignees"),
  assignAppointment: (code: string, assignedTo: string) =>
    request<Appointment>(`/appointments/${code}/assignment`, {
      method: "PATCH",
      body: JSON.stringify({ assigned_to: assignedTo }),
    }),
  appointmentEvents: (code: string) =>
    request<AppointmentEvent[]>(`/appointments/${code}/events`),
  rescheduleAppointment: (
    code: string,
    appointmentDate: string,
    appointmentTime: string,
    note?: string,
  ) =>
    request<Appointment>(`/appointments/${code}/reschedule`, {
      method: "PATCH",
      body: JSON.stringify({
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        note: note || null,
      }),
    }),
  notifications: (unreadOnly = false) =>
    request<Notification[]>(
      `/notifications${unreadOnly ? "?unread_only=true" : ""}`,
    ),
  markNotificationRead: (code: string) =>
    request(`/notifications/${code}/read`, { method: "PATCH" }),
  leads: () => request<ManagedLead[]>("/management/leads"),
  createLead: (data: {
    customer_name: string;
    phone: string;
    source: string;
    assigned_to?: string;
  }) =>
    request<ManagedLead>("/management/leads", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateLead: (code: string, data: Partial<ManagedLead>) =>
    request<ManagedLead>(`/management/leads/${code}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  customerJourney: (code: string) =>
    request<CustomerJourney>(
      `/management/leads/${encodeURIComponent(code)}/journey`,
    ),
  applications: (filters?: { status?: string; activeOnly?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.activeOnly) params.set("active_only", "true");
    const query = params.toString();
    return request<RecruitmentApplication[]>(`/applications${query ? `?${query}` : ""}`);
  },
  createApplication: (data: {
    lead_code: string;
    assigned_to?: string;
    destination?: string;
    japanese_level?: string;
    qualification?: string;
    note?: string;
  }) =>
    request<RecruitmentApplication>("/applications", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateApplication: (code: string, data: Partial<RecruitmentApplication>) =>
    request<RecruitmentApplication>(`/applications/${code}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  conversations: () =>
    request<Conversation[]>("/management/conversations"),
  conversation: (sessionId: string) =>
    request<{ session_id: string; messages: ConversationMessage[] }>(
      `/management/conversations/${encodeURIComponent(sessionId)}`,
    ),
  users: () => request<StaffUser[]>("/management/users"),
  auditLogs: (filters?: {
    actorEmail?: string;
    action?: string;
    outcome?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.actorEmail) params.set("actor_email", filters.actorEmail);
    if (filters?.action) params.set("action", filters.action);
    if (filters?.outcome) params.set("outcome", filters.outcome);
    if (filters?.dateFrom) params.set("date_from", filters.dateFrom);
    if (filters?.dateTo) params.set("date_to", filters.dateTo);
    const query = params.toString();
    return request<AuditLog[]>(`/audit-logs${query ? `?${query}` : ""}`);
  },
  createUser: (data: {
    full_name: string;
    email: string;
    role: string;
    password: string;
  }) =>
    request<StaffUser>("/management/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUser: (email: string, data: Partial<StaffUser>) =>
    request<StaffUser>(`/management/users/${encodeURIComponent(email)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // --- Đơn tuyển dụng ---
  jobOrders: (filters?: {
    status?: string;
    published?: boolean;
    program?: string;
    employerType?: string;
    prefecture?: string;
    regionGroup?: string;
    japaneseRequired?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.published !== undefined) {
      params.set("published", String(filters.published));
    }
    if (filters?.program) params.set("program", filters.program);
    if (filters?.employerType) params.set("employer_type", filters.employerType);
    if (filters?.prefecture) params.set("prefecture", filters.prefecture);
    if (filters?.regionGroup) params.set("region_group", filters.regionGroup);
    if (filters?.japaneseRequired) {
      params.set("japanese_required", filters.japaneseRequired);
    }
    const query = params.toString();
    return request<JobOrder[]>(`/job-orders${query ? `?${query}` : ""}`);
  },
  jobOrder: (code: string) =>
    request<JobOrder>(`/job-orders/${encodeURIComponent(code)}`),
  jobOrderMeta: () => request<JobOrderMeta>("/job-orders/meta"),
  jobOrderEvents: (code: string) =>
    request<JobOrderEvent[]>(`/job-orders/${encodeURIComponent(code)}/events`),
  createJobOrder: (data: Record<string, unknown>) =>
    request<JobOrder>("/job-orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateJobOrder: (code: string, data: Record<string, unknown>) =>
    request<JobOrder>(`/job-orders/${encodeURIComponent(code)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  setJobOrderStatus: (code: string, status: string, note?: string) =>
    request<JobOrder>(`/job-orders/${encodeURIComponent(code)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, note: note || null }),
    }),
  setJobOrderPublished: (code: string, published: boolean) =>
    request<JobOrder>(`/job-orders/${encodeURIComponent(code)}/publish`, {
      method: "PATCH",
      body: JSON.stringify({ published }),
    }),
  deleteJobOrder: (code: string) =>
    request<void>(`/job-orders/${encodeURIComponent(code)}`, {
      method: "DELETE",
    }),
  importJobOrders: (file: File, dryRun: boolean) => {
    const body = new FormData();
    body.append("file", file);
    return requestForm<JobOrderImportResult>(
      `/job-orders/import?dry_run=${dryRun}`,
      body,
    );
  },
  jobOrderTemplateUrl: () => `${BACKEND_URL}/job-orders/import/template`,
};
