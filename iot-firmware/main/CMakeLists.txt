idf_component_register(
    SRCS "main.c" "task.c"
    PRIV_REQUIRES mpu6050 network_prov_helper mqtt_helper nvs_flash json_helper time_sync
    INCLUDE_DIRS "."
)
