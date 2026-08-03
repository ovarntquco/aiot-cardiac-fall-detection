idf_component_register(
    SRCS "main.c" "task.c"
    REQUIRES 
        esp_driver_ledc
    PRIV_REQUIRES
        nvs_flash
        button_helper
        buzzer
        json_helper
        led
        max30102
        mpu6050
        mqtt_helper
        network_prov_helper
        nmea_parser
        time_sync
    INCLUDE_DIRS "."
)
