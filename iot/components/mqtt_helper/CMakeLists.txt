idf_component_register(
    SRCS "mqtt_helper.c"
    PRIV_REQUIRES
        json_helper
        main
        max30102
        mbedtls
    REQUIRES mqtt
    INCLUDE_DIRS "include"
)