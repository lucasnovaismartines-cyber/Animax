import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: false,
    error:
      "A verificação agora é feita por captcha no cadastro/login. Esta rota não é mais utilizada.",
  });
}

