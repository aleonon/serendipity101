import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Entrar | Serendipity",
  description: "Entra a tu cuenta de Serendipity.",
}

export default function Login() {
  return <LoginTemplate />
}
