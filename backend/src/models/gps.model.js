import supabase from "../config/supabase"

export async function findLatest(device_id) {
    const { data, error } = await supabase
        .from("gps_readings")
        .select('*')
        .eq("device_id", device_id)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        throw new Error(error.message);
    }

    return data;
}