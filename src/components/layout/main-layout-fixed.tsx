import { DynamicHeader } from "./dynamic-header"
import { DynamicFooter } from "./dynamic-footer"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <DynamicHeader />
      <main className="flex-1">
        {children}
      </main>
      <DynamicFooter />
    </div>
  )
}