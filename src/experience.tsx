import { useState, type ReactNode } from "react";
import {
  Plus,
  Scales,
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  FolderOpen,
  FileText,
  Wrench,
  ShieldCheck,
  Package,
  Receipt,
  Cards,
  MapPin,
  Clock,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import {
  type Project,
  type Entry,
  type Lang,
  type Action,
  cash,
} from "./contracts";
import { Status, fmtDate } from "./components";
type Slots = {
  p: Project;
  now: Date;
  create: () => void;
  notices: ReactNode;
  metrics: ReactNode;
  features: ReactNode;
  records: ReactNode;
  lang: Lang;
};
type Props = {
  p: Project;
  rows: Entry[];
  lang: Lang;
  now: Date;
  busy: boolean;
  open: (e: Entry) => void;
  action: (e: Entry, a: Action) => void;
};
const words = (lang: Lang) => (en: string, ar: string) =>
  lang === "ar" ? ar : en;
function Title({ e, p, open }: Pick<Props, "p" | "open"> & { e: Entry }) {
  return (
    <button className="record-title" dir="auto" onClick={() => open(e)}>
      {p.title(e.data)}
      <ArrowUpRight size={17} />
    </button>
  );
}
function Next({ e, p, lang, busy, action }: Props & { e: Entry }) {
  const a = p.actions.find((a) => a.when(e.data));
  return a ? (
    <button
      className="secondary compact"
      disabled={busy}
      onClick={() => action(e, a)}
    >
      {a.label[lang]}
      <ArrowRight size={14} />
    </button>
  ) : null;
}
function Scene({ label }: { label: string }) {
  return (
    <figure className="brand-scene">
      <img src="/brand-scene.png" alt="" />
      <figcaption>{label}</figcaption>
    </figure>
  );
}

export function ProductComposition({
  p,
  now,
  create,
  notices,
  metrics,
  features,
  records,
  lang,
}: Slots) {
  const t = words(lang);
  return (
    <div className="experience">
      <div className="reception-top" id="overview">
        <div>
          <span className="overline">
            {t("RECEPTION / LIVE DESK", "الاستقبال / الخدمة المباشرة")}
          </span>
          <h1>{t("A smoother day.", "يوم أهدى.")}</h1>
        </div>
        <button className="primary" onClick={create}>
          <Plus />
          {p.createLabel[lang]}
        </button>
      </div>
      <div className="service-stage">{features}</div>
      <div className="queue-bottom">
        <div>{records}</div>
        <aside className="queue-summary">
          <h2>{t("At a glance", "نظرة سريعة")}</h2>
          {metrics}
          <Scene label={t("Room to breathe.", "مساحة لراحة أكتر.")} />
        </aside>
      </div>
      <div className="workspace-notes">{notices}</div>
    </div>
  );
}
export function ProductRecords(props: Props) {
  const { p, rows, lang, now, busy, open, action } = props;
  const t = words(lang);
  return (
    <div className="ticket-list">
      {rows.map((e, i) => (
        <article className="record-card arrival-ticket" key={e.id}>
          <div className="ticket-index">
            <small>{t("TICKET", "تذكرة")}</small>
            <strong>{String(i + 1).padStart(2, "0")}</strong>
          </div>
          <div className="ticket-person">
            <Title {...props} e={e} />
            <p>{p.subtitle(e.data, lang)}</p>
            <span>
              {e.data.priority === "assistance"
                ? t("Assistance requested", "يحتاج مساعدة")
                : t("Standard arrival", "وصول عادي")}
            </span>
          </div>
          <div className="ticket-wait">
            <Status project={p} entry={e} lang={lang} now={now} />
            <time>{fmtDate(e.data.arrivedAt, lang, true)}</time>
            <Next {...props} e={e} />
          </div>
        </article>
      ))}
    </div>
  );
}
