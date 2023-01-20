import { redirect, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "./useQuery";
import { nanoid } from "nanoid";

export function useUserQuery(): string | undefined {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = useQuery("userId");

  if (!userId) {
    const newUserId = nanoid();
    searchParams.set("userId", newUserId);

    console.log(`/room?${searchParams.toString()}`);

    redirect(`room?${searchParams.toString()}`);
  }

  return userId;
}
