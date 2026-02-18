import { authorizedOfetch } from "./authorizedOfetch";

export async function getHealth(): Promise<boolean> {
  try {
    await authorizedOfetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/health",
    );
    return true;
  } catch {
    return false;
  }
}
