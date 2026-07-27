import { useState } from "react";
import { useLocation } from "wouter";
import { signIn } from "@/lib/auth";
import { msalConfig } from "@/lib/msalConfig";

type Step = "email" | "redirect" | "error";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [step, setStep]   = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleNext() {
    if (!email.trim()) {
      setError("Enter your email address to continue.");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setStep("redirect");

    try {
      await new Promise((r) => setTimeout(r, 1100));
      await signIn(email.trim());
      navigate("/dashboard");
    } catch (e: unknown) {
      setError((e as Error).message ?? "Sign-in failed. Please try again.");
      setStep("error");
    }
  }

  if (step === "redirect") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2f1]">
        <div className="bg-white rounded shadow-md w-full max-w-sm px-8 py-10 text-center">
          <MicrosoftLogo className="mx-auto mb-5" />
          <p className="text-sm font-medium text-gray-800 mb-1">Signing you in…</p>
          <p className="text-xs text-gray-400 mb-6 truncate">{email}</p>
          <div className="flex justify-center">
            <span className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="mt-5 text-[11px] text-gray-300">
            Connecting to {msalConfig.auth.authority.replace("https://", "")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f2f1]">
      <div className="bg-white rounded shadow-md w-full max-w-sm px-8 py-10">
        <MicrosoftLogo className="mb-7" />

        <h1 className="text-[22px] font-light text-gray-900 mb-1">Sign in</h1>
        <p className="text-sm text-gray-500 mb-5">to continue to Client Operations Portal</p>

        {(error || step === "error") && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error || "An error occurred. Please try again."}
          </div>
        )}

        <div className="mb-4">
          <input
            id="email"
            type="email"
            placeholder="Email, phone, or Skype"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleNext()}
            autoFocus
            className="w-full border-0 border-b border-gray-400 focus:border-blue-600 px-0 py-2 text-sm outline-none bg-transparent placeholder-gray-400 transition-colors"
          />
        </div>

        <p className="text-[12px] text-gray-500 mb-6">
          No account?{" "}
          <span className="text-blue-600 cursor-default">Create one!</span>
        </p>

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="px-7 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            Next
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-gray-200 flex items-center justify-between">
          <button className="text-xs text-blue-600 hover:underline">Sign-in options</button>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <span>© Microsoft 2024</span>
            <span>·</span>
            <button className="hover:underline">Privacy</button>
            <span>·</span>
            <button className="hover:underline">Terms</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MicrosoftLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0"  y="0"  width="10" height="10" fill="#F25022"/>
        <rect x="11" y="0"  width="10" height="10" fill="#7FBA00"/>
        <rect x="0"  y="11" width="10" height="10" fill="#00A4EF"/>
        <rect x="11" y="11" width="10" height="10" fill="#FFB900"/>
      </svg>
      <span className="text-sm font-semibold text-gray-700 tracking-tight">Microsoft</span>
    </div>
  );
}
