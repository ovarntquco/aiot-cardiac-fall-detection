idf_component_register(
    SRCS "task.c" "main.c"
    REQUIRES 
        esp_driver_ledc
    PRIV_REQUIRES
        nvs_flash
        ai_service
        button_
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
