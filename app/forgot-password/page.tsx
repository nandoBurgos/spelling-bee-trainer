import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { BookOpen } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>SpellMaster</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <ForgotPasswordForm />
      </main>
    </div>
  )
}
