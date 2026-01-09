"use client";

import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* NAV */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
        {/* LOGO */}
        <div className="flex items-center gap-3">
            {/* Logo box */}
            <div className="bg-white rounded-lg flex items-center justify-center w-10 h-10">
                <Image
                src="/GitHawk.png"
                alt="GitHawk logo"
                width={36}
                height={36}
                priority
                />
            </div>

            {/* Brand name */}
            <h1 className="text-2xl font-bold tracking-tight text-white">
                GitHawk
            </h1>
        </div>


        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg text-sm border border-zinc-700 hover:bg-zinc-900 transition"
          >
            Sign in
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-white text-black font-medium hover:bg-zinc-200 transition"
          >
            <Image
              src="/github.svg"
              alt="GitHub"
              width={16}
              height={16}
            />
            Get started
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          See your GitHub work
          <span className="block text-zinc-400">clearly. Instantly.</span>
        </h2>

        <p className="mt-8 text-zinc-400 max-w-2xl text-lg">
          GitHawk is a developer-first analytics dashboard that turns your
          GitHub activity into clear insights — without noise.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <Feature title="📊 Repository Insights" />
          <Feature title="⚡ PR & Review Focus" />
          <Feature title="🧠 Signal over Noise" />
        </div>

        {/* CTA */}
        <div className="mt-14 flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition"
          >
            <Image
              src="/github.svg"
              alt="GitHub"
              width={20}
              height={20}
            />
            Start free with GitHub
          </Link>

          <Link
            href="/login"
            className="px-8 py-4 rounded-xl border border-zinc-700 hover:bg-zinc-900 transition"
          >
            Sign in
          </Link>
        </div>
      </section>

      <footer className="text-xs text-zinc-500 text-center py-6 border-t border-zinc-800">
        Built by developers · Powered by GitHub
      </footer>
    </main>
  );
}

function Feature({ title }: { title: string }) {
  return (
    <div className="border border-zinc-800 rounded-xl p-6 text-left">
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
  );
}
