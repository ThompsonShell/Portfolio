"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import Container from "@/components/ui/Container";
import Icon, { type IconName } from "@/components/ui/Icon";
import { createCoffeeRequest } from "@/lib/api";

const TIMES = ["10:00", "14:00", "16:00", "18:00"];

/** The next three weekdays, offered as quick-pick chips. */
function upcomingDates(count = 3) {
  const dates: Date[] = [];
  const cursor = new Date();
  while (dates.length < count) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) dates.push(new Date(cursor));
  }
  return dates;
}

export default function CoffeePage() {
  const { t, locale } = useLanguage();

  const dates = useMemo(() => upcomingDates(), []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dateIndex, setDateIndex] = useState(1);
  const [time, setTime] = useState("16:00");
  const [online, setOnline] = useState(true);
  const [topic, setTopic] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const formatChipDate = (date: Date) =>
    new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : "en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const date = dates[dateIndex];
    const [hours, minutes] = time.split(":").map(Number);
    const when = new Date(date);
    when.setHours(hours, minutes, 0, 0);

    // The API requires a topic of at least 20 characters, so fall back to a
    // sensible default rather than rejecting an otherwise complete booking.
    const body =
      topic.trim().length >= 20
        ? topic.trim()
        : `${topic.trim()} — ${t.coffee.subtitle}`.trim();

    setSubmitting(true);
    try {
      await createCoffeeRequest(
        {
          name,
          email,
          preferred_datetime: when.toISOString(),
          location: online ? t.coffee.online : t.coffee.offline,
          topic: body,
        },
        locale
      );
      setSubmitted(true);
    } catch {
      setError(t.coffee.failure);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Container className="py-28 text-center">
        <div className="max-w-md mx-auto bg-surface border border-line rounded-3xl shadow-card p-12">
          <div className="text-6xl mb-6">☕</div>
          <h1 className="text-[26px] font-extrabold text-ink tracking-tight">
            {t.coffee.success}
          </h1>
          <Link
            href="/"
            className="mt-8 inline-block px-7 py-3.5 rounded-xl bg-accent text-white text-[14px] font-semibold hover:bg-[#6D28D9] transition-colors"
          >
            {t.notFound.home}
          </Link>
        </div>
      </Container>
    );
  }

  const infoCards = [
    { label: t.coffee.format, value: t.coffee.formatValue, hint: t.coffee.formatHint },
    { label: t.coffee.duration, value: t.coffee.durationValue, hint: t.coffee.durationHint },
    {
      label: t.coffee.price,
      value: t.coffee.priceValue,
      hint: t.coffee.priceHint,
      accent: "text-emerald-600",
    },
    { label: t.coffee.reply, value: t.coffee.replyValue, hint: t.coffee.replyHint },
  ];

  const topicCards: { icon: IconName; tone: string; title: string; desc: string }[] = [
    { icon: "code", tone: "bg-accent-soft text-accent", title: t.coffee.topicCode, desc: t.coffee.topicCodeDesc },
    { icon: "star", tone: "bg-cyan-50 text-cyan-600", title: t.coffee.topicCareer, desc: t.coffee.topicCareerDesc },
    { icon: "book", tone: "bg-amber-50 text-amber-600", title: t.coffee.topicIdea, desc: t.coffee.topicIdeaDesc },
    { icon: "smile", tone: "bg-emerald-50 text-emerald-600", title: t.coffee.topicChat, desc: t.coffee.topicChatDesc },
  ];

  const fieldClass =
    "w-full px-4 py-3 rounded-xl bg-canvas border border-line text-[14px] text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow";

  return (
    <Container className="pb-20">
      {/* Header */}
      <header className="pt-16 pb-12 text-center">
        <span className="inline-block px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-700 text-[12px] font-bold">
          {t.coffee.badge}
        </span>
        <h1 className="mt-6 text-[42px] md:text-[56px] font-extrabold text-ink tracking-tight leading-[1.05] max-w-2xl mx-auto">
          {t.coffee.title}
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-ink-muted max-w-lg mx-auto">
          {t.coffee.subtitle}
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-7 items-start">
        {/* Left: illustration + facts */}
        <div className="space-y-5">
          <div className="bg-surface border border-line rounded-2xl shadow-card h-[290px] grid place-items-center">
            <span className="text-[92px] leading-none" aria-hidden>
              ☕
            </span>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {infoCards.map((card) => (
              <div
                key={card.label}
                className="bg-surface border border-line rounded-2xl shadow-card p-5"
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                  {card.label}
                </div>
                <div
                  className={`mt-2 text-[16px] font-extrabold ${card.accent ?? "text-ink"}`}
                >
                  {card.value}
                </div>
                <div className="mt-1 text-[12px] font-medium text-ink-subtle">
                  {card.hint}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: booking form */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-line rounded-2xl shadow-card p-7 md:p-9"
        >
          <h2 className="text-[22px] font-extrabold text-ink tracking-tight">
            {t.coffee.formTitle}
          </h2>
          <p className="mt-1.5 text-[14px] text-ink-muted">{t.coffee.formSub}</p>

          <div className="mt-7 space-y-6">
            <div>
              <label htmlFor="name" className="block text-[13px] font-bold text-ink mb-2">
                {t.coffee.name}
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.coffee.namePlaceholder}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[13px] font-bold text-ink mb-2">
                {t.coffee.email}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className={fieldClass}
              />
            </div>

            <fieldset>
              <legend className="block text-[13px] font-bold text-ink mb-2">
                {t.coffee.date}
              </legend>
              <div className="grid grid-cols-3 gap-2.5">
                {dates.map((date, i) => (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => setDateIndex(i)}
                    aria-pressed={dateIndex === i}
                    className={`px-2 py-3 rounded-xl text-[13px] font-semibold border transition-colors ${
                      dateIndex === i
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line bg-canvas text-ink-muted hover:text-ink"
                    }`}
                  >
                    {formatChipDate(date)}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="block text-[13px] font-bold text-ink mb-2">
                {t.coffee.time}
              </legend>
              <div className="grid grid-cols-4 gap-2.5">
                {TIMES.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    aria-pressed={time === slot}
                    className={`py-3 rounded-xl text-[13px] font-semibold border transition-colors ${
                      time === slot
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line bg-canvas text-ink-muted hover:text-ink"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="block text-[13px] font-bold text-ink mb-2">
                {t.coffee.formatLabel}
              </legend>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { value: true, label: t.coffee.online },
                  { value: false, label: t.coffee.offline },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setOnline(option.value)}
                    aria-pressed={online === option.value}
                    className={`py-3 rounded-xl text-[13px] font-semibold border transition-colors ${
                      online === option.value
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line bg-canvas text-ink-muted hover:text-ink"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="topic" className="block text-[13px] font-bold text-ink mb-2">
                {t.coffee.topic}
              </label>
              <textarea
                id="topic"
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t.coffee.topicPlaceholder}
                className={`${fieldClass} resize-y`}
              />
            </div>

            {error && (
              <p role="alert" className="text-[13px] font-medium text-signal-red">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-accent text-white text-[15px] font-semibold hover:bg-[#6D28D9] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? t.coffee.submitting : `${t.coffee.submit} →`}
            </button>
          </div>
        </form>
      </div>

      {/* Topics */}
      <section className="mt-14">
        <h2 className="text-[24px] font-extrabold text-ink tracking-tight mb-5">
          {t.coffee.topics}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {topicCards.map((card) => (
            <div
              key={card.title}
              className="bg-surface border border-line rounded-2xl shadow-card p-6"
            >
              <span
                className={`w-10 h-10 rounded-xl grid place-items-center mb-4 ${card.tone}`}
              >
                <Icon name={card.icon} size={18} />
              </span>
              <h3 className="text-[15px] font-extrabold text-ink">{card.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
