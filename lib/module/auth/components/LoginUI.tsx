"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";
import Image from "next/image";

const LoginUI = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      await signIn.social({ provider: "github", callbackURL: "/" });
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white">
      
      {/* LEFT — BLACK BRAND PANEL */}
      <div className="hidden md:flex flex-col justify-center items-center bg-black text-white px-14">
        <h1 className="text-6xl font-extrabold tracking-tight">
          GitHawk
        </h1>

        <p className="mt-6 text-zinc-400 text-center max-w-md leading-relaxed">
          A focused GitHub analytics and workflow dashboard built for
          developers who care about clarity, speed, and impact.
        </p>

        <ul className="mt-10 space-y-4 text-zinc-300 text-sm">
          <li>• Track repositories, PRs, and commits in one place</li>
          <li>• Visual insights into your coding activity</li>
          <li>• Designed for deep focus, not noise</li>
        </ul>

        <p className="mt-12 text-xs text-zinc-500">
          Built for developers. Powered by GitHub.
        </p>
      </div>

      {/* RIGHT — WHITE LOGIN PANEL */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-10">
          
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src="/GitHawk.png"
              alt="GitHawk logo"
            />
          </div>

          {/* Mobile Brand */}
          <div className="md:hidden text-center space-y-2">
            <h1 className="text-4xl font-bold text-black">GitHawk</h1>
            <p className="text-sm text-zinc-500">
              GitHub insights, simplified.
            </p>
          </div>

          {/* Login Copy */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-black">
              Sign in to your workspace
            </h2>
            <p className="text-sm text-zinc-500">
              Use your GitHub account to continue.
            </p>
          </div>

          {/* GitHub Button */}
          <button
            onClick={handleGithubLogin}
            disabled={isLoading}
            className="group w-full flex items-center justify-center gap-3 rounded-xl border border-black px-4 py-3 text-sm font-medium text-black hover:bg-black hover:text-white transition-all disabled:opacity-60"
          >
            <Image
              src="/github.svg"
              alt="GitHub"
              width={20}
              height={20}
              className="group-hover:invert transition"
            />
            {isLoading ? "Signing in..." : "Continue with GitHub"}
          </button>

          {/* Footer Copy */}
          <p className="text-xs text-zinc-500 text-center leading-relaxed">
            By continuing, you agree to GitHawk’s Terms of Service and
            acknowledge our Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginUI;
