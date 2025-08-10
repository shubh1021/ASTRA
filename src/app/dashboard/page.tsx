import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Welcome to your dashboard!</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is a placeholder page for the authenticated part of the application.</p>
        </CardContent>
      </Card>
    </div>
  );
}
