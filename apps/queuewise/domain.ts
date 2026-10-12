import { z } from "zod";
import {
  c,
  text,
  note,
  option,
  metric,
  move,
  type Project,
} from "../../src/contracts";
export const queuewise: Project = {
  id: "queuewise",
  name: "QueueWise",
  arabic: "دورك",
  kind: "web",
  color: "#245c49",
  mark: "01",
  tagline: c(
    "Less waiting. More living.",
    "وقت أقل في الانتظار، وقت أكتر للحياة.",
  ),
  problem: c(
    "A live service desk for small teams: check people in, call the next ticket, and track waiting time.",
    "مكتب خدمة للمشروعات الصغيرة: سجّل الوصول ونادِ على الدور التالي وتابع وقت الانتظار.",
  ),
  entity: c("tickets", "تذاكر"),
  createLabel: c("Check in a visitor", "تسجيل زائر"),
  fields: [
    { key: "name", label: c("Visitor name", "اسم الزائر"), required: true },
    {
      key: "service",
      label: c("Service", "الخدمة"),
      type: "select",
      options: [
        option("general", "General enquiry", "استفسار عام"),
        option("documents", "Documents", "مستندات"),
        option("support", "Support", "دعم"),
      ],
    },
    {
      key: "priority",
      label: c("Priority", "الأولوية"),
      type: "select",
      options: [
        option("standard", "Standard", "عادي"),
        option("assistance", "Needs assistance", "يحتاج مساعدة"),
      ],
    },
    { key: "notes", label: c("Notes", "ملاحظات"), type: "textarea" },
  ],
  schema: z
    .object({
      name: text,
      service: z.enum(["general", "documents", "support"]),
      priority: z.enum(["standard", "assistance"]),
      notes: note,
    })
    .strict(),
  create: (d, now) => ({
    ...d,
    status: "waiting",
    arrivedAt: now.toISOString(),
  }),
  act: (d, a, _p, now) =>
    move(
      d,
      a,
      {
        "waiting:call": "serving",
        "waiting:cancel": "cancelled",
        "serving:complete": "completed",
        "serving:cancel": "cancelled",
      },
      now,
    ),
  actions: [
    {
      id: "call",
      label: c("Call visitor", "نداء الزائر"),
      when: (d) => d.status === "waiting",
    },
    {
      id: "complete",
      label: c("Complete service", "إنهاء الخدمة"),
      when: (d) => d.status === "serving",
    },
    {
      id: "cancel",
      label: c("Cancel ticket", "إلغاء التذكرة"),
      when: (d) => ["waiting", "serving"].includes(d.status),
    },
  ],
  title: (d) => d.name,
  subtitle: (d, l) =>
    ({
      general: c("General enquiry", "استفسار عام"),
      documents: c("Documents", "مستندات"),
      support: c("Support", "دعم"),
    })[d.service as "general"]?.[l] ?? d.service,
  status: (d) => d.status,
  statuses: {
    waiting: c("Waiting", "في الانتظار"),
    serving: c("Being served", "جاري الخدمة"),
    completed: c("Completed", "مكتمل"),
    cancelled: c("Cancelled", "ملغي"),
  },
  metrics: (rows, now, lang = "en") => {
    const waiting = rows.filter((r) => r.data.status === "waiting");
    return [
      metric(
        "In the queue",
        "في الطابور",
        waiting.length,
        "Ready for the next call",
        "جاهز للنداء التالي",
      ),
      metric(
        "At the desk",
        "على المكتب",
        rows.filter((r) => r.data.status === "serving").length,
        "Service in progress",
        "الخدمة جارية",
      ),
      metric(
        "Longest wait",
        "أطول انتظار",
        `${Math.max(0, ...waiting.map((r) => Math.floor((+now - Date.parse(r.data.arrivedAt)) / 60000)))} ${lang === "ar" ? "دقيقة" : "min"}`,
        "Based on check-in time",
        "من وقت تسجيل الوصول",
      ),
    ];
  },
  seed: (now) => [
    {
      name: "Nour Hassan",
      service: "documents",
      priority: "standard",
      notes: "",
      status: "waiting",
      arrivedAt: new Date(+now - 720000).toISOString(),
    },
    {
      name: "Omar Adel",
      service: "general",
      priority: "assistance",
      notes: "Step-free desk requested",
      status: "waiting",
      arrivedAt: new Date(+now - 300000).toISOString(),
    },
    {
      name: "Mariam Ali",
      service: "support",
      priority: "standard",
      notes: "",
      status: "serving",
      arrivedAt: new Date(+now - 1200000).toISOString(),
    },
  ],
};
