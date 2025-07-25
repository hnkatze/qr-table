"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard-xR7m9/login')
  }, [])

  return null
}
