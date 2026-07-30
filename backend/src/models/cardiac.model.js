import supabase from "../config/supabase";

export async function create({device_id, heart_rate, spo2, recorded_at}) {
    const { data, error } = await supabase
        .from("cardiac_readings")
        .insert({
            device_id: device_id,
            heart_rate: heart_rate,
            spo2: spo2,
            recorded_at: recorded_at
        })
        .select()
        .single()

    if (error) {
        throw new Error(error.message);
    }

    return data;
}