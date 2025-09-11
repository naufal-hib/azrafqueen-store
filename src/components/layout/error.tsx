import { AlertCircle, Home, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface ErrorComponentProps {
  title?: string
  message?: string
  showHomeButton?: boolean
  showRetryButton?: boolean
  onRetry?: () => void
}

export function ErrorComponent({
  title = "Oops! Something went wrong",
  message = "We're sorry, but something unexpected happened. Please try again.",
  showHomeButton = true,
  showRetryButton = false,
  onRetry
}: ErrorComponentProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
            {showRetryButton && onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            {showHomeButton && (
              <Button variant="outline" asChild className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Error untuk 404 Not Found
export function NotFoundError() {
  return (
    <ErrorComponent
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      showHomeButton={true}
    />
  )
}

// Error untuk server error
export function ServerError() {
  return (
    <ErrorComponent
      title="Server Error"
      message="We're experiencing some technical difficulties. Please try again later."
      showHomeButton={true}
      showRetryButton={true}
      onRetry={() => window.location.reload()}
    />
  )
}

// Error untuk network error
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorComponent
      title="Connection Error"
      message="Please check your internet connection and try again."
      showHomeButton={true}
      showRetryButton={true}
      onRetry={onRetry}
    />
  )
}