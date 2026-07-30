import supabase from "../config/supabase.js";

export async function findLatest(id) {
    const { data, error } = await supabase
        .from("gps_readings")
        .select("*")
        .order("recorded_at", {ascending: false})
        .limit(1)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

export async function create({device_id, latitude, longitude, recorded_at}) {
    const { data, error } = await supabase
        .from("gps_readings")
        .insert({
            device_id: device_id,
            latitude: latitude,
            longitude: longitude,
            recorded_at: recorded_at
        })
        .select()
        .single()

    if (error) {
        throw new Error(error.message);
    };

    return data;
}