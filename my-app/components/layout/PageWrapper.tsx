// 3. layout/PageWrapper.tsx
import { ReactNode } from "react"
import { Navbar } from "./Navbar"
import { FooterNav } from "./FooterNav"

export function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20">{children}</main>
      <FooterNav />
    </div>
  )
}