import supabase from "../config/supabase.js";

export async function create({
  deviceId,
  windowStart,
  sampleRateHz,
  acceX,
  acceY,
  acceZ,
  gyroX,
  gyroY,
  gyroZ,
}) {
  const { data, error } = await supabase
    .from("motion_readings")
    .insert({
      device_id: deviceId,
      window_start: windowStart,
      sample_rate_hz: sampleRateHz,
      acce_x: acceX,
      acce_y: acceY,
      acce_z: acceZ,
      gyro_x: gyroX,
      gyro_y: gyroY,
      gyro_z: gyroZ,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}