"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { PREVIEW_CATEGORIES } from "@/i18n/categories";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Lang, StringKey } from "@/i18n/strings";
import type { PreviewPack } from "@/pack/schema";
import { Page } from "./Page";

/**
 * The pages around the guides: home, the category pages, the previews and the
 * sources page. Layout and wording follow the author's FYI build.
 */

const svg = (d: ReactNode, size = 22) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

export const ICON = {
  // A car seen from the side: body, roof line and two wheels.
  car: (
    <>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.800-.7H5c-.6 0-1.100.4-1.400.9l-1.400 2.900A3.700 3.700 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
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
      <path d="M12 20s-7-4.400-7-10a4 4 0 0 1 7-2.500A4 4 0 0 1 19 10c0 5.600-7 10-7 10z" />
      <path d="M8 12h2l1-2 2 4 1-2h2" />
    </>
  ),
  // A dollar sign, drawn wider and with a heavier line than the outlined icons so it carries the same weight.
  dollar: (
    <g strokeWidth="2.8">
      <path d="M12 2v20" />
      <path d="M18 6H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H5.5" />
    </g>
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

const KHMER_DIGITS = "០១២៣៤៥៦៧៨៩";
const count = (n: number, lang: Lang) => (lang === "km" ? String(n).replace(/\d/g, (d) => KHMER_DIGITS[Number(d)]) : String(n));

function Crumb({ href, label }: { href: string; label: string }) {
  return (
    <Link className="crumb" href={href}>
      {svg(ICON.back, 16)}
      {label}
    </Link>
  );
}

/** A home card: the icon with a short list of what is inside, then the name and one reassuring line. No status tags: the pages inside say what is live and what is coming. */
function CatCard({ href, icon, tone, title, blurb, list }: { href: string; icon: ReactNode; tone: string; title: string; blurb: string; list: string }) {
  return (
    <Link className="catcard" href={href}>
      <span className="cattop">
        <span className={`cattile ${tone}`}>{svg(icon, 38)}</span>
        <span className="catlist">
          {list.split("|").map((item) => (
            <span key={item}>{item}</span>
          ))}
        </span>
      </span>
      <strong>{title}</strong>
      <span className="catblurb">{blurb}</span>
    </Link>
  );
}

export function HomeView() {
  const { t, tr } = useLanguage();
  return (
    <Page>
      <h1 data-focus tabIndex={-1}>
        {t("homeTitle")}
      </h1>
      <p>{t("homeIntro")}</p>
      <p className="cta">{t("homeCta")}</p>
      <div className="catgrid">
        <CatCard href="/car" icon={ICON.car} tone="blue" title={t("catAuto")} blurb={t("catAutoBlurb")} list={t("catAutoList")} />
        {Object.entries(PREVIEW_CATEGORIES).map(([id, c]) => (
          <CatCard
            key={id}
            href={`/${id}`}
            icon={ICON[c.icon]}
            tone={c.tone}
            title={tr(c.name)}
            blurb={tr(c.blurb)}
            list={tr(c.list)}
          />
        ))}
      </div>
    </Page>
  );
}

export function AutoView() {
  const { t } = useLanguage();
  return (
    <Page>
      <Crumb href="/" label={t("menuAll")} />
      <div className="eyebrow caps">{t("autoEyebrow")}</div>
      <h1 data-focus tabIndex={-1}>
        {t("autoTitle")}
      </h1>
      <p>{t("autoIntro")}</p>

      <Link className="listcard live" href="/car/traffic-ticket">
        <span className="listtop">
          <span className="cattile blue small">{svg(ICON.car, 32)}</span>
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
            <span className="cattile grey small">{svg(icon, 32)}</span>
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

interface GuideCard {
  id: string;
  live: boolean;
  title: { en: string; es?: string | null; km?: string | null };
  blurb: { en: string; es?: string | null; km?: string | null };
}

/** A category page: housing, health, or money. Live guides come with a start button; the rest open a preview. */
export function CategoryView({ category, guides }: { category: string; guides: GuideCard[] }) {
  const { t, tr } = useLanguage();
  const cat = PREVIEW_CATEGORIES[category];
  const anyLive = guides.some((g) => g.live);
  return (
    <Page>
      <Crumb href="/" label={t("menuAll")} />
      <div className="eyebrow caps">{tr(cat.eyebrow)}</div>
      {!anyLive && <span className="badge warm">{t("previewTag")}</span>}
      <h1 data-focus tabIndex={-1}>
        {tr(cat.title)}
      </h1>
      <p>{tr(cat.intro)}</p>
      <p className="muted">{t(anyLive ? "mixedNote" : "resNote")}</p>
      {guides.map((g) =>
        g.live ? (
          <Link className="listcard live" href={`/${category}/${g.id}`} key={g.id}>
            <span className="listtop">
              <span className={`cattile ${cat.tone} small`}>{svg(ICON[cat.icon], 32)}</span>
              <span>
                <span className="badge">{t("liveGuide")}</span>
                <strong>{tr(g.title)}</strong>
              </span>
            </span>
            <span className="catblurb">{tr(g.blurb)}</span>
            <span className="listfoot">
              <span />
              <span className="btn">
                {t("startGuide")} {svg(ICON.arrow, 16)}
              </span>
            </span>
          </Link>
        ) : (
          <Link className="listcard" href={`/${category}/${g.id}`} key={g.id}>
            <span className="listtop">
              <span className={`cattile ${cat.tone} small`}>{svg(ICON[cat.icon], 32)}</span>
              <span>
                <span className="badge warm">{t("previewTag")}</span>
                <strong>{tr(g.title)}</strong>
              </span>
            </span>
            <span className="catblurb">{tr(g.blurb)}</span>
          </Link>
        ),
      )}
    </Page>
  );
}

export function PreviewView({ category, preview }: { category: string; preview: PreviewPack }) {
  const { t, tr } = useLanguage();
  const cat = PREVIEW_CATEGORIES[category];
  const questions: StringKey[] = ["q1", "q2", "q3", "q4", "q5", "q6"];
  return (
    <Page>
      <Crumb href={`/${category}`} label={tr(cat.allPreviews)} />
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

interface SourceGroup {
  /** "car", or the id of a category in PREVIEW_CATEGORIES. */
  category: string;
  guides: { id: string; guide: string; checkedIso: string; sources: { title: string; url: string; covers: string }[] }[];
}

/**
 * The sources page: one bar per category. Open a bar to see every live guide
 * in that category and the official pages its rules come from.
 */
export function SourcesView({ groups }: { groups: SourceGroup[] }) {
  const { lang, t, tr } = useLanguage();
  const day = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString(lang === "es" ? "es-US" : lang === "km" ? "km" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  const look = (category: string) => {
    const cat = PREVIEW_CATEGORIES[category];
    return cat ? { name: tr(cat.name), tone: cat.tone as string, icon: ICON[cat.icon] } : { name: t("catAuto"), tone: "blue", icon: ICON.car };
  };
  return (
    <Page>
      <Crumb href="/" label={t("menuAll")} />
      <div className="eyebrow caps">{t("srcEyebrow")}</div>
      <h1 data-focus tabIndex={-1}>
        {t("srcTitle")}
      </h1>
      <p>{t("srcIntro")}</p>
      <p className="muted">{t("srcBody")}</p>
      {groups.map((g, i) => {
        const cat = look(g.category);
        const total = g.guides.reduce((n, x) => n + x.sources.length, 0);
        return (
          <details className="srcgroup" key={g.category} open={i === 0}>
            <summary>
              <span className={`cattile ${cat.tone} small`}>{svg(cat.icon, 26)}</span>
              <span className="srchead">
                <strong>{cat.name}</strong>
                <span className="muted">
                  {g.guides.map((x) => x.guide).join(" · ")} · {t("srcCount", { n: count(total, lang) })}
                </span>
              </span>
            </summary>
            {g.guides.map((x) => (
              <div className="srcguide" key={x.id}>
                <h2>{x.guide}</h2>
                <p className="muted">{t("srcGroupChecked", { date: day(x.checkedIso) })}</p>
                <ul className="src">
                  {x.sources.map((src) => (
                    <li key={src.url}>
                      <a href={src.url}>{src.title}</a>
                      {lang === "en" && <span>{src.covers}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </details>
        );
      })}
    </Page>
  );
}
