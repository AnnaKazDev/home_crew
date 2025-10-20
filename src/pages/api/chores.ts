import type { APIRoute } from "astro";
import { getCatalogItems } from "@/lib/choresCatalog.service";
import { supabaseClient, type SupabaseClient } from "@/db/supabase.client";
import type { CatalogItemDTO } from "@/types";

export const GET: APIRoute = async () => {
  try {
    const supabase = supabaseClient as SupabaseClient;
    const chores = await getCatalogItems(supabase, "", "predefined");

    // Group by category
    const grouped = chores.reduce(
      (acc, chore) => {
        if (!acc[chore.category]) acc[chore.category] = [];
        acc[chore.category].push(chore);
        return acc;
      },
      {} as Record<string, CatalogItemDTO[]>
    );

    return new Response(
      JSON.stringify({
        chores,
        groupedChores: grouped,
        categories: Object.keys(grouped),
        total: chores.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in /api/chores:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to fetch chores data",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
