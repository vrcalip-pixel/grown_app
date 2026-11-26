"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { StringKey } from "@/i18n/strings";
import type { PreviewPack } from "@/pack/schema";
import { Page } from "./Page";

/**
 * The pages around the guides: home, the category pages, the housing previews
 * and the sources page. Layout and wording follow the author's FYI build.
 */

const svg = (d: ReactNode, size = 22) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

const ICON = {
  car: (
    <>
      <path d="M5 16l1.5-5h11L19 16" />
      <rect x="3" y="16" width="18" height="3" rx="1" />
    </>
  ),
  home: (
    <>
      <path d="M3 11l9-7 9 7v9H3z" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  medical: (
    <>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.600-7 10-7 10z" />
      <path d="M8 12h2l1-2 2 4 1-2h2" />
    </>
  ),
  work: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4M10 12h5M10 16h5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" />
      <path d="M9.500 12l2 2 3.500-4" />
    </>
  ),
  back: <path d="M15 6l-6 6 6 6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};

function Crumb({ href, label }: { href: string; label: string }) {
  return (
    <Link className="crumb" href={href}>
      {svg(ICON.back, 16)}
      {label}
    </Link>
  );
}

function CatCard({
  href,
  icon,
  tone,
  badge,
  title,
  blurb,
}: {
  href?: string;
  icon: ReactNode;
  tone: string;
  badge: string;
  title: string;
  blurb: string;
}) {
  const inner = (
    <>
      <span className="cattop">
        <span className={`cattile ${tone}`}>{svg(icon, 24)}</span>
        <span className="badge">{badge}</span>
      </span>
      <strong>{title}</strong>
      <span className="catblurb">{blurb}</span>
    </>
  );
  return href ? (
    <Link className="catcard" href={href}>
      {inner}
    </Link>
  ) : (
    <div className="catcard off" aria-disabled="true">
      {inner}
    </div>
  );
}

export function HomeView() {
  const { t } = useLanguage();
  return (
    <Page>
      <h1 data-focus tabIndex={-1}>
        {t("homeTitle")}
      </h1>
      <p>{t("homeIntro")}</p>
      <div className="trust">
        <strong>{t("trustLead")}</strong>
        <ul>
          {(["trust1", "trust2", "trust3", "trust4", "trust5"] as StringKey[]).map((k) => (
            <li key={k}>{t(k)}</li>
          ))}
        </ul>
      </div>
      <div className="catgrid">
        <CatCard href="/auto" icon={ICON.car} tone="blue" badge={t("badgeLive")} title={t("catAuto")} blurb={t("catAutoBlurb")} />
        <CatCard href="/residences" icon={ICON.home} tone="green" badge={t("badgePreviews")} title={t("catResidences")} blurb={t("catResidencesBlurb")} />
        <CatCard icon={ICON.medical} tone="grey" badge={t("comingNext")} title={t("catMedical")} blurb={t("catMedicalBlurb")} />
        <CatCard icon={ICON.work} tone="grey" badge={t("comingNext")} title={t("catWork")} blurb={t("catWorkBlurb")} />
      </div>
    </Page>
  );
}

export function AutoView() {
  const { t } = useLanguage();
  return (
    <Page>
      <Crumb href="/" label={t("home")} />
      <div className="eyebrow caps">{t("autoEyebrow")}</div>
      <h1 data-focus tabIndex={-1}>
        {t("autoTitle")}
      </h1>
      <p>{t("autoIntro")}</p>

      <Link className="listcard live" href="/auto/traffic-ticket">
        <span className="listtop">
          <span className="cattile blue small">{svg(ICON.car)}</span>
          <span>
            <span className="badge">{t("liveGuide")}</span>
            <strong>{t("ticketTitle")}</strong>
          </span>
        </span>
        <span className="catblurb">{t("ticketBlurb")}</span>
        <span className="listfoot">
          <span className="muted">{t("ticketMeta")}</span>
          <span className="btn">
            {t("startGuide")} {svg(ICON.arrow, 16)}
          </span>
        </span>
      </Link>

      {(
        [
          ["dmvTitle", "dmvBlurb", ICON.doc],
          ["smogTitle", "smogBlurb", ICON.shield],
        ] as [StringKey, StringKey, ReactNode][]
      ).map(([title, blurb, icon]) => (
        <div className="listcard off" aria-disabled="true" key={title}>
          <span className="listtop">
            <span className="cattile grey small">{svg(icon)}</span>
            <span>
              <span className="badge">{t("comingNext")}</span>
              <strong>{t(title)}</strong>
            </span>
          </span>
          <span className="catblurb">{t(blurb)}</span>
        </div>
      ))}
    </Page>
  );
}

/** The ticket guide's rules are verified in English only, so other languages get an honest note. */
export function GuideLanguageNote() {
  const { lang, t } = useLanguage();
  if (lang === "en") return null;
  return (
    <div className="langnote" role="note">
      {t("guideEnglishOnly")}
    </div>
  );
}

export function ResidencesView({ previews }: { previews: PreviewPack[] }) {
  const { t, tr } = useLanguage();
  return (
    <Page>
      <Crumb href="/" label={t("home")} />
      <div className="eyebrow caps">{t("resEyebrow")}</div>
      <span className="badge warm">{t("previewTag")}</span>
      <h1 data-focus tabIndex={-1}>
        {t("resTitle")}
      </h1>
      <p>{t("resIntro")}</p>
      <p className="muted">{t("resNote")}</p>
      {previews.map((p) => (
        <Link className="listcard" href={`/residences/${p.id}`} key={p.id}>
          <span className="listtop">
            <span className="cattile green small">{svg(ICON.home)}</span>
            <span>
              <span className="badge warm">{t("previewTag")}</span>
              <strong>{tr(p.card.title)}</strong>
            </span>
          </span>
          <span className="catblurb">{tr(p.card.blurb)}</span>
        </Link>
      ))}
    </Page>
  );
}

export function PreviewView({ preview }: { preview: PreviewPack }) {
  const { t, tr } = useLanguage();
  const questions: StringKey[] = ["q1", "q2", "q3", "q4", "q5", "q6"];
  return (
    <Page>
      <Crumb href="/residences" label={t("allPreviews")} />
      <span className="badge warm">{t("previewTag")}</span>
      <h1 data-focus tabIndex={-1}>
        {tr(preview.title)}
      </h1>
      <p>{tr(preview.intro)}</p>
      <div className="card">
        <h2 className="label">{t("howItWorks")}</h2>
        <p className="muted">{t("sixQuestions")}</p>
        {questions.map((q, i) => (
          <div className="opt" key={q}>
            <b>
              {i + 1}. {t(q)}
            </b>
            <p style={{ margin: "6px 0 0" }}>{tr(preview.answers[i])}</p>
          </div>
        ))}
      </div>
      <div className="card warn">
        <p className="tight">{t("previewNote")}</p>
      </div>
    </Page>
  );
}

export function SourcesView({ sources, checkedIso }: { sources: { title: string; url: string; covers: string }[]; checkedIso: string }) {
  const { lang, t } = useLanguage();
  const date = new Date(`${checkedIso}T00:00:00Z`).toLocaleDateString(lang === "es" ? "es-US" : lang === "km" ? "km" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return (
    <Page>
      <Crumb href="/" label={t("home")} />
      <div className="eyebrow caps">{t("srcEyebrow")}</div>
      <h1 data-focus tabIndex={-1}>
        {t("srcTitle")}
      </h1>
      <p>{t("srcIntro")}</p>
      <div className="card">
        <p style={{ fontWeight: 700 }}>{t("srcChecked", { date })}</p>
        <p className="muted">{t("srcBody")}</p>
        <ul className="src">
          {sources.map((s) => (
            <li key={s.url}>
              <a href={s.url}>{s.title}</a>
              {lang === "en" && <span>{s.covers}</span>}
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
}
