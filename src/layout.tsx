import type { ReactNode } from "react";
import {
  UsersThree,
  ListBullets,
  CalendarBlank,
  HandHeart,
  Package,
  ChartBar,
  Cards,
} from "@phosphor-icons/react";
import type { Lang } from "./contracts";
export function ProductLayout({
  brand,
  utilities,
  lang,
  children,
}: {
  brand: ReactNode;
  utilities: ReactNode;
  lang: Lang;
  children: ReactNode;
}) {
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);
  return (
    <div className="queue-shell">
      <header className="queue-rail">
        {brand}
        <nav>
          <a href="#overview">
            <UsersThree size={23} />
            <span>{t("Live desk", "الاستقبال")}</span>
          </a>
          <a href="#records">
            <ListBullets size={23} />
            <span>{t("Visitors", "الزوار")}</span>
          </a>
        </nav>
        {utilities}
      </header>
      <main className="identity-main">{children}</main>
    </div>
  );
}
