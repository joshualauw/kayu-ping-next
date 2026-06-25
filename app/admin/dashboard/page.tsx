import { auth } from "@/lib/auth"
import { getAuthenticatedUser } from "@/lib/helpers/user"

export default async function DashboardPage() {
  const session = await auth()
  const user = await getAuthenticatedUser(session?.user?.id)

  return <div className="flex flex-col gap-6">Welcome to dashboard ma friend {user?.name}</div>
}
