idf_component_register(
    SRCS "buzzer.c"
    PRIV_REQUIRES esp_driver_ledc
    INCLUDE_DIRS "include"
)