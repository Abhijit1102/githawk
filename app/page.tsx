import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/module/auth/utils/auth-utils";

export default async function Home() {
  await requireAuth(); // server-side auth check
  redirect("/dashboard"); // server redirect
}

// export default function LandingPage() {
//   return (
//     <main className="min-h-screen bg-black text-white flex flex-col">
//       {/* NAV */}
//       <header className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
//         <h1 className="text-2xl font-bold tracking-tight">GitHawk</h1>

//         <Logout>
//           <Button variant="secondary">Logout</Button>
//         </Logout>
//       </header>

//       {/* HERO */}
//       <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
//         <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
//           See your GitHub work
//           <span className="block text-zinc-400">clearly. Instantly.</span>
//         </h2>

//         <p className="mt-8 text-zinc-400 max-w-2xl text-lg">
//           GitHawk is a developer-first analytics dashboard that turns your
//           GitHub activity into clear insights — without dashboards full of
//           noise, charts you don’t need, or metrics you don’t trust.
//         </p>

//         {/* VALUE POINTS */}
//         <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
//           <div className="border border-zinc-800 rounded-xl p-6 text-left">
//             <h3 className="font-semibold text-lg">📊 Repository Insights</h3>
//             <p className="mt-2 text-sm text-zinc-400">
//               Track commits, PR velocity, and repo health across all your
//               projects in one place.
//             </p>
//           </div>

//           <div className="border border-zinc-800 rounded-xl p-6 text-left">
//             <h3 className="font-semibold text-lg">⚡ PR & Review Focus</h3>
//             <p className="mt-2 text-sm text-zinc-400">
//               Understand how you collaborate — review time, merge speed, and
//               contribution impact.
//             </p>
//           </div>

//           <div className="border border-zinc-800 rounded-xl p-6 text-left">
//             <h3 className="font-semibold text-lg">🧠 Signal over Noise</h3>
//             <p className="mt-2 text-sm text-zinc-400">
//               Designed for developers who care about meaningful metrics, not
//               vanity numbers.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* FOOTER */}
//       <footer className="text-xs text-zinc-500 text-center py-6 border-t border-zinc-800">
//         Built by developers · Powered by GitHub · Designed for clarity
//       </footer>
//     </main>
//   );
// }
