import supabase from "../config/supabase.js";
import runQuery from "../utils/runQuery.js";

export async function create({
  deviceId, windowStart, sampleRateHz, tOffsets,
  acceX, acceY, acceZ, gyroX, gyroY, gyroZ
}) {
  return runQuery(
    supabase
      .from("motion_readings")
      .insert({
        device_id: deviceId,
        window_start: windowStart,
        sample_rate_hz: sampleRateHz,
        t_offsets: tOffsets,
        acce_x: acceX,
        acce_y: acceY,
        acce_z: acceZ,
        gyro_x: gyroX,
        gyro_y: gyroY,
        gyro_z: gyroZ,
      })
      .select("*")
      .single()
  );
}