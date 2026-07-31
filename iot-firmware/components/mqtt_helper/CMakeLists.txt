idf_component_register(
    SRCS "mqtt_helper.c"
    PRIV_REQUIRES
        mbedtls
        mqtt
        main
    INCLUDE_DIRS "include"
)