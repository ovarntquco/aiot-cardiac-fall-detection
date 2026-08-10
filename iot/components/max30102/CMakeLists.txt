idf_component_register(
    SRCS "max30102_payload.c" "max30102.c"
    REQUIRES esp_driver_i2c
    PRIV_REQUIRES
        esp_driver_i2c
        esp_timer
        main
        time_sync
    INCLUDE_DIRS "include"
)